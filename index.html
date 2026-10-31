import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      id, customerName, mobile, businessName, category, brandModel, serialNo,
      purchaseDate, warrantyStatus, complaintType, description, serviceLocation,
      preferredDate, photoUrl, status, serviceCharges, createdAt, updatedAt,
      whatsappConsent,
    } = body ?? {};

    if (whatsappConsent !== true) {
      return new Response(JSON.stringify({ error: "WhatsApp consent is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (
      typeof customerName !== "string" || !customerName.trim() ||
      typeof mobile !== "string" || !/^\d{10}$/.test(mobile) ||
      typeof description !== "string" || !description.trim() ||
      typeof serviceLocation !== "string" || !serviceLocation.trim() ||
      typeof category !== "string" || typeof complaintType !== "string"
    ) {
      return new Response(JSON.stringify({ error: "Please provide valid required complaint details." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Server environment is not configured.");
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const complaintId = typeof id === "string" && id.length < 100
      ? id
      : `PCT-COMP-${Date.now()}`;
    const payload = {
      id: complaintId,
      customerName: customerName.trim(),
      mobile,
      businessName: typeof businessName === "string" ? businessName.trim() : "",
      category,
      brandModel: typeof brandModel === "string" ? brandModel : "",
      serialNo: typeof serialNo === "string" ? serialNo : "",
      purchaseDate: typeof purchaseDate === "string" ? purchaseDate : "",
      warrantyStatus: typeof warrantyStatus === "string" ? warrantyStatus : "Not Sure",
      complaintType,
      description: description.trim(),
      serviceLocation: serviceLocation.trim(),
      preferredDate: typeof preferredDate === "string" ? preferredDate : "",
      photoUrl: typeof photoUrl === "string" && photoUrl.length <= 1400000 ? photoUrl : undefined,
      status: "New",
      serviceCharges: 0,
      createdAt: typeof createdAt === "string" ? createdAt : new Date().toISOString(),
      updatedAt: typeof updatedAt === "string" ? updatedAt : new Date().toISOString(),
    };

    const { error } = await adminClient
      .from("public_complaints")
      .insert({ id: complaintId, payload });

    if (error) {
      if (error.code === "23505") {
        return new Response(JSON.stringify({ error: "Duplicate complaint. Please submit again." }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw error;
    }

    return new Response(JSON.stringify({ ok: true, complaintId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("submit-complaint error:", error);
    return new Response(JSON.stringify({ error: "Complaint could not be saved. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
