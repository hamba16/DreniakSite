import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";

export async function testDatabase() {
  const db = new PGlite();
  // Minimal Supabase-owned schemas. Run the project's actual migrations below.
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql as $$ select null::uuid $$;
    create schema storage;
    create table storage.buckets(id text primary key, name text, public boolean);
    create table storage.objects(id uuid primary key, bucket_id text);
    alter table storage.objects enable row level security;
    grant usage on schema public, storage, auth to anon, authenticated, service_role;
  `);
  const original = await readFile("supabase/migrations/20260912085000_admin_cms.sql", "utf8");
  // PGlite has core gen_random_uuid but does not ship pgcrypto; this migration
  // does not use any other pgcrypto function.
  await db.exec(original.replace("create extension if not exists pgcrypto;", ""));
  await db.exec(await readFile("supabase/migrations/20260913060024_admin_totp.sql", "utf8"));
  return db;
}
export async function rpc<T = unknown>(db: PGlite, action: string, data: Record<string, unknown> = {}) {
  const result = await db.query<{ result: T }>("select public.admin_auth($1, $2::jsonb) as result", [action, JSON.stringify(data)]);
  return result.rows[0].result;
}
