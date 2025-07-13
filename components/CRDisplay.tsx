"use client";
import { TypingText } from "./TypingText";
import { Waveform } from "./Waveform";

interface CRDisplayProps {
  message: string;
  radioOn: boolean;
  waveformHeights: number[];
}

export const CRDisplay = ({ message, radioOn, waveformHeights }: CRDisplayProps) => (
  <div className="crt-display w-full h-[320px] flex flex-col justify-between py-4 px-3 mb-8 text-lime-400 font-['Press_Start_2P'] text-[13px] leading-relaxed">
    <TypingText text={message} />
    {radioOn && (
      <>
        <div className="flex w-full mb-4">
          <Waveform heights={waveformHeights} />
        </div>
        <div className="text-xl text-center mb-6">
          INCOMING TRANSMISSION
        </div>
      </>
    )}
  </div>
);
