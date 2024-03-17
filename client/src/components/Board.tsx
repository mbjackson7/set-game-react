import Card from "./Card";
import { CardAttributes } from "../models/card";
import { BoardProps } from "../models/board";


export default function Board({
  socket,
  onTable,
  selected,
  gameState,
  userName,
  overflowLevel,
}: BoardProps) {
  const rotate = window.innerWidth < window.innerHeight ? "rotate-90" : "";  

  const select = (index: number) => {
    if (gameState === userName) {
      socket.emit("select", index);
    }
  };

  return (
    <div
      className={`grid grid-rows-3 grid-cols-${
        overflowLevel + 4
      } grid-flow-col gap-2 h-5/6 max-h-[96vw] max-w-[90vw] aspect-${
        rotate ? (overflowLevel ? 5 : 4) : overflowLevel + 4
      }/4 ${rotate}`}
    >
      {onTable.map((card: CardAttributes, index: number) => {
        return (
          <button
            key={index}
            className="flex justify-center h-full aspect-5/7"
            onClick={() => {
              select(index);
            }}
            disabled={gameState !== userName}
          >
            <Card
              key={index}
              attributes={card}
              selected={selected.includes(index)}
              disabled={gameState !== "in-progress" && gameState !== userName}
            />
          </button>
        );
      })}
    </div>
  );
}
