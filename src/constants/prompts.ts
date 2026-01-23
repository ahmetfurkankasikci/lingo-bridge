// Phase 2: Prompt templates for Gemini API
// These templates ensure consistent, high-quality AI responses

/**
 * Generates a prompt for creating a vocabulary card with Turkish translation
 * @param word - The English word to teach
 * @param scenario - The daily-life context scenario
 * @returns Formatted prompt string for Gemini API
 */
export const createWordCardPrompt = (word: string, scenario: string): string => {
  return `You are an English teacher helping Turkish students learn practical vocabulary.

Word to teach: "${word}"

Task:
1. Provide the Turkish translation of "${word}"
2. Create ONE example sentence using "${word}" in the context of: ${scenario}
3. The sentence must be A2-B1 level (simple but natural)
4. The sentence must sound like something a real person would say in daily life

CRITICAL: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "meaningTr": "Turkish translation here",
  "context": "${scenario}",
  "exampleSentence": "Your example sentence here"
}`;
};
