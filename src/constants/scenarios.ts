// Phase 2: Daily-life scenarios for vocabulary context generation
// These scenarios ensure AI generates practical, real-world example sentences

export const DAILY_LIFE_SCENARIOS = [
  'ordering food at a restaurant or cafe',
  'checking in at an airport or hotel',
  'shopping at a grocery store or mall',
  'having a casual conversation with friends',
  'asking for directions in a city',
  'visiting a doctor or pharmacy',
  'attending a workplace meeting',
  'making small talk with neighbors',
  'booking a taxi or ride-share',
  'calling customer service',
] as const;

// Helper to get a random scenario
export const getRandomScenario = (): string => {
  return DAILY_LIFE_SCENARIOS[Math.floor(Math.random() * DAILY_LIFE_SCENARIOS.length)];
};
