"use client";
interface TypingTextProps {
  text: string;
}

export const TypingText = ({ text }: TypingTextProps) => (
  <div className="typing-text whitespace-pre-wrap">{text}</div>
);
