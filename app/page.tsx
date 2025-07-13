"use client"; 

import { useEffect, useState, useRef, useCallback } from "react";

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
  const maxFreq = 108.0;
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
      await typeOut("Disconnecting...", setStatusMessage);
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
          await typeOut(`CALLSIGN: ${callsign}`, setStatusMessage);
        } else {
          await typeOut(`Error: ${data.error || "Failed authentication"}`, setStatusMessage);
          setRadioOn(false);
        }
      } catch {
        await typeOut("Network error. Try again.", setStatusMessage);
        setRadioOn(false);
      }
    }
  }, [radioOn, typeOut]);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="radio-body px-8 py-10 w-[350px] h-[780px] flex flex-col items-center relative">
        <div className="antenna mx-auto -mt-8 mb-4"></div>

        <div className="crt-display w-full h-[320px] flex flex-col justify-between py-4 px-3 mb-8 text-lime-400 font-['Press_Start_2P'] text-[13px] leading-relaxed"> 
          <div className="typing-text whitespace-pre-wrap">{statusMessage}</div>

          {radioOn && (
            <>
              <div className="flex w-full mb-4">
                <div className="waveform-container">
                  {waveformHeights.map((height, i) => (
                    <div key={i} className="waveform-bar" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
              <div className="text-xl text-center mb-6">
                INCOMING TRANSMISSION
              </div>
            </>
          )}
        </div>

        <div className="status-panel w-full mb-8 py-4 px-4 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center mb-2">
            <div className={`status-led ${radioOn ? "bg-green-500 glow-led" : "bg-red-500"}`}></div>
            <span className="text-white text-base font-['Press_Start_2P'] ml-3">
              STATUS: {radioOn ? "ON" : "OFF"}
            </span>
          </div>

          <div className="frequency-display mt-4 text-lg">
            {currentFrequency.toFixed(1)} MHz
          </div>
        </div>
        <div
          className="frequency-dial-container"
          onWheel={handleDialWheel}
          onMouseDown={handleDialStart}
          onTouchStart={handleDialStart}
        >
          <div
            ref={dialRef}
            className="rolling-dial-surface"
            style={{
              width: `${totalDialWidth}px`,
              transform: `translateX(${dialTranslateX}px)`,
            }}
          >
            {Array.from({ length: (maxFreq - minFreq) * 10 + 1 }).map((_, i) => {
              const freq = parseFloat((minFreq + i * 0.1).toFixed(1));
              const isMajorMark = freq % 1 === 0;
              const isMinorMark = freq % 0.5 === 0 && !isMajorMark;

              return (
                <div key={i} className="dial-segment">
                  {isMajorMark && <span className="dial-major-label">{freq.toFixed(0)}</span>}
                  {isMinorMark && <div className="dial-minor-tick"></div>}
                  {!isMajorMark && !isMinorMark && <div className="dial-tick"></div>}
                </div>
              );
            })}
          </div>
          <div className="dial-indicator-line"></div>
        </div>

        <button
          className="action-button font-['Press_Start_2P'] mt-6"
          onClick={handleConnectDisconnect}
        >
          {radioOn ? "DISCONNECT" : "CONNECT"}
        </button>

        <div className="flex justify-between w-full mt-auto px-2 text-[#606060] text-[10px] font-['Press_Start_2P']">
          <div>PWR</div>
          <div>MODE</div>
          <div>BAT</div>
        </div>
      </div>
    </main>
  );
}