

import { StylizedButtonProps } from "../models/stylizedButton";

export default function StylizedButton({ color, disabled, children, onClick }: StylizedButtonProps) {
  return (
    <button
      className={`${!disabled ? `${color} text-white` : 'bg-gray-600 text-gray-400'} font-bold py-2 w-24 rounded`}
      onClick={onClick}
      disabled={disabled} 
    >
      {children}
    </button>
  );
}
