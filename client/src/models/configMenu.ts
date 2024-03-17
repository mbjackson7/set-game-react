export interface Config {
  timeLimit: number;
  setPoints: number;
  timeOutPenalty: number;
  wrongSetPenalty: number;
  allowDrawThree: boolean;
}

export interface ConfigMenuProps {
  config: Config;
  setters: {
    setTimeLimit: (timeLimit: number) => void;
    setSetPoints: (setPoints: number) => void;
    setTimeOutPenalty: (timeOutPenalty: number) => void;
    setWrongSetPenalty: (wrongSetPenalty: number) => void;
    setAllowDrawThree: (allowDrawThree: boolean) => void;
  };
}