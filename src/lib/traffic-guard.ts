let lastCounterErrorAt = 0;

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function redis<T>(command: unknown[]): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash Redis REST credentials are missing.");
  const response = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([command]),
    cache: "no-store",
    signal: AbortSignal.timeout(1500),
  });
  if (!response.ok) throw new Error(`Upstash returned HTTP ${response.status}.`);
  const payload = await response.json() as Array<{ result?: T; error?: string }>;
  if (!payload[0] || payload[0].error) throw new Error(payload[0]?.error || "Upstash returned an empty response.");
  return payload[0].result as T;
}

export async function recordHomepageRequest(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const dailyIncrement = await redis<number>(["INCR", `traffic:home:daily:${today}`]);
    if (dailyIncrement === 1) {
      await redis<number>(["EXPIRE", `traffic:home:daily:${today}`, "1209600"]);
    }
  } catch (error) {
    const now = Date.now();
    if (now - lastCounterErrorAt >= 60_000) {
      lastCounterErrorAt = now;
      console.error("Homepage traffic counter is degraded; serving the homepage without a stored count.", error);
    }
  }
}

export async function checkHomepageTraffic(): Promise<{
  yesterday: number;
  baseline: number;
  threshold: number;
  exceeded: boolean;
}> {
  const now = new Date();
  const keys: string[] = [];
  for (let daysAgo = 1; daysAgo <= 8; daysAgo += 1) {
    const day = new Date(now);
    day.setUTCDate(day.getUTCDate() - daysAgo);
    keys.push(`traffic:home:daily:${day.toISOString().slice(0, 10)}`);
  }
  const counts = await redis<Array<string | number | null>>(["MGET", ...keys]);
  const yesterday = Number(counts[0] || 0);
  const history = counts.slice(1).map((value) => Number(value || 0));
  const baseline = history.reduce((sum, value) => sum + value, 0) / history.length;
  const multiplier = Number(process.env.TRAFFIC_ALERT_MULTIPLIER || "5");
  if (!Number.isFinite(multiplier) || multiplier <= 0) throw new Error("TRAFFIC_ALERT_MULTIPLIER must be positive.");
  const minimum = positiveInteger(process.env.TRAFFIC_ALERT_MIN_REQUESTS, 1000);
  const threshold = Math.max(minimum, Math.ceil(baseline * multiplier));
  return { yesterday, baseline, threshold, exceeded: yesterday > threshold };
}
