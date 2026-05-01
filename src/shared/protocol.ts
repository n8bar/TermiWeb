import { z } from "zod";

export const terminalStatusSchema = z.enum([
  "stopped",
  "starting",
  "running",
  "exited",
  "error",
]);

const fixedColsSchema = z.number().int().min(20).max(240);
const fixedRowsSchema = z.number().int().min(1).max(400);

export const sessionSummarySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(64),
  status: terminalStatusSchema,
  clientCount: z.number().int().min(0),
  shell: z.string().nullable(),
  lastExitCode: z.number().int().nullable(),
  fixedCols: fixedColsSchema,
  fixedRows: fixedRowsSchema,
});

export const sessionSnapshotSchema = z.object({
  session: sessionSummarySchema,
  history: z.string(),
});

const sizeFields = {
  cols: z.number().int().min(10).max(500),
  rows: z.number().int().min(1).max(400),
};

export const clientEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ping"),
  }),
  z.object({
    type: z.literal("session/list.request"),
  }),
  z.object({
    type: z.literal("session/snapshot.request"),
    sessionId: z.string().uuid(),
  }),
  z.object({
    type: z.literal("session/create"),
    title: z.string().trim().min(1).max(64).optional(),
  }),
  z.object({
    type: z.literal("session/close"),
    sessionId: z.string().uuid(),
  }),
  z.object({
    type: z.literal("session/select"),
    sessionId: z.string().uuid(),
    ...sizeFields,
  }),
  z.object({
    type: z.literal("terminal/input"),
    sessionId: z.string().uuid(),
    data: z.string(),
  }),
  z.object({
    type: z.literal("terminal/resize"),
    sessionId: z.string().uuid(),
    ...sizeFields,
  }),
  z.object({
    type: z.literal("session/cols"),
    sessionId: z.string().uuid(),
    cols: fixedColsSchema,
    rows: sizeFields.rows,
  }),
]);

export const serverEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("pong"),
  }),
  z.object({
    type: z.literal("error"),
    message: z.string(),
  }),
  z.object({
    type: z.literal("session/list"),
    sessions: z.array(sessionSummarySchema),
    activeSessionId: z.string().uuid().nullable(),
  }),
  z.object({
    type: z.literal("session/created"),
    session: sessionSummarySchema,
  }),
  z.object({
    type: z.literal("session/snapshot"),
    snapshot: sessionSnapshotSchema,
  }),
  z.object({
    type: z.literal("session/output"),
    sessionId: z.string().uuid(),
    data: z.string(),
  }),
]);

export type TerminalStatus = z.infer<typeof terminalStatusSchema>;
export type SessionSummary = z.infer<typeof sessionSummarySchema>;
export type SessionSnapshot = z.infer<typeof sessionSnapshotSchema>;
export type ClientEvent = z.infer<typeof clientEventSchema>;
export type ServerEvent = z.infer<typeof serverEventSchema>;

export function parseClientEvent(raw: unknown): ClientEvent {
  return clientEventSchema.parse(raw);
}

export function parseServerEvent(raw: unknown): ServerEvent {
  return serverEventSchema.parse(raw);
}
