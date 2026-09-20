const retryDelays = [250, 750, 1500];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ButtondownFailureReason =
  | "authentication"
  | "rate_limit"
  | "server"
  | "network"
  | "configuration"
  | "suppressed"
  | "unknown";

function classifyButtondownFailure(status?: number, code?: string): ButtondownFailureReason {
  if (status === 401 || status === 403) return "authentication";
  if (status === 429) return "rate_limit";
  if (status !== undefined && status >= 500) return "server";
  if (code === "subscriber_suppressed") return "suppressed";
  return status === undefined ? "network" : "unknown";
}

export async function sendButtondownSubscriber(email: string) {
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  const baseUrl = process.env.BUTTONDOWN_API_BASE_URL || "https://api.buttondown.email/v1";
  if (!apiKey) {
    return { ok: false as const, reason: "configuration" as const };
  }
  let endpoint: URL;
  try {
    endpoint = new URL(`${baseUrl.replace(/\/+$/, "")}/subscribers`);
    if (endpoint.protocol !== "https:") throw new Error("HTTPS is required");
  } catch {
    return { ok: false as const, reason: "configuration" as const };
  }

  for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
          "X-Buttondown-Collision-Behavior": "add",
        },
        body: JSON.stringify({ email_address: email }),
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok) return { ok: true as const, duplicate: false };
      const text = await response.text();
      let code: string | undefined;
      try {
        const body = JSON.parse(text) as { code?: string; detail?: string };
        code = body.code || body.detail;
      } catch {
        code = text;
      }
      if (
        response.status === 400 &&
        /already|duplicate|collision|subscriber_exists/i.test(code || text)
      ) {
        return { ok: true as const, duplicate: true };
      }
      const reason = classifyButtondownFailure(response.status, code);
      if (!["rate_limit", "server"].includes(reason) || attempt === retryDelays.length) {
        return { ok: false as const, reason, status: response.status };
      }
    } catch {
      if (attempt === retryDelays.length) {
        return { ok: false as const, reason: "network" as const };
      }
    }
    await sleep(retryDelays[attempt]);
  }
  return { ok: false as const, reason: "unknown" as const };
}

