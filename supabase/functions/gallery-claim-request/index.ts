/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type ClaimRequestBody = {
  galleryExternalId: string;
  galleryName?: string;
  galleryCity?: string;
  galleryCountry?: string;
  applicantEmail: string;
  applicantName?: string;
  applicantPhone?: string;
  message?: string;
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
    },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
        "access-control-allow-methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  let payload: ClaimRequestBody;
  try {
    payload = (await req.json()) as ClaimRequestBody;
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const galleryExternalId = payload.galleryExternalId?.trim();
  const applicantEmail = payload.applicantEmail?.trim();

  if (!galleryExternalId) return json(400, { error: "galleryExternalId is required" });
  if (!applicantEmail) return json(400, { error: "applicantEmail is required" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: inserted, error: insertError } = await supabase
    .from("gallery_claim_requests")
    .insert({
      gallery_external_id: galleryExternalId,
      gallery_name: payload.galleryName?.trim() || null,
      gallery_city: payload.galleryCity?.trim() || null,
      gallery_country: payload.galleryCountry?.trim() || null,
      applicant_email: applicantEmail,
      applicant_name: payload.applicantName?.trim() || null,
      applicant_phone: payload.applicantPhone?.trim() || null,
      message: payload.message?.trim() || null,
      status: "received",
    })
    .select("id")
    .single();

  if (insertError) {
    return json(500, { error: `Insert failed: ${insertError.message}` });
  }

  const requestId = inserted?.id as string | undefined;
  if (!requestId) {
    return json(500, { error: "Insert succeeded but request id is missing" });
  }

  return json(200, { requestId });
});
