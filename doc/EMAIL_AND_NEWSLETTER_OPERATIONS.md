# Email and newsletter production verification

## Enquiry delivery

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` and `SMTP_FROM` in the server environment. Port `587` uses STARTTLS; port `465` uses direct TLS. The application always sends to `info@dreniak.com` and sets `Reply-To` to the submitted address.

After deployment, submit a real enquiry and verify receipt, reply behavior, SPF/DKIM/DMARC alignment, inbox placement and the failure path. Server logs emit structured events for validation, rate limiting, missing configuration, authentication failures, network failures and successful delivery. Logs must not be exposed to visitors.

## Newsletter storage

Prefer an HTTPS webhook backed by durable storage. Set `NEWSLETTER_WEBHOOK_URL`, `NEWSLETTER_WEBHOOK_TOKEN` and, when supported by the receiver, `NEWSLETTER_WEBHOOK_SECRET`. Requests include an idempotency key derived from the normalized email, a timestamp, and an HMAC-SHA256 signature over `timestamp.payload` when the secret is configured. Transient webhook failures are retried with bounded backoff.

The receiver must deduplicate the idempotency key and provide access-controlled unsubscribe, deletion and export handling. Do not use filesystem storage on ephemeral/serverless hosting. Set `NEXT_PUBLIC_NEWSLETTER_ENABLED=false` to hide the signup UI until storage is verified.
