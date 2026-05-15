import Card from "./Card";
import { CardAttributes } from "../models/card";
import { BoardProps } from "../models/board";

type TutorialBoardProps = {
  cards: CardAttributes[];
  highlight?: number[];
  tutorialMode?: boolean;
  className?: string;
  selected?: number[];
  onCardClick?: (idx: number) => void;
};

type Props =
  | (BoardProps & { tutorialMode?: false })
  | (TutorialBoardProps & { tutorialMode: true });

export default function Board(props: Props) {
  if (props.tutorialMode) {
    const { cards, highlight = [], className = "", selected = [], onCardClick } = props;

    const isDemoRow = cards.length === 3;

    // The board is constrained by height (passed via className from Tutorial).
    // We let width derive naturally from the grid's aspect ratio so cards stay 5:7.
    //
    // For a 4-col × 3-row grid with gap-2 (8px gaps):
    //   card_w = (board_w - 3*8) / 4
    //   card_h = (board_h - 2*8) / 3
    //   For 5:7 ratio: card_w / card_h = 5/7
    //   => board_w = (5/7) * (board_h - 16) * (4/3) + 24
    // Rather than compute this in JS, we set each card to `aspect-[5/7] h-full`
    // and let the grid column width emerge from that. The grid itself gets
    // `grid-rows-3` with an explicit height; columns size to card content.

    if (isDemoRow) {
      return (
        <div className={`flex flex-row justify-center items-center gap-2 h-full ${className}`}>
          {cards.map((card, index) => (
            <button
              key={index}
              className={`aspect-[5/7] h-full ${
                highlight.includes(index) ? "ring-4 ring-yellow-400 rounded-2xl" : ""
              }`}
              onClick={onCardClick ? () => onCardClick(index) : undefined}
              disabled={!onCardClick}
            >
              <Card
                attributes={card}
                selected={selected.includes(index) || highlight.includes(index)}
                disabled={!onCardClick}
              />
            </button>
          ))}
        </div>
      );
    }

    // 12-card board: 4 cols × 3 rows.
    // Each cell is aspect-[5/7] so columns size to card width automatically.
    // The grid height is set by the container (Tutorial passes a fixed height).
    return (
      <div className={`grid grid-rows-3 grid-cols-4 gap-2 h-full w-fit mx-auto ${className}`}>
        {cards.map((card, index) => (
          <button
            key={index}
            className={`aspect-[5/7] h-full ${
              highlight.includes(index) ? "ring-4 ring-yellow-400 rounded-2xl" : ""
            }`}
            onClick={onCardClick ? () => onCardClick(index) : undefined}
            disabled={!onCardClick}
          >
            <Card
              attributes={card}
              selected={selected.includes(index) || highlight.includes(index)}
              disabled={!onCardClick}
            />
          </button>
        ))}
      </div>
    );
  }

  // Normal game mode — unchanged
  const { socket, onTable, selected, gameState, userName, overflowLevel, className = "" } = props;
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
      } grid-flow-col gap-2 h-5/6 max-h-[96vw] max-w-[66vmax] aspect-${
        rotate ? 4 : overflowLevel + 4
      }/4 ${rotate} ${rotate ? `h-screen m-2` : "pt-20"} ${className}`}
    >
      {onTable.map((card: CardAttributes, index: number) => (
        <button
          key={index}
          className="flex justify-center justify-self-center h-full aspect-5/7"
          onClick={() => select(index)}
          disabled={gameState !== userName}
        >
          <Card
            key={index}
            attributes={card}
            selected={selected.includes(index)}
            disabled={gameState !== "in-progress" && gameState !== userName}
          />
        </button>
      ))}
    </div>
  );
}