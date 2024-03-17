export interface ScoreboardProps {
  players: string[];
  scores: { [key: string]: number };
  gameState: string;
  className?: string;
}