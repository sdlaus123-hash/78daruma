const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const googleScriptUrl = process.env.GOOGLE_SCRIPT_URL;

  if (!googleScriptUrl) {
    return res.status(500).json({ ok: false, error: "missing_google_script_url" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const email = String(body.email || "").trim().toLowerCase();

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: "invalid_email" });
    }

    const entry = {
      email,
      item: String(body.item || "launch").trim(),
      source: String(body.source || "waitlist.html").trim(),
      createdAt: body.createdAt || new Date().toISOString()
    };

    const response = await fetch(googleScriptUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(entry)
    });

    const responseText = await response.text().catch(() => "");

    if (!response.ok) {
      return res.status(502).json({
        ok: false,
        error: "google_script_failed",
        detail: responseText.slice(0, 160)
      });
    }

    let googleResult = null;
    try {
      googleResult = JSON.parse(responseText);
    } catch (error) {
      return res.status(502).json({
        ok: false,
        error: "invalid_google_script_response",
        detail: responseText.slice(0, 160)
      });
    }

    if (!googleResult.ok) {
      return res.status(502).json({
        ok: false,
        error: googleResult.error || "google_script_rejected"
      });
    }

    return res.status(200).json({ ok: true, status: googleResult.status || "created" });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "waitlist_failed" });
  }
};
