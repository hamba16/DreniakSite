import { z } from "zod";
import { consumePublicLimit } from "@/lib/public-rate-limit";
import { requestKey } from "@/lib/intake";
import { privateJson, readPortalJson } from "@/lib/portal/http";
import { portalAdminClient, portalClient } from "@/lib/portal/supabase";
const schema = z.object({ action: z.enum(["new_thread", "reply", "request"]), engagementId: z.string().uuid(), threadId: z.string().uuid().optional(), subject: z.string().trim().min(1).max(200).optional(), body: z.string().trim().min(1).max(10000), requestType: z.enum(["information", "site_visit", "variation_query", "general"]).optional() });
export async function POST(request: Request) {
 const parsedBody=await readPortalJson(request); if("error" in parsedBody) return privateJson({error:parsedBody.error},parsedBody.status); const parsed=schema.safeParse(parsedBody.data); if(!parsed.success) return privateJson({error:"Check your message and try again."},400);
 const allowed=await consumePublicLimit(requestKey(request,"portal_message")); if(allowed===null) return privateJson({error:"Messaging is temporarily unavailable."},503); if(!allowed) return privateJson({error:"Too many messages. Try again later."},429);
 const supabase=await portalClient(); if(!supabase) return privateJson({error:"Portal is unavailable."},503); const {data:auth}=await supabase.auth.getUser(); if(!auth.user) return privateJson({error:"Please sign in."},401);
 const {data:engagement}=await supabase.from("engagements").select("id,organisation_id").eq("id",parsed.data.engagementId).maybeSingle(); if(!engagement) return privateJson({error:"This engagement is unavailable."},404);
 const admin=portalAdminClient();
 if(parsed.data.action==="request") { const {data,error}=await admin.from("requests").insert({engagement_id:engagement.id,created_by:auth.user.id,request_type:parsed.data.requestType||"general",title:parsed.data.subject||"Service request",body:parsed.data.body}).select("id").single(); if(error) return privateJson({error:"Your request could not be saved."},503); return privateJson({ok:true,id:data.id}); }
 let threadId=parsed.data.threadId;
 if(parsed.data.action==="new_thread") { const {data,error}=await admin.from("threads").insert({engagement_id:engagement.id,created_by:auth.user.id,subject:parsed.data.subject||"Project conversation"}).select("id").single(); if(error) return privateJson({error:"Conversation could not be started."},503); threadId=data.id; }
 else { const {data,error}=await supabase.from("threads").select("id, engagement_id, closed_at").eq("id",threadId!).eq("engagement_id",engagement.id).maybeSingle(); if(error||!data||data.closed_at) return privateJson({error:"This conversation is unavailable or closed."},404); }
 const {error:messageError}=await admin.from("messages").insert({thread_id:threadId,sender_id:auth.user.id,body:parsed.data.body}); if(messageError) return privateJson({error:"Your message could not be saved."},503);
 await admin.from("threads").update({updated_at:new Date().toISOString()}).eq("id",threadId);
 return privateJson({ok:true,threadId});
}
