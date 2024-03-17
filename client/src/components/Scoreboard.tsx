import { ScoreboardProps } from "../models/scoreboard";

export default function Scoreboard({ players, scores, gameState }: ScoreboardProps) {
  return (
    <div className="text-center">
      <h1>Scores</h1>
      <ul className="flex flex-row gap-5">
        {players.map((player: string) => (
          <li
            key={player}
            className={gameState === player ? "text-yellow-400" : ""}
          >
            {player}: {scores[player]}
          </li>
        ))}
      </ul>
    </div>
  );
}