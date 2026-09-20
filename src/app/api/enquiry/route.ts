import { consumePublicLimit } from "@/lib/public-rate-limit";
import nodemailer from "nodemailer";
import {
  enquirySchema,
  readSubmission,
  requestKey,
} from "@/lib/intake";
import { serverLog } from "@/lib/server-log";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const body = await readSubmission(request);
  if ("error" in body) {
    serverLog("warn", "enquiry.rejected", { reason: "request", status: body.status });
    return Response.json({ error: body.error }, { status: body.status });
  }
  const parsed = enquirySchema.safeParse(body.data);
  if (!parsed.success) {
    serverLog("warn", "enquiry.rejected", { reason: "validation", status: 400 });
    return Response.json(
      {
        error:
          "Please check your name, email, message (at least 20 characters) and consent.",
      },
      { status: 400 },
    );
  }
  if (parsed.data.website) {
    serverLog("warn", "enquiry.rejected", { reason: "honeypot", status: 400 });
    return Response.json(
      { error: "This submission could not be accepted." },
      { status: 400 },
    );
  }
  const allowed = await consumePublicLimit(requestKey(request, "enquiry"));
  if (allowed === null) return Response.json({ error: "Submissions are temporarily unavailable. Please try again later." }, { status: 503 });
  if (!allowed) {
    serverLog("warn", "enquiry.rejected", { reason: "rate_limit", status: 429 });
    return Response.json(
      {
        error:
          "Too many attempts. Please wait ten minutes or email info@dreniak.com.",
      },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  }
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } =
    process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
    serverLog("error", "enquiry.delivery_unavailable", {
      reason: "missing_smtp_configuration",
    });
    return Response.json(
      {
        error:
          "Online enquiry delivery is not available yet. Please email info@dreniak.com directly.",
      },
      { status: 503 },
    );
  }
  const d = parsed.data;
  serverLog("info", "enquiry.send_attempt", { division: d.division });
  try {
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: SMTP_PORT === "465",
      requireTLS: SMTP_PORT !== "465",
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
      connectionTimeout: 10000,
      socketTimeout: 15000,
    });
    const result = await transport.sendMail({
      from: SMTP_FROM,
      to: "info@dreniak.com",
      replyTo: d.email,
      subject: `Website enquiry — ${d.division}`,
      text: `For the attention of Darren Kamunuga\n\nName: ${d.name}\nEmail: ${d.email}\nOrganisation: ${d.organisation}\nDivision: ${d.division}\nInterest: ${d.interest}\nContext: ${d.context}\n\n${d.message}\n\nConsent to respond: granted`,
    });
    if (!result.accepted?.length) {
      serverLog("error", "enquiry.delivery_failed", {
        reason: "recipient_not_accepted",
        division: d.division,
      });
      return Response.json(
        { error: "Your enquiry could not be delivered. Please email info@dreniak.com directly." },
        { status: 502 },
      );
    }
    serverLog("info", "enquiry.delivered", { division: d.division });
    return Response.json({ ok: true });
  } catch (error) {
    const smtpError = error as { code?: string; responseCode?: number; message?: string };
    const reason =
      smtpError.code === "EAUTH" || smtpError.responseCode === 535
        ? "authentication"
        : smtpError.code === "ETIMEDOUT" || smtpError.code === "ECONNECTION"
          ? "network"
          : "transport";
    serverLog("error", "enquiry.delivery_failed", {
      reason,
      code: smtpError.code,
      responseCode: smtpError.responseCode,
      message: smtpError.message,
      division: d.division,
    });
    return Response.json(
      {
        error:
          "Your enquiry could not be delivered. Please email info@dreniak.com directly.",
      },
      { status: 502 },
    );
  }
}
