export enum Mode {
  Generate = 'generate',
  Improve = 'improve',
}

export interface SuggestionCategory {
  category: string;
  suggestions: string[];
}

export interface HistoryItem {
  id: string;
  mode: Mode;
  input: string;
  output: string;
  timestamp: number;
  constraints?: string;
  language?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  plan: Plan;
  quotaUsed: number;
  quotaLimit: number;
}

export enum Plan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum PromptType {
  GENERATE = 'GENERATE',
  IMPROVE = 'IMPROVE',
}

export enum Visibility {
  PRIVATE = 'PRIVATE',
  WORKSPACE = 'WORKSPACE',
  PUBLIC = 'PUBLIC',
}

export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}
