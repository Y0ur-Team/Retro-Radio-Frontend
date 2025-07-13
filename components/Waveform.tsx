"use client";
interface WaveformProps {
  heights: number[];
}

export const Waveform = ({ heights }: WaveformProps) => (
  <div className="waveform-container">
    {heights.map((height, i) => (
      <div key={i} className="waveform-bar" style={{ height: `${height}%` }} />
    ))}
  </div>
);
