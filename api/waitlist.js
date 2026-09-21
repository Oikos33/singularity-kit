// Vercel Serverless Function — POST /api/waitlist
// Saves email + tier interest to Supabase

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service-role key (server-side only)
);

module.exports = async function handler(req, res) {
  // CORS headers — allow both custom domain and Vercel preview URL
  const allowedOrigins = ["https://singularitys.io", "https://singularity-kit.vercel.app"];
  const origin = req.headers.origin || "";
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, name, tier, message } = req.body || {};

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  const { error } = await supabase.from("waitlist").insert([
    {
      email: email.trim().toLowerCase(),
      name: name ? name.trim() : null,
      tier: tier || null,
      message: message ? message.trim() : null,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    // Duplicate email — friendly message
    if (error.code === "23505") {
      return res.status(200).json({ ok: true, message: "already_registered" });
    }
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Database error" });
  }

  return res.status(200).json({ ok: true, message: "registered" });
};
