import StylizedButton from "./StylizedButton";
import { GameButtonsProps } from "../models/gameButtons";

export default function GameButtons({socket, gameState, setGameState, userName, overflowLevel, allowDrawThree}: GameButtonsProps) {
  const drawThree = () => {
    socket.emit("draw-three");
  };

  const callSet = () => {
    if (gameState === "in-progress") {
      setGameState(userName ?? "");
      socket.emit("call-set");
    }
  };

  const playAgain = () => {
    socket.emit("play-again");
  };

  return (
    <div className="flex flex-row gap-4 p-4">
            {gameState == "game-over" ? (
              <StylizedButton color="bg-purple-800" onClick={playAgain}>
                Play Again
              </StylizedButton>
            ) : (
              <>
                {allowDrawThree && (
                  <StylizedButton
                    color="bg-red-800"
                    onClick={drawThree}
                    disabled={gameState !== "in-progress" || overflowLevel >= 2}
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
  );
}
