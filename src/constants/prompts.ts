// Phase 2: Prompt templates for Gemini API
// Focus: Quality B1-level sentences with conjunctions for daily life contexts

/**
 * Generates a prompt for creating a vocabulary card with Turkish translation
 * Focuses on B1 complexity with conjunctions and proper word count
 * @param word - The English word to teach
 * @returns Formatted prompt string for Gemini API
 */
export const createWordCardPrompt = (word: string): string => {
  return `You are an English teacher helping Turkish students learn practical vocabulary.

Word to teach: "${word}"

Task:
1. Provide the Turkish translation of "${word}"
2. Generate ONE example sentence using "${word}" that follows these rules:
   - Strictly between 10 to 20 words
   - Use at least one conjunction (and, but, so, because, although)
   - B1 level complexity (clear but not too simple)
   - Grounded in daily life situations
   - Natural and practical - something a real person would say

CRITICAL: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "meaningTr": "Turkish translation here",
  "exampleSentence": "Your example sentence here"
}`;
};
