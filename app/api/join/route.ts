import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();
  const frequency = body.frequency;
  const sessionCookie = (await cookies()).get("retro_radio_id")?.value;

  if (!sessionCookie) {
    return Response.json({ error: "Missing session cookie" }, { status: 401 });
  }
  const RETRO_RADIO_BACKEND = process.env.RETRO_RADIO_BACKEND + "/join/";
  try {
    const backendRes = await fetch(RETRO_RADIO_BACKEND, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "RETRO-TOKEN": sessionCookie,
      },
      body: JSON.stringify({ frequency }),
    });

    const data = await backendRes.json();
    return Response.json(data, { status: backendRes.status });
  } catch (err) {
    console.log(err)
    return Response.json({ error: "Failed to contact backend" }, { status: 502 });
  }
}