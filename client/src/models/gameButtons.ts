import { Socket } from "socket.io-client";

export interface GameButtonsProps {
  socket: Socket;
  gameState: string;
  setGameState: (gameState: string) => void;
  userName: string;
  overflowLevel: number;
  allowDrawThree: boolean;
}