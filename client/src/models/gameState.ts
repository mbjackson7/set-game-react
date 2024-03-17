import { CardAttributes } from "./card";

export interface GameState {
  gameState: string;
  scores: { [key: string]: number };
  players: string[];
  onTable: CardAttributes[];
  selected: number[];
  overflowLevel: number;
  drawThree?: boolean;
  timeLimit?: number;
}
