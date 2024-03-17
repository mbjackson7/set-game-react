import { useEffect, useState, useRef } from "react";
import Card from "../components/Card";
import { CardAttributes } from "../models/card";
import { GameState } from "../models/gameState";
import { Message } from "../models/messageModal";
import { socket } from "../socket";
import { useParams, useNavigate } from "react-router-dom";
import MessageModal from "../components/MessageModal";
import Timer from "../components/Timer";
import StylizedButton from "../components/StylizedButton";
import GameButtons from "../components/GameButtons";
import Board from "../components/Board";
import Scoreboard from "../components/Scoreboard";
import ConfigMenu from "../components/ConfigMenu";

export default function Game() {
  const [gameState, setGameState] = useState<string>("waiting");
  const [onTable, setOnTable] = useState<CardAttributes[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [overflowLevel, setOverflowLevel] = useState<number>(0);
  const room = useParams<{ id: string }>().id;
  const userName = useParams<{ name: string }>().name;
  const [players, setPlayers] = useState<string[]>([userName ? userName : ""]);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const navigate = useNavigate();
  const [message, setMessage] = useState<Message>({ text: "", color: "" });
  const [timer, setTimer] = useState<number>(0);
  const timerID = useRef<NodeJS.Timeout | null>(null);
  const messageTimeID = useRef<NodeJS.Timeout | null>(null);

  const [allowDrawThree, setAllowDrawThree] = useState(false);
  const [timeLimit, setTimeLimit] = useState(10);
  const [setPoints, setSetPoints] = useState(1);
  const [timeOutPenalty, setTimeOutPenalty] = useState(1);
  const [wrongSetPenalty, setWrongSetPenalty] = useState(1);

  function updateState(state: GameState) {
    setOnTable(state.onTable);
    setScores(state.scores);
    setGameState(state.gameState);
    setOverflowLevel(state.overflowLevel);
    setSelected(state.selected);
    setPlayers(state.players);
    console.log(state);
    setAllowDrawThree(state.drawThree ?? false);
    setTimeLimit(state.timeLimit ?? 10);
  }

  useEffect(() => {
    socket.disconnect();
    socket.connect();
    socket.emit("join-room", room, userName);
  }, [room, userName]);

  useEffect(() => {
    socket.on("already-in-room", () => {
      console.log("already in room");
      navigate("/");
    });

    socket.on("game-started", (state: GameState) => {
      setMessage({ text: "", color: "" });
      updateState(state);
    });

    socket.on("user-connected", (player: string, state: GameState) => {
      console.log(player + " connected");
      updateState(state);
    });

    socket.on("set-called", (player: string) => {
      if (player !== userName) {
        sendMessage({ text: player + " called set!", color: "green" });
      }
      setGameState(player);
      setTimer(timeLimit);
    });

    socket.on("card-selected", (index: number) => {
      setSelected((selected) => [...selected, index]);
    });

    socket.on("card-deselected", (index: number) => {
      setSelected((selected) => selected.filter((i) => i !== index));
    });

    socket.on("cards-added", (state: GameState) => {
      updateState(state);
    });

    socket.on("set-found", (state: GameState, player: string) => {
      clearTimer();
      sendMessage(
        { text: player + " found a set!", color: "green" },
        state,
        updateState
      );
    });

    socket.on("set-not-found", (state: GameState, player: string) => {
      clearTimer();
      sendMessage(
        { text: player + " couldn't find a set :(", color: "red" },
        state,
        updateState
      );
    });

    socket.on("game-over", (state: GameState) => {
      clearTimer();
      console.log("Game over pt 1");
      const winner = Object.keys(state.scores).reduce(function (a, b) {
        return state.scores[a] > state.scores[b] ? a : b;
      });
      console.log(`Game Over, ${winner} wins in ${room}!`);
      sendMessage(
        { text: `No more sets, ${winner} won!`, color: "red" },
        state,
        updateState,
        true
      );
    });

    socket.on("user-disconnected", (player: string) => {
      console.log(player + " disconnected");
      if (player !== userName) {
        setPlayers((players) => players.filter((p) => p !== player));
      }
    });

    return () => {
      socket.off("game-started");
      socket.off("user-connected");
      socket.off("set-called");
      socket.off("card-selected");
      socket.off("card-deselected");
      socket.off("cards-added");
      socket.off("set-found");
      socket.off("set-not-found");
      socket.off("game-over");
      socket.off("user-disconnected");
    };
  }, [timeLimit, room, userName, navigate]);

  useEffect(() => {
    timer > 0 &&
      (timerID.current = setTimeout(() => setTimer(timer - 1), 1000));
  }, [timer]);

  function clearTimer() {
    if (timerID.current) {
      clearTimeout(timerID.current);
      timerID.current = null;
    }
    setTimer(0);
  }

  function sendMessage(
    message: Message,
    state?: GameState,
    updateState?: (state: GameState) => void,
    untimed?: boolean
  ) {
    setMessage(message);
    if (messageTimeID.current) {
      clearTimeout(messageTimeID.current);
    }
    messageTimeID.current = setTimeout(() => {
      if (!untimed) {
        setMessage({ text: "", color: "" });
      }
      if (state && updateState) {
        updateState(state);
      }
    }, 2500);
  }

  const beginGame = () => {
    socket.emit("start-game", {
      drawThree: allowDrawThree,
      timeLimit: timeLimit,
      setPoints: setPoints,
      timeOutPenalty: timeOutPenalty,
      wrongSetPenalty: wrongSetPenalty,
    });
  };

  return (
    <div className="h-[calc(100dvh)] w-screen flex flex-col items-center justify-between p-10">
      {message.text && <MessageModal message={message} />}
      {gameState === "waiting" ? (
        <div className="h-full w-full flex flex-col items-center justify-center">
          <h1>Room</h1>
          <h2>{room}</h2>
          <h1>Current Players:</h1>
          <ul>
            {players.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
          <br />
          <ConfigMenu 
            config={{
              timeLimit,
              setPoints,
              timeOutPenalty,
              wrongSetPenalty,
              allowDrawThree
            }}
            setters={{
              setTimeLimit,
              setSetPoints,
              setTimeOutPenalty,
              setWrongSetPenalty,
              setAllowDrawThree
            }}
          />
          <br />
          <div className="flex flex-row gap-4 p-4">
            <StylizedButton color="bg-blue-500" onClick={beginGame}>
              Start Game
            </StylizedButton>
          </div>
        </div>
      ) : (
        // game is in progress
            <Scoreboard
              players={players}
              scores={scores}
              gameState={gameState}
            />
            <Timer time={timer} />
          </div>
          <Board
            socket={socket}
            onTable={onTable}
            selected={selected}
            gameState={gameState}
            userName={userName ?? ""}
            overflowLevel={overflowLevel}
          />
          <GameButtons
            socket={socket}
            gameState={gameState}
            setGameState={setGameState}
            userName={userName ?? ""}
            overflowLevel={overflowLevel}
            allowDrawThree={allowDrawThree}
          />
        </>
      )}
    </div>
  );
}
