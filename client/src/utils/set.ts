import { CardAttributes } from "../models/card";

// Returns true if the three cards form a set
export function isSet(cards: CardAttributes[]): boolean {
  if (cards.length !== 3) return false;
  const attrs = ["color", "shape", "number", "shading"] as const;
  for (const attr of attrs) {
    const values = cards.map((c) => c[attr]);
    const allSame = values.every((v) => v === values[0]);
    const allDiff = new Set(values).size === 3;
    if (!(allSame || allDiff)) return false;
  }
  return true;
}

// Find all sets on a board
export function findSets(board: CardAttributes[]): number[][] {
  const sets: number[][] = [];
  for (let i = 0; i < board.length; i++) {
    for (let j = i + 1; j < board.length; j++) {
      for (let k = j + 1; k < board.length; k++) {
        if (isSet([board[i], board[j], board[k]])) {
          sets.push([i, j, k]);
        }
      }
    }
  }
  return sets;
}

const COLORS  = ["red", "green", "purple"] as const;
const SHAPES  = ["oval", "squiggle", "diamond"] as const;
const NUMBERS = [1, 2, 3] as const;
const SHADINGS = ["solid", "striped", "open"] as const;

// The full 81-card Set deck — every unique combination of the four attributes.
// fill mirrors shading (legacy support) so they are always consistent.
function fullDeck(): CardAttributes[] {
  const deck: CardAttributes[] = [];
  for (const color of COLORS) {
    for (const shape of SHAPES) {
      for (const number of NUMBERS) {
        for (const shading of SHADINGS) {
          deck.push({ color, shape, number, shading });
        }
      }
    }
  }
  return deck; // 81 cards, all unique
}

// Fisher-Yates shuffle (in-place)
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate a random board with at least one set, guaranteed no duplicate cards.
// Draws `size` cards from a shuffled full deck, re-shuffling until a set exists.
export function randomBoardWithSet(size = 12): CardAttributes[] {
  if (size > 81) throw new Error("Board size cannot exceed the 81-card deck");

  let tries = 0;
  while (tries < 200) {
    const board = shuffle(fullDeck()).slice(0, size);
    if (findSets(board).length > 0) return board;
    tries++;
  }

  // Fallback: should essentially never happen for size ≤ 12,
  // but return the last board rather than crashing.
  return shuffle(fullDeck()).slice(0, size);
}