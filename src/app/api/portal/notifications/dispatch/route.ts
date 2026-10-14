import { timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";
import { portalAdminClient } from "@/lib/portal/supabase";
import { serverLog } from "@/lib/server-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OutboxItem = {
  id: string;
  user_id: string;
  event_type: string;
  payload: { engagement_id?: string };
  channel: "email" | "whatsapp";
  attempt_count: number;
};

const subjects: Record<string, string> = {
  new_document: "A project document is available",
  message: "There is an update in your project conversation",
  milestone_change: "A project milestone has been updated",
  invoice_issued: "A project invoice is available",
  invoice_overdue: "There is an update about a project invoice",
  supervision_issue: "There is a project update for your review",
};

function authorized(request: Request) {
  const secret = process.env.PORTAL_NOTIFICATION_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !supplied) return false;
  const expectedBytes = Buffer.from(secret);
  const suppliedBytes = Buffer.from(supplied);
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes);
}

export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Not found." }, { status: 404 });
  let limit = 25;
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body?.limit === "number") limit = Math.max(1, Math.min(100, Math.floor(body.limit)));
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;
  const mailConfigured = Boolean(host && user && password && from && Number.isInteger(port));
  const transport = mailConfigured
    ? nodemailer.createTransport({ host, port, secure: port === 465, requireTLS: port !== 465, auth: { user, pass: password }, connectionTimeout: 10000, socketTimeout: 15000 })
    : null;

  try {
    const admin = portalAdminClient();
    const { data, error } = await admin.rpc("portal_claim_notifications", { p_limit: limit });
    if (error) throw error;
    const items = (data ?? []) as OutboxItem[];
    let sent = 0;
    let failed = 0;
    let notConfigured = 0;

    for (const item of items) {
      let success = false;
      let unconfigured = false;
      try {
        if (item.channel !== "email" || !transport || !from) {
          unconfigured = true;
        } else {
          const [account, engagement] = await Promise.all([
            admin.auth.admin.getUserById(item.user_id),
            item.payload.engagement_id
              ? admin.from("engagements").select("name").eq("id", item.payload.engagement_id).maybeSingle()
              : Promise.resolve({ data: null, error: null }),
          ]);
          if (account.error) throw account.error;
          const email = account.data.user?.email;
          if (!email) throw new Error("Notification recipient has no email address.");
          const subject = subjects[item.event_type] ?? "There is an update in your Dreniak Client Portal";
          const project = engagement.data?.name ? ` for ${engagement.data.name}` : "";
          const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://dreniak.com"}/portal`;
          const result = await transport.sendMail({
            from,
            to: email,
            subject,
            text: `${subject}${project}. Sign in to the Dreniak Client Portal to view the update: ${portalUrl}\n\nThis email contains no project documents or message content.`,
          });
          success = Boolean(result.accepted?.length);
          if (!success) throw new Error("SMTP recipient was not accepted.");
        }
      } catch (error) {
        failed += 1;
        serverLog("error", "portal.notification_delivery_failed", { channel: item.channel, eventType: item.event_type, code: (error as { code?: string })?.code });
      }

      if (success) sent += 1;
      if (unconfigured) notConfigured += 1;
      const { error: finishError } = await admin.rpc("portal_finish_notification", {
        p_id: item.id,
        p_success: success,
        p_not_configured: unconfigured,
      });
      if (finishError) {
        serverLog("error", "portal.notification_state_failed", { channel: item.channel, eventType: item.event_type });
        failed += 1;
      }
    }

    return Response.json({ claimed: items.length, sent, failed, notConfigured }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    serverLog("error", "portal.notification_dispatch_failed", { code: (error as { code?: string })?.code });
    return Response.json({ error: "Notification dispatch is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
