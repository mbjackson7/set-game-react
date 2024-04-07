import { Socket } from "socket.io-client";
import { CardAttributes } from "./card";

export interface BoardProps {
  socket: Socket;
  onTable: CardAttributes[];
  selected: number[];
  gameState: string;
  userName: string;
  overflowLevel: number;
  className?: string;
}