# Supabase: Gallery claim requests + email

This repo implements a **manual review** workflow for gallery claims:

- User clicks **Claim Your Gallery** on a gallery page
- They are sent to `/gallery-login?...` with the gallery preserved in query params
- They submit a claim request
- Supabase stores the request (`gallery_claim_requests`)
- A confirmation email is sent to the applicant (via an Edge Function)

## 1) Create the database table

Run this SQL in the Supabase SQL editor:

- [supabase/gallery-claim-setup.sql](supabase/gallery-claim-setup.sql)

## 2) Deploy the Edge Function

The client calls the Edge Function named `gallery-claim-request`.

Function source:
- [supabase/functions/gallery-claim-request/index.ts](supabase/functions/gallery-claim-request/index.ts)

This function is intentionally public (users are not logged in yet), so JWT verification must be disabled:
- [supabase/functions/gallery-claim-request/config.toml](supabase/functions/gallery-claim-request/config.toml)

Deploy with Supabase CLI (example):

```bash
supabase functions deploy gallery-claim-request
```

## 3) Configure Edge Function secrets

Required (for DB insert):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional (for sending email via Resend):
- `RESEND_API_KEY`
- `CLAIM_FROM_EMAIL` (default: `Art Flaneur <no-reply@artflaneur.com>`)

If `RESEND_API_KEY` is not set, the claim request is still stored, but the email step is skipped.

## 4) What gets stored

At minimum, we store:
- `gallery_external_id`
- `applicant_email`

Plus optional context:
- gallery name/city/country
- applicant name/phone
- message

## 5) UX entrypoint

The CTA is on the gallery page:
- [apps/web/pages/GalleryView.tsx](apps/web/pages/GalleryView.tsx)
