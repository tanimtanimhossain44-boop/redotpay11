export const runtime = "nodejs";

export async function POST(request) {
  try {
    const auth = request.headers.get("authorization") || "";
    const suppliedPassword = auth.startsWith("Bearer ")
      ? auth.slice(7)
      : "";

    if (
      !process.env.DASHBOARD_PASSWORD ||
      suppliedPassword !== process.env.DASHBOARD_PASSWORD
    ) {
      return Response.json({ error: "Incorrect password." }, { status: 401 });
    }

    if (!process.env.GAS_URL || !process.env.GAS_SECRET) {
      return Response.json(
        { error: "Server configuration is incomplete." },
        { status: 500 }
      );
    }

    const upstream = await fetch(process.env.GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: process.env.GAS_SECRET }),
      cache: "no-store",
      redirect: "follow"
    });

    if (!upstream.ok) {
      return Response.json(
        { error: "Gmail service could not be reached." },
        { status: 502 }
      );
    }

    const result = await upstream.json();

    if (result.error) {
      return Response.json(
        { error: "Gmail service error: " + result.error },
        { status: 502 }
      );
    }

    return Response.json(
      { emails: Array.isArray(result.emails) ? result.emails : [] },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return Response.json(
      { error: "Unable to load emails. Check the Apps Script deployment." },
      { status: 500 }
    );
  }
}