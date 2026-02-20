export interface FashionAnalysis {
  score: number;
  critique: string;
  suggestions: string[];
  colorPalette: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface StylingSuggestion {
  id: string;
  text: string;
}
