export const analysisPrompt = `
Проанализируй диалог с клиентом и выведи JSON с извлеченной информацией.
Ответ строго в формате JSON без комментариев и лишнего текста.

Выведи:
{
  "mood": {
    "primary": "tired/energetic/sad/happy/neutral/focused/romantic/adventurous",
    "secondary": "stressed/relaxed/curious/nostalgic/...",
    "confidence": 0.0,
    "evidence": "Фраза из диалога, на основе которой сделан вывод"
  },
  "taste_profile": {
    "sweetness": "sweet/neutral/none",
    "sourness": "yes/neutral/no",
    "bitterness": "yes/neutral/no",
    "spicy": "yes/neutral/no",
    "floral": "yes/neutral/no"
  },
  "drink_params": {
    "temperature": "hot/cold/warm",
    "caffeine": "yes/low/no",
    "milk": "dairy/plant/none",
    "texture": "light/creamy/foamy"
  },
  "restrictions": {
    "is_vegan": true,
    "sugar_free": true,
    "allergies": [],
    "age_appropriate": true
  },
  "context": {
    "in_hurry": true,
    "to_go": true,
    "time_of_day": "morning/afternoon/evening",
    "is_tourist": true,
    "has_company": true,
    "special_occasion": "date/meeting/work/relaxation/none"
  },
  "special_wishes": "строка с особыми пожеланиями, если есть",
  "personalization_hints": {
    "profession": "programmer/artist/...",
    "hobbies": ["music", "gardening"],
    "cultural_context": "chinese/western/..."
  }
}
`;
