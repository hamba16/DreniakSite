import nodemailer from "nodemailer";
import {
  enquirySchema,
  readSubmission,
  consumeLimit,
  requestKey,
} from "@/lib/intake";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const body = await readSubmission(request);
  if ("error" in body)
    return Response.json({ error: body.error }, { status: body.status });
  const parsed = enquirySchema.safeParse(body.data);
  if (!parsed.success)
    return Response.json(
      {
        error:
          "Please check your name, email, message (at least 20 characters) and consent.",
      },
      { status: 400 },
    );
  if (parsed.data.website)
    return Response.json(
      { error: "This submission could not be accepted." },
      { status: 400 },
    );
  if (!consumeLimit(requestKey(request, "enquiry")))
    return Response.json(
      {
        error:
          "Too many attempts. Please wait ten minutes or email info@dreniak.com.",
      },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } =
    process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM)
    return Response.json(
      {
        error:
          "Online enquiry delivery is not available yet. Please email info@dreniak.com directly.",
      },
      { status: 503 },
    );
  const d = parsed.data;
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
    if (!result.accepted?.length) throw new Error("Recipient not accepted");
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      {
        error:
          "Your enquiry could not be delivered. Please email info@dreniak.com directly.",
      },
      { status: 502 },
    );
  }
}
