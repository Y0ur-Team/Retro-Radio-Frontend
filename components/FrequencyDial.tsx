"use client";
import { RefObject } from "react";

interface FrequencyDialProps {
  dialRef: RefObject<HTMLDivElement | null>;
  totalDialWidth: number;
  dialTranslateX: number;
  handleDialWheel: (e: React.WheelEvent) => void;
  handleDialStart: (e: React.MouseEvent | React.TouchEvent) => void;
  minFreq: number;
  maxFreq: number;
  segmentWidth: number;
}

export const FrequencyDial = ({
  totalDialWidth,
  dialTranslateX,
  handleDialWheel,
  handleDialStart,
  dialRef,
  minFreq,
  maxFreq,
  segmentWidth,
}: FrequencyDialProps) => (
  <div
    className="frequency-dial-container"
    onWheel={handleDialWheel}
    onMouseDown={handleDialStart}
    onTouchStart={handleDialStart}
  >
    <div
      ref={dialRef}
      className="rolling-dial-surface"
      style={{ width: `${totalDialWidth}px`, transform: `translateX(${dialTranslateX}px)` }}
    >
      {Array.from({ length: (maxFreq - minFreq) * 10 + 1 }).map((_, i) => {
        const freq = parseFloat((minFreq + i * 0.1).toFixed(1));
        const isMajorMark = freq % 1 === 0;
        const isMinorMark = freq % 0.5 === 0 && !isMajorMark;
        return (
          <div key={i} className="dial-segment" style={{ marginRight: `${segmentWidth / 4}px`, width: `${segmentWidth}px` }}>
            {isMajorMark && <span className="dial-major-label">{freq.toFixed(0)}</span>}
            {isMinorMark && <div className="dial-minor-tick"></div>}
            {!isMajorMark && !isMinorMark && <div className="dial-tick"></div>}
          </div>
        );
      })}
    </div>
    <div className="dial-indicator-line"></div>
  </div>
);
