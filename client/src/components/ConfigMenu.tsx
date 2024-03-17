import { ConfigMenuProps } from "../models/configMenu";

export default function Board({
  config,
  setters
}: ConfigMenuProps) {
  const {
    timeLimit,
    setPoints,
    timeOutPenalty,
    wrongSetPenalty,
    allowDrawThree
  } = config;
  const {
    setTimeLimit,
    setSetPoints,
    setTimeOutPenalty,
    setWrongSetPenalty,
    setAllowDrawThree
  } = setters;
  return (
    <>
      <h1>Game Settings</h1>
      <div className="flex flex-col items-start">
        <label>Set Time Limit: </label>
        <input
          type="number"
          value={timeLimit}
          onChange={(e) => {
            if (
              (parseInt(e.target.value) > 0 &&
                parseInt(e.target.value) <= 60) ||
              e.target.value === ""
            ) {
              setTimeLimit(parseInt(e.target.value));
            }
          }}
        />
        <label>Points Per Set: </label>
        <input
          type="number"
          value={setPoints}
          onChange={(e) => {
            if (
              (parseInt(e.target.value) > 0 && parseInt(e.target.value) <= 9) ||
              e.target.value === ""
            ) {
              setSetPoints(parseInt(e.target.value));
            }
          }}
        />
        <label>Time Out Points Penalty: </label>
        <input
          type="number"
          value={timeOutPenalty}
          onChange={(e) => {
            if (
              (parseInt(e.target.value) >= 0 &&
                parseInt(e.target.value) <= 9) ||
              e.target.value === ""
            ) {
              setTimeOutPenalty(parseInt(e.target.value));
            }
          }}
        />
        <label>Wrong Set Points Penalty: </label>
        <input
          type="number"
          value={wrongSetPenalty}
          onChange={(e) => {
            if (
              (parseInt(e.target.value) >= 0 &&
                parseInt(e.target.value) <= 9) ||
              e.target.value === ""
            ) {
              setWrongSetPenalty(parseInt(e.target.value));
            }
          }}
        />
        <label>Allow Draw Three: </label>
        <input
          type="checkbox"
          checked={allowDrawThree}
          onChange={() => setAllowDrawThree(!allowDrawThree)}
        />
      </div>
    </>
  );
}
