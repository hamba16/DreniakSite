type LogLevel = "info" | "warn" | "error";

export function serverLog(
  level: LogLevel,
  event: string,
  details: Record<string, unknown> = {},
) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...details,
  });
  process.stderr.write(`${line}\n`);
}
