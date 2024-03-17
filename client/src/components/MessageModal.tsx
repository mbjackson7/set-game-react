import { MessageModalProps } from "../models/messageModal";

export default function MessageModal({ message }: MessageModalProps) {
  return (
    <div className="fixed h-full w-full flex justify-center items-center p-20 z-50">
      <div
        className={`bg-${message.color}-800 text-3xl text-white border-2 border-black p-5 flex justify-center items-center`}
      >
        {message.text}
      </div>
    </div>
  );
}
