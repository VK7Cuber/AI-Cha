import api from './api';

export interface GeneratedIngredient {
  ingredient_id: string;
  amount?: string | null;
  preparation_note?: string | null;
  ingredient?: {
    id: string;
    name_ru: string;
    name_zh?: string;
    category_id?: string;
  };
}

export interface GeneratedRecipe {
  id: string;
  session_id: string;
  name_ru: string;
  name_zh?: string;
  description_ru?: string;
  reasoning_ru?: string;
  personal_message?: string | null;
  preparation_steps?: { step: number; instruction: string }[];
  serving_style?: unknown | null;
  temperature?: 'hot' | 'cold' | 'warm';
  total_price?: string;
  preparation_time_minutes?: number;
  ingredients?: GeneratedIngredient[];
}

export async function generateRecipe(sessionId: string): Promise<GeneratedRecipe> {
  const res = await api.post<GeneratedRecipe>('/recipes/generate', { session_id: sessionId });
  return res.data;
}

export async function fetchGeneratedRecipes(sessionId: string): Promise<GeneratedRecipe[]> {
  const res = await api.get<GeneratedRecipe[]>(`/recipes/generated/${sessionId}`);
  return res.data;
}
