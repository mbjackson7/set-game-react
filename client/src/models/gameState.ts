import { CardAttributes } from "./card";

export interface GameState{
    gameState: string;
    scores: { [key: string]: number };
    players: string[];
    deck: CardAttributes[];
    onTable: CardAttributes[];
    selected: number[];
    overflowLevel: number;
}