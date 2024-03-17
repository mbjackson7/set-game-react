import { TimerProps } from "../models/timer";

export default function Timer({ time }: TimerProps) {

  return (
    <div className="bg-black p-2 pb-1 mx-2 border-2 border-gray-500 rounded-xl">
      <div className={`text-5xl text-red-600 font-["7Segment"] select-none`}>
        {time === 0 ? '--' : time.toString().padStart(2, "0")}
      </div>
    </div>
  );
}
