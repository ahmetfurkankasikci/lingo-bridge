// Phase 2: Prompt templates for Gemini API
// Focus: Quality B1-level sentences with conjunctions for daily life contexts

/**
 * Generates a prompt for creating a vocabulary card with Turkish translation
 * Focuses on B1 complexity with conjunctions and proper word count
 * AI wraps the target word with ** markers for highlighting
 * @param word - The English word to teach
 * @returns Formatted prompt string for Gemini API
 */
export const createWordCardPrompt = (word: string): string => {
  return `You are an English teacher helping Turkish students learn practical vocabulary.

Word to teach: "${word}"

Task:
1. Provide the Turkish translation of "${word}"
2. Generate ONE example sentence using "${word}" (or its conjugated form) that follows these rules:
   - Strictly between 10 to 20 words
   - Use at least one conjunction (and, but, so, because, although)
   - B1 level complexity (clear but not too simple)
   - Grounded in daily life situations
   - Natural and practical - something a real person would say
3. IMPORTANT: In the example sentence, wrap the target word (or its conjugated form) with double asterisks like **word** so it can be highlighted

Example format for the sentence:
- If the word is "drink": "I usually **drink** coffee in the morning, but today I want tea."
- If the word is "go": "She **goes** to the gym every day because she wants to stay healthy."

CRITICAL: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "meaningTr": "Turkish translation here",
  "exampleSentence": "Your example sentence with **target word** wrapped in asterisks"
}`;
};

/**
 * Generates a prompt for regenerating ONLY the example sentence
 * Used for weekly context evolution - keeps same Turkish meaning
 * @param word - The English word
 * @param meaningTr - The existing Turkish translation to preserve
 * @returns Formatted prompt string for Gemini API
 */
export const createRegeneratePrompt = (word: string, meaningTr: string): string => {
  return `You are an English teacher helping Turkish students learn practical vocabulary.

Word: "${word}"
Turkish meaning (keep this unchanged): "${meaningTr}"

Task:
Generate a NEW and DIFFERENT example sentence using "${word}" (or its conjugated form) that follows these rules:
- Strictly between 10 to 20 words
- Use at least one conjunction (and, but, so, because, although)
- B1 level complexity (clear but not too simple)
- Grounded in daily life situations
- Make it DIFFERENT from any previous sentence - use a new scenario
- Wrap the target word with double asterisks like **word** for highlighting

CRITICAL: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "exampleSentence": "Your NEW example sentence with **target word** wrapped in asterisks"
}`;
};
