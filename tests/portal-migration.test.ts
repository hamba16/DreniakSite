import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

test("client portal migration creates isolated roles, confirmed divisions and private storage policies", async () => {
  const db = new PGlite({ extensions: { pgcrypto } });
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role;
      create schema auth;
      create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      grant usage on schema auth to authenticated;
      grant execute on function auth.uid() to authenticated;
      create schema storage;
      create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    `);
    await db.exec(await readFile("src/supabase/migrations/20261014144728_client_portal_foundation.sql", "utf8"));
    const tables = await db.query<{ table_name: string }>(`select table_name from information_schema.tables where table_schema='public' and table_name in ('portal_profiles','organisations','organisation_divisions','engagements','documents','assets','privacy_requests','audit_log')`);
    assert.equal(tables.rows.length, 8);
    const bucket = await db.query<{ public: boolean; file_size_limit: number }>(`select public, file_size_limit from storage.buckets where id='portal-files'`);
    assert.deepEqual(bucket.rows, [{ public: false, file_size_limit: 20971520 }]);

    const clientId = "10000000-0000-4000-8000-000000000001";
    const staffId = "10000000-0000-4000-8000-000000000002";
    const orgId = "20000000-0000-4000-8000-000000000001";
    const otherOrgId = "20000000-0000-4000-8000-000000000002";
    const engagementId = "30000000-0000-4000-8000-000000000001";
    const documentId = "40000000-0000-4000-8000-000000000001";
    const versionId = "40000000-0000-4000-8000-000000000002";
    await db.exec(`
      insert into auth.users values ('${clientId}', 'client@example.test', now()), ('${staffId}', 'staff@example.test', now());
      insert into public.portal_staff(user_id,role) values ('${staffId}','dreniak_admin');
      insert into public.organisations(id,name) values ('${orgId}','Client Org'), ('${otherOrgId}','Other Org');
      insert into public.organisation_members(organisation_id,user_id,role) values ('${orgId}','${clientId}','client_admin');
      insert into public.organisation_divisions(organisation_id,division,confirmed_by,confirmed_at) values ('${orgId}','engineering','${staffId}',now());
      insert into public.engagements(id,organisation_id,division,name) values ('${engagementId}','${orgId}','engineering','Visible project');
      insert into public.engagements(organisation_id,division,name) values ('${orgId}','asset-management','Unconfirmed service');
      insert into public.engagements(organisation_id,division,name) values ('${otherOrgId}','engineering','Other tenant');
      insert into public.portal_profiles(user_id,phone_e164) values ('${clientId}','+254712345678');
      insert into public.notification_preferences(user_id,email_enabled,event_types) values ('${clientId}',true,array['milestone_change']);
      insert into public.documents(id,engagement_id,title,visibility,created_by) values ('${documentId}','${engagementId}','Shared report','client','${staffId}');
      insert into public.document_versions(id,document_id,version_number,storage_path,filename,mime_type,size_bytes,uploaded_by) values ('${versionId}','${documentId}',1,'org/${orgId}/engagement/${engagementId}/${documentId}/report.pdf','report.pdf','application/pdf',100,'${staffId}');
      grant select on public.organisations, public.organisation_members, public.organisation_divisions, public.engagements to authenticated;
      set role authenticated;
      select set_config('request.jwt.claim.sub','${clientId}', false);
    `);
    const visible = await db.query<{ name: string }>(`select name from public.engagements order by name`);
    const uid = await db.query<{ uid: string }>(`select auth.uid() as uid`);
    assert.equal(uid.rows[0]?.uid, clientId);
    const access = await db.query<{ member: boolean; division: boolean; access: boolean }>(`select portal_private.is_org_member('${orgId}') member, portal_private.has_division('${orgId}','engineering') division, portal_private.can_read_engagement('${engagementId}') access`);
    assert.deepEqual(access.rows, [{ member: true, division: true, access: true }]);
    const fileAccess = await db.query<{ valid: boolean; wrongOrganisation: boolean; malformed: boolean }>(`select portal_private.can_read_file('org/${orgId}/engagement/${engagementId}/${documentId}/report.pdf') valid, portal_private.can_read_file('org/${otherOrgId}/engagement/${engagementId}/${documentId}/report.pdf') "wrongOrganisation", portal_private.can_read_file('org/${orgId}/engagement/${engagementId}/${documentId}/folder/report.pdf') malformed`);
    assert.deepEqual(fileAccess.rows, [{ valid: true, wrongOrganisation: false, malformed: false }]);
    await db.query(`select public.portal_log_document_event('document.download','${versionId}')`);
    await assert.rejects(db.exec(`insert into public.audit_log(actor_id,organisation_id,engagement_id,action,target_type,target_id,metadata) values ('${clientId}','${otherOrgId}','${engagementId}','document.download','document_version','${versionId}','{}')`));
    assert.deepEqual(visible.rows, [{ name: "Visible project" }]);
    await assert.rejects(db.exec(`reset role; insert into public.portal_profiles(user_id,phone_e164) values ('${staffId}','712345678')`));
    await assert.rejects(db.exec(`insert into public.engagements(organisation_id,division,name) values ('${otherOrgId}','engineering','Cross tenant')`));
    await db.exec("reset role");
    const preference = await db.query<{ event_types: string[] }>(`select event_types from public.notification_preferences where user_id='${clientId}'`);
    assert.deepEqual(preference.rows, [{ event_types: ["milestone_change"] }]);
    const notifyInputs = await db.query<{ members: number; eligible: number; engagement: string | null }>(`select (select count(*)::int from public.organisation_members where organisation_id='${orgId}') members, (select count(*)::int from public.organisation_members m join public.notification_preferences np on np.user_id=m.user_id where m.organisation_id='${orgId}' and np.event_types @> array['milestone_change']::text[] and np.email_enabled) eligible, (select organisation_id::text from public.engagements where id='${engagementId}') engagement`);
    assert.deepEqual(notifyInputs.rows, [{ members: 1, eligible: 1, engagement: orgId }]);
    await db.exec(`reset role; insert into public.milestones(engagement_id,title,description) values ('${engagementId}','Inspection','Private description is not copied to notices'); set role service_role;`);
    await db.exec("reset role");
    const queued = await db.query<{ id: string; event_type: string; payload: { engagement_id: string }; status: string }>(`select id,event_type,payload,status from public.notification_outbox`);
    assert.deepEqual(queued.rows.map(({ event_type, payload, status }) => ({ event_type, payload, status })), [{ event_type: "milestone_change", payload: { engagement_id: engagementId }, status: "pending" }]);
    await db.exec("set role service_role");
    const claim = await db.query<{ id: string; attempt_count: number }>(`select id,attempt_count from public.portal_claim_notifications(10)`);
    assert.equal(claim.rows[0]?.attempt_count, 1);
    await db.exec("reset role");
    const processing = await db.query<{ status: string }>(`select status from public.notification_outbox where id='${claim.rows[0]!.id}'`);
    assert.deepEqual(processing.rows, [{ status: "processing" }]);
    await db.exec("set role service_role");
    await db.query(`select public.portal_finish_notification('${claim.rows[0]!.id}',true,false)`);
    await db.exec("reset role");
    const finished = await db.query<{ status: string }>(`select status from public.notification_outbox`);
    assert.deepEqual(finished.rows, [{ status: "sent" }]);
    const invitationId = "50000000-0000-4000-8000-000000000001";
    await db.exec(`reset role; insert into public.invitations(id,organisation_id,email,role,invited_by) values ('${invitationId}','${orgId}','client@example.test','client_member','${staffId}'); set role service_role;`);
    const accepted = await db.query<{ portal_accept_invitation: string }>(`select public.portal_accept_invitation('${invitationId}','${clientId}','client@example.test')`);
    assert.equal(accepted.rows[0]?.portal_accept_invitation, orgId);
    await assert.rejects(db.query(`select public.portal_accept_invitation('${invitationId}','${clientId}','client@example.test')`));
    const expiredId = "50000000-0000-4000-8000-000000000002";
    await db.exec(`reset role; insert into public.invitations(id,organisation_id,email,role,invited_by,expires_at) values ('${expiredId}','${orgId}','client@example.test','client_member','${staffId}',now()-interval '1 minute'); set role service_role;`);
    await assert.rejects(db.query(`select public.portal_accept_invitation('${expiredId}','${clientId}','client@example.test')`));
    const revokedId = "50000000-0000-4000-8000-000000000003";
    await db.exec(`reset role; insert into public.invitations(id,organisation_id,email,role,invited_by,revoked_at) values ('${revokedId}','${orgId}','client@example.test','client_member','${staffId}',now()); set role service_role;`);
    await assert.rejects(db.query(`select public.portal_accept_invitation('${revokedId}','${clientId}','client@example.test')`));
  } finally {
    await db.close();
  }
});
