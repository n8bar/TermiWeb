import fs from "node:fs";
import path from "node:path";

export type PlanMilestone = {
  code: string;
  title: string;
  summary: string;
  start: string;
  end: string;
  endLabel: "End" | "Target End";
  completed: boolean;
};

type PendingMilestone = Partial<PlanMilestone> & Pick<PlanMilestone, "code" | "title" | "completed">;

const milestoneHeaderPattern = /^- \[(?<done>[ x])\] (?<code>M\d+): (?<title>.+)$/u;
const summaryPattern = /^\s+- Summary: (?<value>.+)$/u;
const startPattern = /^\s+- Start: (?<value>\d{4}-\d{2}-\d{2})$/u;
const endPattern = /^\s+- (?<label>End|Target End): (?<value>\d{4}-\d{2}-\d{2})$/u;

function requireMilestoneField<K extends keyof PlanMilestone>(
  milestone: PendingMilestone,
  field: K,
): PlanMilestone[K] {
  const value = milestone[field];
  if (!value) {
    throw new Error(`Milestone ${milestone.code} is missing ${field} in docs/PLAN.md`);
  }

  return value as PlanMilestone[K];
}

function finalizeMilestone(milestones: PlanMilestone[], milestone: PendingMilestone | undefined) {
  if (!milestone) {
    return;
  }

  milestones.push({
    code: milestone.code,
    title: milestone.title,
    completed: milestone.completed,
    summary: requireMilestoneField(milestone, "summary"),
    start: requireMilestoneField(milestone, "start"),
    end: requireMilestoneField(milestone, "end"),
    endLabel: requireMilestoneField(milestone, "endLabel"),
  });
}

export function parseMilestonesFromPlan(planText: string): PlanMilestone[] {
  const milestones: PlanMilestone[] = [];
  const lines = planText.split(/\r?\n/u);
  let currentMilestone: PendingMilestone | undefined;

  for (const line of lines) {
    const headerMatch = line.match(milestoneHeaderPattern);
    if (headerMatch?.groups) {
      const code = headerMatch.groups.code;
      const title = headerMatch.groups.title;

      if (!code || !title) {
        throw new Error(`Invalid milestone header in docs/PLAN.md: ${line}`);
      }

      finalizeMilestone(milestones, currentMilestone);
      currentMilestone = {
        code,
        title: title.trim(),
        completed: headerMatch.groups.done === "x",
      };
      continue;
    }

    if (!currentMilestone) {
      continue;
    }

    const summaryMatch = line.match(summaryPattern);
    if (summaryMatch?.groups) {
      const summary = summaryMatch.groups.value;
      if (!summary) {
        throw new Error(`Invalid milestone summary in docs/PLAN.md: ${line}`);
      }

      currentMilestone.summary = summary.trim();
      continue;
    }

    const startMatch = line.match(startPattern);
    if (startMatch?.groups) {
      const start = startMatch.groups.value;
      if (!start) {
        throw new Error(`Invalid milestone start date in docs/PLAN.md: ${line}`);
      }

      currentMilestone.start = start;
      continue;
    }

    const endMatch = line.match(endPattern);
    if (endMatch?.groups) {
      const endLabel = endMatch.groups.label;
      const end = endMatch.groups.value;

      if (!endLabel || !end) {
        throw new Error(`Invalid milestone end date in docs/PLAN.md: ${line}`);
      }

      currentMilestone.endLabel = endLabel as PlanMilestone["endLabel"];
      currentMilestone.end = end;
    }
  }

  finalizeMilestone(milestones, currentMilestone);
  return milestones;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/gu, "\\\\")
    .replace(/\r?\n/gu, "\\n")
    .replace(/;/gu, "\\;")
    .replace(/,/gu, "\\,");
}

function foldIcsLine(line: string): string {
  const chunks: string[] = [];
  let remaining = line;

  while (remaining.length > 75) {
    chunks.push(remaining.slice(0, 75));
    remaining = ` ${remaining.slice(75)}`;
  }

  chunks.push(remaining);
  return chunks.join("\r\n");
}

function formatTextProperty(name: string, value: string): string {
  return foldIcsLine(`${name}:${escapeIcsText(value)}`);
}

function formatDateStamp(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  const hours = String(value.getUTCHours()).padStart(2, "0");
  const minutes = String(value.getUTCMinutes()).padStart(2, "0");
  const seconds = String(value.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function formatAllDayDate(value: string): string {
  return value.replace(/-/gu, "");
}

function addDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function renderMilestonesIcs(milestones: PlanMilestone[], generatedAt = new Date()): string {
  const stamp = formatDateStamp(generatedAt);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TermiWeb//Milestones//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    formatTextProperty("X-WR-CALNAME", "TermiWeb Milestones"),
    formatTextProperty("X-WR-CALDESC", "Milestone dates derived from docs/PLAN.md"),
  ];

  for (const milestone of milestones) {
    const endLabel = milestone.endLabel === "Target End" ? "Target end" : "End";
    const description = `${milestone.summary}\nStart: ${milestone.start}\n${endLabel}: ${milestone.end}`;

    lines.push(
      "BEGIN:VEVENT",
      `UID:termiweb-${milestone.code.toLowerCase()}@termiweb.local`,
      `DTSTAMP:${stamp}`,
      formatTextProperty("SUMMARY", `${milestone.code}: ${milestone.title}`),
      `DTSTART;VALUE=DATE:${formatAllDayDate(milestone.start)}`,
      `DTEND;VALUE=DATE:${formatAllDayDate(addDays(milestone.end, 1))}`,
      formatTextProperty("DESCRIPTION", description),
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function writeMilestonesIcs(options: {
  planPath: string;
  outputPath: string;
  generatedAt?: Date;
}): PlanMilestone[] {
  const planText = fs.readFileSync(options.planPath, "utf8");
  const milestones = parseMilestonesFromPlan(planText);
  const content = renderMilestonesIcs(milestones, options.generatedAt);

  fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });
  fs.writeFileSync(options.outputPath, content, "utf8");

  return milestones;
}
