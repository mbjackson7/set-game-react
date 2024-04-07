import { ScoreboardProps } from "../models/scoreboard";

export default function Scoreboard({
  players,
  scores,
  gameState,
  className,
}: ScoreboardProps) {
  const sortedPlayers = players.sort((a, b) => scores[b] - scores[a]);
  const vertical = window.innerWidth < window.innerHeight;

  const getColor = (index: number) => {
    if (index === 0) return "text-yellow-400";
    if (index === 1) return "text-gray-300";
    if (index === 2) return "text-yellow-600";
    return "text-white";
  }

  return (
    <div className={`text-left flex flex-col ${className}`}>
      <h1 className="pb-2">Scores:</h1>
      <div className={`${vertical && "overflow-scroll"} h-full`}>
        <ul className={`flex flex-col`}>
          {sortedPlayers.map((player: string, index: number) => (
            <li
              key={player}
              className={gameState === player ? "bg-green-800 p-1 rounded-lg" : "p-1"}
            >
              <p className={`text-xl ${getColor(index)}`}>{index + 1}: {player} <span className="float-right">{scores[player]}</span></p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
