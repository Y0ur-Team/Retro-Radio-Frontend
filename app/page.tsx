"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [callsign, setCallsign] = useState("");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const triggerBackend = async () => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
        });

        const data = await res.json();
        console.log("Backend response:", data);

        // Wait briefly to allow cookies to be set
        setTimeout(() => {
          const cookies = document.cookie.split("; ").reduce((acc: any, pair) => {
            const [key, value] = pair.split("=");
            acc[key] = value;
            return acc;
          }, {});
          setCallsign(cookies.callsign || "N/A");
          setSessionId(cookies.retro_radio_id || "N/A");
        }, 100);
      } catch (err) {
        console.error("Failed to contact backend:", err);
      }
    };

    triggerBackend();
  }, []);

  return (
    <main className="text-center p-10 text-white bg-black min-h-screen">
      <h1 className="text-4xl font-bold">📻 Retro Radio</h1>
      <p className="mt-4">Starting radio check-in...</p>

      {callsign && sessionId && (
        <div className="mt-8">
          <p>✅ <strong>Callsign:</strong> {callsign}</p>
          <p>✅ <strong>Session ID:</strong> {sessionId}</p>
        </div>
      )}
    </main>
  );
}
