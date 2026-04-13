export function toDisplayVersion(version: string): string {
  const [major, minor] = version.trim().split(".");

  if (!major || !minor) {
    return version.trim();
  }

  return `${major}.${minor}`;
}
