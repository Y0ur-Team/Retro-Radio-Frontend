import { cookies } from "next/headers";

export async function POST() {
  const RETRO_BACKEND = process.env.RETRO_BACKEND + "/auth/";

  try {
    const cookieStore = cookies();
    const existingSession = (await cookieStore).get("retro_radio_id")?.value;

    const headers: HeadersInit = {};
    if (existingSession) {
      headers["RETRO-TOKEN"] = existingSession;
    }

    const response = await fetch(RETRO_BACKEND, {
      method: "POST",
      headers,
    });

    const result = await response.json();

    if (response.ok) {
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      (await cookieStore).set("callsign", result.callsign, {
        expires,
        path: "/",
        httpOnly: false,
      });

      (await cookieStore).set("retro_radio_id", result.session_id, {
        expires,
        path: "/",
        httpOnly: false,
      });

      return new Response(JSON.stringify({ ok: true, ...result }), {
        status: 200,
      });
    } else {
      return new Response(JSON.stringify(result), {
        status: response.status,
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: "Auth failed" }), {
      status: 500,
    });
  }
}
