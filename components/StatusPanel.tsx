"use client";
interface StatusPanelProps {
  radioOn: boolean;
  currentFrequency: number;
}

export const StatusPanel = ({ radioOn, currentFrequency }: StatusPanelProps) => (
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
);
