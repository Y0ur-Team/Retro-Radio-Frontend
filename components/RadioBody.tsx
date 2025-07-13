"use client";
import { ReactNode } from "react";

interface RadioBodyProps {
  children: ReactNode;
}

export const RadioBody = ({ children }: RadioBodyProps) => (
  <div className="radio-body px-8 py-10 w-[380px] h-[680px] flex flex-col items-center relative">
    <div className="antenna mx-auto -mt-8 mb-4"></div>
    {children}
    <div className="flex justify-between w-full mt-auto px-2 text-[#606060] text-[10px] font-['Press_Start_2P']">
      <div>PWR</div>
      <div>MODE</div>
      <div>BAT</div>
    </div>
  </div>
);
