"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { RadioBody } from "@/components/RadioBody";
import { CRDisplay } from "@/components/CRDisplay";
import { StatusPanel } from "@/components/StatusPanel";
import { FrequencyDial } from "@/components/FrequencyDial";
import { ActionButton } from "@/components/ActionButton";

export default function HomePage() {
  const [callsign, setCallsign] = useState("");
  const [radioOn, setRadioOn] = useState(false);
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);
  const [currentFrequency, setCurrentFrequency] = useState(88.0);
  const [isDialDragging, setIsDialDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const dialDragStart = useRef(0);
  const initialFrequencyOnDrag = useRef(0);
  const dialRef = useRef<HTMLDivElement>(null);

  const minFreq = 88.0;
  const maxFreq = 208.0;
  const freqRange = maxFreq - minFreq; 
  const segmentWidth = 15; 
  const totalDialWidth = freqRange * 10 * segmentWidth;
  const containerVisibleWidth = 240;

  const typingLock = useRef(false);
  const typeOut = useCallback(async (
    fullText: string,
    setter: (msg: string) => void,
    delay = 50
  ) => {
    while (typingLock.current) {
      await new Promise((res) => setTimeout(res, 50)); 
    }
    typingLock.current = true;
    let output = "";
    setter("");

    for (let i = 0; i < fullText.length; i++) {
      output += fullText[i];
      setter(output);
      await new Promise((res) => setTimeout(res, delay));
    }

    typingLock.current = false;
  }, []); 

  useEffect(() => {
    const checkExistingSession = async () => {
      const cookies = document.cookie.split("; ").reduce((acc: Record<string, string>, pair) => {
        const [key, value] = pair.split("=");
        acc[key] = value;
        return acc;
      }, {});

      const existingCallsign = cookies.callsign;
      const existingSession = cookies.retro_radio_id;

      if (existingCallsign && existingSession) {
        setCallsign(existingCallsign);
        setRadioOn(true);
        await typeOut(`CALLSIGN: ${existingCallsign}`, setStatusMessage);
      } else {
        setRadioOn(false);
        await typeOut("Press CONNECT to begin", setStatusMessage);
      }
    };

    checkExistingSession();
  }, [typeOut]);

  useEffect(() => {
    let waveformInterval: NodeJS.Timeout;

    const generateWaveform = () => {
      if (radioOn) {
        const newHeights = Array.from({ length: 50 }).map(() =>
          Math.random() * 50 + 15
        );
        setWaveformHeights(newHeights);
      } else {
        setWaveformHeights([]); 
      }
    };
    if (radioOn) {
      generateWaveform();
      waveformInterval = setInterval(generateWaveform, 150);
    }

    return () => {
      if (waveformInterval) {
        clearInterval(waveformInterval);
      }
    };
  }, [radioOn]);

  const updateFrequency = useCallback((delta: number) => {
    setCurrentFrequency((prevFreq) => {
      let newFreq = prevFreq + delta;
      newFreq = Math.max(minFreq, Math.min(maxFreq, newFreq));
      return parseFloat(newFreq.toFixed(1));
    });
  }, [minFreq, maxFreq]);

 const handleDialWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault(); 
    const scrollDelta = e.deltaX > 0 ? 0.1 : -0.1;
    updateFrequency(scrollDelta);
  }, [updateFrequency]);

  const handleDialStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDialDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    dialDragStart.current = clientX;
    initialFrequencyOnDrag.current = currentFrequency;
    e.preventDefault();
  }, [currentFrequency]);

  const handleDialMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDialDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const dragDeltaPixels = clientX - dialDragStart.current;
    const freqChangePerPixel = 0.1 / segmentWidth;
    const freqDelta = dragDeltaPixels * freqChangePerPixel * -1;
    const newFreq = initialFrequencyOnDrag.current + freqDelta;
    setCurrentFrequency(parseFloat(Math.max(minFreq, Math.min(maxFreq, newFreq)).toFixed(1)));
    e.preventDefault();
  }, [isDialDragging, minFreq, maxFreq, segmentWidth]);

  const handleDialEnd = useCallback(() => {
    setIsDialDragging(false);
  }, []); 

  useEffect(() => {
  if (!radioOn) return;

  const timeout = setTimeout(() => {
    const joinFrequency = async () => {
      try {
        const res = await fetch("/api/join", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ frequency: currentFrequency.toFixed(1) }),
        });

        const data = await res.json();
        if (res.ok) {
          await typeOut(`📡 ${data.message}`, setStatusMessage);
        } else {
          await typeOut(`❌ ${data.error}`, setStatusMessage);
        }
      } catch {
        await typeOut("❌ Join failed. Network error.", setStatusMessage);
      }
    };

    joinFrequency();
  }, 2000);

  return () => clearTimeout(timeout);
}, [currentFrequency, radioOn, typeOut]);

  useEffect(() => {
    if (isDialDragging) {
      window.addEventListener("mousemove", handleDialMove);
      window.addEventListener("mouseup", handleDialEnd);
      window.addEventListener("touchmove", handleDialMove, { passive: false });
      window.addEventListener("touchend", handleDialEnd);
      window.addEventListener("touchcancel", handleDialEnd);
    } else {
      window.removeEventListener("mousemove", handleDialMove);
      window.removeEventListener("mouseup", handleDialEnd);
      window.removeEventListener("touchmove", handleDialMove);
      window.removeEventListener("touchend", handleDialEnd);
      window.removeEventListener("touchcancel", handleDialEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleDialMove);
      window.removeEventListener("mouseup", handleDialEnd);
      window.removeEventListener("touchmove", handleDialMove);
      window.removeEventListener("touchend", handleDialEnd);
      window.removeEventListener("touchcancel", handleDialEnd);
    };
  }, [isDialDragging, handleDialMove, handleDialEnd]);

  const currentOffsetPx = (currentFrequency - minFreq) * 10 * segmentWidth;
  const dialTranslateX = -currentOffsetPx + (containerVisibleWidth / 2) - (segmentWidth / 2);

  const handleConnectDisconnect = useCallback(async () => {
  if (radioOn) {
    setRadioOn(false);
    await typeOut(`Disconnecting ${callsign}...`, setStatusMessage);
    setCallsign("");
    await typeOut("Radio Offline. Press CONNECT.", setStatusMessage);
  } else {
    await typeOut("Establishing connection...", setStatusMessage);
    try {
      const res = await fetch("/api/auth", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCallsign(data.callsign);
        setRadioOn(true);
        await typeOut(`CALLSIGN: ${data.callsign}`, setStatusMessage);
      } else {
        await typeOut(`Error: ${data.error || "Failed authentication"}`, setStatusMessage);
        setRadioOn(false);
      }
    } catch {
      await typeOut("Network error. Try again.", setStatusMessage);
      setRadioOn(false);
    }
  }
}, [radioOn, typeOut, callsign]);

return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <RadioBody>
        <CRDisplay message={statusMessage} radioOn={radioOn} waveformHeights={waveformHeights} />
        <StatusPanel radioOn={radioOn} currentFrequency={currentFrequency} />
        <FrequencyDial
          totalDialWidth={totalDialWidth}
          dialTranslateX={dialTranslateX}
          handleDialWheel={handleDialWheel}
          handleDialStart={handleDialStart}
          dialRef={dialRef}
          minFreq={minFreq}
          maxFreq={maxFreq}
          segmentWidth={segmentWidth}
        />
        <ActionButton onClick={handleConnectDisconnect} radioOn={radioOn} />
      </RadioBody>
    </main>
  );
}