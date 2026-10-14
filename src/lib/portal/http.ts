import { z } from "zod";
import { readSubmission } from "@/lib/intake";

export const portalEmailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());

export async function readPortalJson(request: Request) {
  const origin = request.headers.get("origin");
  const actual = new URL(request.url);
  if (!origin || origin !== actual.origin)
    return { error: "This request could not be accepted.", status: 403 } as const;
  const result = await readSubmission(request);
  if ("error" in result) return result;
  if (!result.data || typeof result.data !== "object" || Array.isArray(result.data))
    return { error: "Please check the submitted information.", status: 400 } as const;
  return result;
}

export function privateJson(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
