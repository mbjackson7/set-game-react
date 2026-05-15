import { useEffect, useState } from "react";
import { CardAttributes } from "../models/card";
import { useNavigate } from "react-router-dom";
import { randomBoardWithSet, findSets, isSet } from "../utils/set";
import Board from "../components/Board";

// ── Demo boards ───────────────────────────────────────────────────────────────

const colorDemo: CardAttributes[] = [
  { color: "red",    shape: "oval", number: 1, shading: "solid" },
  { color: "green",  shape: "oval", number: 1, shading: "solid" },
  { color: "purple", shape: "oval", number: 1, shading: "solid" },
];
const shapeDemo: CardAttributes[] = [
  { color: "red", shape: "oval",     number: 1, shading: "solid" },
  { color: "red", shape: "squiggle", number: 1, shading: "solid" },
  { color: "red", shape: "diamond",  number: 1, shading: "solid" },
];
const numberDemo: CardAttributes[] = [
  { color: "red", shape: "oval", number: 1, shading: "solid" },
  { color: "red", shape: "oval", number: 2, shading: "solid" },
  { color: "red", shape: "oval", number: 3, shading: "solid" },
];
const shadingDemo: CardAttributes[] = [
  { color: "red", shape: "oval", number: 1, shading: "solid" },
  { color: "red", shape: "oval", number: 1, shading: "striped" },
  { color: "red", shape: "oval", number: 1, shading: "open" },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface TutorialStep {
  caption: string;
  board: CardAttributes[];
  highlight: number[];
  duration: number | null;
  userFindSet?: boolean;
}

// ── Attribute analysis panel ──────────────────────────────────────────────────

type AttrStatus = "all same" | "all different" | "partially same";
interface AttrAnalysis {
  color: AttrStatus;
  shape: AttrStatus;
  number: AttrStatus;
  shading: AttrStatus;
}

function checkAttr(values: (string | number)[]): AttrStatus {
  const unique = new Set(values).size;
  if (unique === 1) return "all same";
  if (unique === values.length) return "all different";
  return "partially same";
}

function analyzeSelection(cards: CardAttributes[]): AttrAnalysis {
  return {
    color:   checkAttr(cards.map((c) => c.color)),
    shape:   checkAttr(cards.map((c) => c.shape)),
    number:  checkAttr(cards.map((c) => c.number)),
    shading: checkAttr(cards.map((c) => c.shading)),
  };
}

const STATUS_STYLES: Record<AttrStatus, string> = {
  "all same":      "bg-green-800  text-green-100",
  "all different": "bg-green-800 text-green-100",
  "partially same":         "bg-red-800   text-red-100",
};

type PairHint = "match" | "differ";
interface PairAnalysis {
  color: PairHint;
  shape: PairHint;
  number: PairHint;
  shading: PairHint;
}

const ATTRS: { label: string; key: keyof AttrAnalysis }[] = [
  { label: "Color",   key: "color"   },
  { label: "Shape",   key: "shape"   },
  { label: "Number",  key: "number"  },
  { label: "Shading", key: "shading" },
];

function AttributePanel({ cards }: { cards: CardAttributes[] }) {
  const analysis = analyzeSelection(cards);
  const mixedAttrs = ATTRS.filter(({ key }) => analysis[key] === "partially same");
  const isValidSet = mixedAttrs.length === 0;

  return (
    <div className="flex flex-col items-center gap-1 w-full px-4">
      <div className="flex flex-row flex-wrap justify-center gap-2">
        {ATTRS.map(({ label, key }) => (
          <div
            key={key}
            className={`flex flex-col items-center rounded px-4 py-1 min-w-[90px] ${STATUS_STYLES[analysis[key]]}`}
          >
            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {label}
            </span>
            <span className="text-sm font-bold capitalize">{analysis[key]}</span>
          </div>
        ))}
      </div>
      {isValidSet ? (
        <p className="text-green-400 font-bold">✓ That's a set!</p>
      ) : (
        <p className="text-red-400 text-sm text-center">
          Not a set —{" "}
          <span className="font-semibold">
            {mixedAttrs.map(({ label }) => label).join(", ")}
          </span>{" "}
          {mixedAttrs.length === 1 ? "is" : "are"} partially the same. Each attribute must
          be all the same or all different.
        </p>
      )}
    </div>
  );
}

const PAIR_STATUS_STYLES: Record<PairHint, string> = {
  match: "bg-indigo-800 text-indigo-100",
  differ: "bg-sky-800 text-sky-100",
};

function analyzePair(cards: [CardAttributes, CardAttributes]): PairAnalysis {
  return {
    color: cards[0].color === cards[1].color ? "match" : "differ",
    shape: cards[0].shape === cards[1].shape ? "match" : "differ",
    number: cards[0].number === cards[1].number ? "match" : "differ",
    shading: cards[0].shading === cards[1].shading ? "match" : "differ",
  };
}

function describeSetCaption(cards: CardAttributes[]): string {
  const analysis = analyzeSelection(cards);
  const parts = ATTRS.map(({ label, key }) =>
    analysis[key] === "all same"
      ? `all the same ${label.toLowerCase()}`
      : `all different ${label.toLowerCase()}`
  );

  if (parts.length === 0) {
    return "these cards form a set";
  }

  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function UserFindPanel({ board, selected }: { board: CardAttributes[]; selected: number[] }) {
  if (selected.length === 0) {
    return (
      <p className="text-neutral-300 text-sm text-center px-4">
        Select 3 cards to see whether they form a set.
      </p>
    );
  }

  if (selected.length === 1) {
    return (
      <p className="text-neutral-300 text-sm text-center px-4">
        Pick one more card, then the board will tell you whether the third card should match or differ for each attribute.
      </p>
    );
  }

  if (selected.length === 2) {
    const pairCards = [board[selected[0]], board[selected[1]]] as [CardAttributes, CardAttributes];
    const pairAnalysis = analyzePair(pairCards);

    return (
      <div className="flex flex-col items-center gap-1 w-full px-4">
        <p className="text-neutral-300 text-sm text-center">
          The final card must match or differ from the selected cards for each attribute.
        </p>
        <div className="flex flex-row flex-wrap justify-center gap-2">
          {ATTRS.map(({ label, key }) => (
            <div
              key={key}
              className={`flex flex-col items-center rounded px-4 py-1 min-w-[90px] ${PAIR_STATUS_STYLES[pairAnalysis[key]]}`}
            >
              <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
                {label}
              </span>
              <span className="text-sm font-bold capitalize">
                {pairAnalysis[key]}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (selected.length < 3) {
    return (
      <p className="text-neutral-300 text-sm text-center px-4">
        Pick {3 - selected.length} more card{3 - selected.length === 1 ? "" : "s"} to complete your set.
      </p>
    );
  }

  return <AttributePanel cards={selected.map((i) => board[i])} />;
}

// ── Main component ────────────────────────────────────────────────────────────

// Fixed heights of all chrome elements (keep in sync if you change padding/sizes):
//   caption:       h-24  = 96px
//   panel slot:    h-24  = 96px  (always reserved, visible only in interactive step)
//   exit button:   h-12  = 48px
//   gaps/padding:  ~40px (pt-4 + gap-3 × 4 + pb-4)
// Total non-board: 280px
// Board gets:      calc(100dvh - 280px)
const BOARD_HEIGHT = "h-[calc(100dvh-280px)]";

// For demo rows (3 cards) the board is much shorter — 1 row instead of 3,
// so we give it a third of the height plus a bit of breathing room.
const DEMO_HEIGHT = "h-[calc((100dvh-280px)/3+16px)]";

export default function Tutorial() {
  const [step, setStep] = useState(0);
  const [board, setBoard] = useState<CardAttributes[]>(() => randomBoardWithSet(12));
  const [selected, setSelected] = useState<number[]>([]);
  const [foundSet, setFoundSet] = useState<number[] | null>(null);
  const navigate = useNavigate();

  const vertical = window.innerWidth < window.innerHeight;
  const exampleSet = findSets(board)[0] ?? [0, 1, 2];
  const exampleCaption = describeSetCaption(exampleSet.map((index) => board[index]));

  const tutorialSteps: TutorialStep[] = [
    {
      caption: "Welcome to the Set tutorial!",
      board: colorDemo, highlight: [], duration: 2000,
    },
    {
      caption: "This is the color attribute. Only the color changes here.",
      board: colorDemo, highlight: [0, 1, 2], duration: 2500,
    },
    {
      caption: "This is the shape attribute. Only the shape changes here.",
      board: shapeDemo, highlight: [0, 1, 2], duration: 3500,
    },
    {
      caption: "This is the number attribute. Only the number changes here.",
      board: numberDemo, highlight: [0, 1, 2], duration: 3500,
    },
    {
      caption: "This is the shading attribute. Only the shading changes here.",
      board: shadingDemo, highlight: [0, 1, 2], duration: 3500,
    },
    {
      caption: "A set consists of 3 cards where, for each attribute, the cards are either all the same or all different.",
      board, highlight: exampleSet, duration: 5500,
    },
    {
      caption: "Let's look at an example set!",
      board, highlight: exampleSet, duration: 3500,
    },
    {
      caption: `These 3 cards form a set — ${exampleCaption}.`,
      board, highlight: exampleSet, duration: 6000,
    },
    {
      caption: "Now try to find a set! Select 3 cards — the panel above shows why it does or doesn't work.",
      board, highlight: [], duration: null, userFindSet: true,
    },
    {
      caption: "That's the basics! Good luck and have fun!",
      board, highlight: [], duration: 2500,
    },
  ];

  useEffect(() => {
    if (step >= tutorialSteps.length) {
      const t = setTimeout(() => navigate("/"), 2000);
      return () => clearTimeout(t);
    }
    const current = tutorialSteps[step];
    if (current.userFindSet) {
      setSelected([]);
      setFoundSet(null);
      setBoard(randomBoardWithSet(12));
      return;
    }
    if (current.duration !== null) {
      const t = setTimeout(() => setStep((s) => s + 1), current.duration);
      return () => clearTimeout(t);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCardClick(idx: number) {
    if (!tutorialSteps[step]?.userFindSet || foundSet) return;

    const newSelected = selected.includes(idx)
      ? selected.filter((i) => i !== idx)
      : selected.length < 3
        ? [...selected, idx]
        : [idx]; // 4th click starts a fresh selection

    setSelected(newSelected);

    if (newSelected.length === 3 && isSet(newSelected.map((i) => board[i]))) {
      setFoundSet([...newSelected]);
      setTimeout(() => {
        setStep((s) => s + 1);
        setFoundSet(null);
        setSelected([]);
      }, 1800);
    }
  }

  const currentStep = tutorialSteps[step];
  const currentBoard = currentStep?.board ?? board;
  const isDemoRow = currentBoard.length === 3;
  const showPanel = currentStep?.userFindSet;

  const boardHeight = isDemoRow ? DEMO_HEIGHT : BOARD_HEIGHT;

  return (
    <div
      className={`relative w-screen h-[100dvh] bg-neutral-900 overflow-hidden ${
        vertical ? "flex flex-col" : "grid grid-cols-6 grid-rows-1"
      }`}
    >
      <div
        className={`${
          vertical
            ? "w-full flex flex-col items-center"
            : "col-start-2 col-span-4 flex flex-col items-center"
        } h-full pt-4 pb-4 gap-3`}
      >
        {/* Caption — fixed height, text vertically centered so layout never shifts */}
        <div className="w-full flex justify-center px-4 shrink-0">
          <div className="h-24 flex items-center justify-center text-2xl text-white font-bold rounded max-w-2xl w-full text-center bg-neutral-800 px-4">
            {currentStep?.caption}
          </div>
        </div>

        {/* Attribute panel — always reserves h-24 so board position is stable */}
        <div className="h-24 w-full flex items-center justify-center shrink-0 overflow-hidden">
          {showPanel && <UserFindPanel board={board} selected={selected} />}
        </div>

        {/* Board — explicit height so cards can derive their width from aspect-[5/7] */}
        <div className={`${boardHeight} w-full flex items-center justify-center shrink-0`}>
          <Board
            cards={currentBoard}
            highlight={currentStep?.highlight ?? foundSet ?? []}
            tutorialMode={true}
            selected={selected}
            onCardClick={currentStep?.userFindSet ? handleCardClick : undefined}
          />
        </div>

        {/* Exit (bottom for vertical layout) */}
        {vertical && (
          <div className="shrink-0">
            <button
              className="w-40 h-12 border-2 bg-red-600 text-white text-xl rounded shadow"
              onClick={() => navigate("/")}
            >
              Exit Tutorial
            </button>
          </div>
        )}
      </div>
      {/* Exit (top-right for horizontal layout) */}
      {!vertical && (
        <div className="absolute top-4 right-4">
          <button
            className="w-40 h-12 border-2 bg-red-600 text-white text-xl rounded shadow"
            onClick={() => navigate("/")}
          >
            Exit Tutorial
          </button>
        </div>
      )}
    </div>
  );
}