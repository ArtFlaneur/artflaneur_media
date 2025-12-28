-- Gallery claim requests (manual review workflow)
-- Run this in Supabase SQL editor.

create table if not exists public.gallery_claim_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Gallery being claimed (from the public GraphQL gallery directory)
  gallery_external_id text not null,
  gallery_name text null,
  gallery_city text null,
  gallery_country text null,

  -- Applicant
  applicant_email text not null,
  applicant_name text null,
  applicant_phone text null,
  message text null,

  -- Review
  status text not null default 'received',
  reviewed_at timestamptz null,
  reviewer_note text null
);

create index if not exists gallery_claim_requests_created_at_idx
  on public.gallery_claim_requests (created_at desc);

create index if not exists gallery_claim_requests_gallery_external_id_idx
  on public.gallery_claim_requests (gallery_external_id);

create index if not exists gallery_claim_requests_applicant_email_idx
  on public.gallery_claim_requests (applicant_email);

alter table public.gallery_claim_requests enable row level security;

-- No anon/client policies needed if you insert via Edge Function using service role.
-- If you decide to insert from the client directly, you'll need an INSERT policy.
