import { createClient } from '@supabase/supabase-js';

// Supabase URL et clé anonyme (publique)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour la base de données
export type User = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  quota_used: number;
  quota_limit: number;
  stripe_id: string | null;
  subscription_id: string | null;
  reset_date: string | null;
  created_at: string;
};

export type Prompt = {
  id: string;
  user_id: string;
  type: 'GENERATE' | 'IMPROVE';
  input: string;
  output: string;
  constraints: string | null;
  language: string | null;
  model: string;
  tokens: number | null;
  favorited: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type Database = {
  users: User;
  prompts: Prompt;
};
