export enum Mode {
  Generate = 'generate',
  Improve = 'improve',
}

export interface SuggestionCategory {
  category: string;
  suggestions: string[];
}
