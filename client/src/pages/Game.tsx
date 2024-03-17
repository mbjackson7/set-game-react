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
  const rotate = window.innerWidth < window.innerHeight ? "rotate-90" : "";
  const [message, setMessage] = useState<Message>({ text: "", color: "" });
  const [timer, setTimer] = useState<number>(0);
  const timerID = useRef<NodeJS.Timeout | null>(null);
  const messageTimeID = useRef<NodeJS.Timeout | null>(null);

  const [drawThreeButton, setDrawThreeButton] = useState(false);
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
    setDrawThreeButton(state.drawThree ?? false);
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

  const drawThree = () => {
    socket.emit("draw-three");
  };

  const beginGame = () => {
    socket.emit("start-game", {
      drawThree: drawThreeButton,
      timeLimit: timeLimit,
      setPoints: setPoints,
      timeOutPenalty: timeOutPenalty,
      wrongSetPenalty: wrongSetPenalty,
    });
  };

  const select = (index: number) => {
    if (gameState === userName) {
      socket.emit("select", index);
    }
  };

  const callSet = () => {
    if (gameState === "in-progress") {
      setGameState(userName ? userName : "");
      socket.emit("call-set");
    }
  };

  const playAgain = () => {
    socket.emit("play-again");
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
          <h1>Game Settings</h1>
          <div className="flex flex-col items-start">
            <label>Set Time Limit: </label>
            <input
              type="number"
              value={timeLimit}
              min="1"
              max="60"
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
            />
            <label>Points Per Set: </label>
            <input
              type="number"
              value={setPoints}
              min="1"
              max="9"
              onChange={(e) => setSetPoints(parseInt(e.target.value))}
            />
            <label>Time Out Points Penalty: </label>
            <input
              type="number"
              value={timeOutPenalty}
              min="1"
              max="9"
              onChange={(e) => setTimeOutPenalty(parseInt(e.target.value))}
            />
            <label>Wrong Set Points Penalty: </label>
            <input
              type="number"
              value={wrongSetPenalty}
              min="1"
              max="9"
              onChange={(e) => setWrongSetPenalty(parseInt(e.target.value))}
            />
            <label>Allow Draw Three: </label>
            <input
              type="checkbox"
              checked={drawThreeButton}
              onChange={() => setDrawThreeButton(!drawThreeButton)}
            />
          </div>
          <br />
          <div className="flex flex-row gap-4 p-4">
            <StylizedButton color="bg-blue-500" onClick={beginGame}>
              Start Game
            </StylizedButton>
          </div>
        </div>
      ) : (
        // game is in progress
        <>
          <div className="flex flex-row gap-4 p-4">
            <div className="text-center">
              <h1>Scores</h1>
              <ul className="flex flex-row gap-5">
                {players.map((player) => (
                  <li
                    key={player}
                    className={gameState === player ? "text-yellow-400" : ""}
                  >
                    {player}: {scores[player]}
                  </li>
                ))}
              </ul>
            </div>
            <Timer time={timer} />
          </div>
          <div
            className={`grid grid-rows-3 grid-cols-${
              overflowLevel + 4
            } grid-flow-col gap-2 h-5/6 max-h-[96vw] max-w-[90vw] aspect-${
              rotate ? (overflowLevel ? 5 : 4) : overflowLevel + 4
            }/4 ${rotate}`}
          >
            {onTable.map((card, index) => {
              return (
                <button
                  key={index}
                  className="flex justify-center h-full aspect-5/7"
                  onClick={() => {
                    select(index);
                  }}
                >
                  <Card
                    key={index}
                    attributes={card}
                    selected={selected.includes(index)}
                    disabled={
                      gameState !== "in-progress" && gameState !== userName
                    }
                  />
                </button>
              );
            })}
          </div>
          <div className="flex flex-row gap-4 p-4">
            {gameState == "game-over" ? (
              <StylizedButton color="bg-purple-800" onClick={playAgain}>
                Play Again
              </StylizedButton>
            ) : (
              <>
                {drawThreeButton && (
                  <StylizedButton
                    color="bg-red-800"
                    onClick={drawThree}
                    disabled={gameState !== "in-progress"}
                  >
                    Draw 3
                  </StylizedButton>
                )}

                <StylizedButton
                  color="bg-green-800"
                  onClick={callSet}
                  disabled={gameState !== "in-progress"}
                >
                  Set!
                </StylizedButton>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
