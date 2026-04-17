import { TimerProps } from "../models/timer";

export default function Timer({ time, className }: TimerProps) {

  return (
    <div className={`bg-black w-fit h-fit p-2 pb-1 mx-2 border-2 border-gray-500 rounded-xl text-5xl text-red-600 whitespace-nowrap font-["7Segment"] select-none ${className}`}>
      {time === 0 ? '--' : time.toString().padStart(2, "0")}
    </div>
  );
}
