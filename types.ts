export enum LineType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  SYSTEM = 'SYSTEM',
  AI = 'AI'
}

export interface TerminalLine {
  id: string;
  type: LineType;
  content: string;
  timestamp: number;
}

export enum GameMode {
  IDLE = 'IDLE',
  NUMBER_GUESS = 'NUMBER_GUESS',
  RIDDLE_GUESS = 'RIDDLE_GUESS'
}

export interface RiddleData {
  question: string;
  answer: string;
  hint: string;
}

export interface GameState {
  mode: GameMode;
  targetNumber?: number;
  attempts: number;
  riddleData?: RiddleData;
}
