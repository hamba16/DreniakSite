import { checkHomepageTraffic } from "@/lib/traffic-guard";

export const dynamic = "force-dynamic";
let missingSecretLogged = false;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (!missingSecretLogged) {
      missingSecretLogged = true;
      console.error("Homepage traffic monitor is not configured: CRON_SECRET is missing.");
    }
    return Response.json({ status: "degraded", reason: "Monitor is not configured." }, { headers: { "Cache-Control": "no-store" } });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const report = await checkHomepageTraffic();
    if (report.exceeded) {
      const message = `Homepage traffic alert: yesterday=${report.yesterday}, 7-day daily average=${report.baseline.toFixed(1)}, alert threshold=${report.threshold}.`;
      console.error(message);
      const webhook = process.env.TRAFFIC_ALERT_WEBHOOK_URL;
      if (webhook) {
        const response = await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: message }),
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`Traffic alert webhook returned HTTP ${response.status}.`);
      }
    }
    return Response.json(report, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Homepage traffic monitor failed.", error);
    return Response.json({ status: "degraded", reason: "Traffic monitor failed." }, { headers: { "Cache-Control": "no-store" } });
  }
}
