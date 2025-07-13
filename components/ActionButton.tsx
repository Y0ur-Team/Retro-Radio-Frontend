"use client";

interface ActionButtonProps {
  onClick: () => void;
  radioOn: boolean;
}

export const ActionButton = ({ onClick, radioOn }: ActionButtonProps) => (
  <button
    className="action-button font-['Press_Start_2P'] mt-6"
    onClick={onClick}
  >
    {radioOn ? "DISCONNECT" : "CONNECT"}
  </button>
);
