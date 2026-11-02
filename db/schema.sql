-- Nestly demo schema (Neon / any Postgres). Safe to re-run: `npm run db:setup`.
-- Every table is { id, data jsonb }: the record is stored as JSON so the admin and
-- public site share one shape. Normalize into real columns when moving to MySQL.

create table if not exists listings  (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists bookings  (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists inquiries (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists hosts     (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists reviews   (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists posts     (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists settings  (id text primary key, data jsonb not null, created_at timestamptz not null default now());
