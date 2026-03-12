/**
 * AIJournalService
 * Provides journaling prompts and reflection suggestions using AI (stub for now).
 * TODO: Integrate with real AI backend/service (e.g., OpenAI, local LLM, etc.)
 */

export class AIJournalService {
  static async getPrompt(): Promise<string> {
    try {
      const res = await fetch('/api/ai/prompt', { method: 'GET', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch prompt');
      const data = await res.json();
      if (!(data as any).prompt) throw new Error('No prompt returned');
      return (data as any).prompt;
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : 'Unknown error fetching AI prompt.');
    }
  }

  static async getReflectionSuggestion(): Promise<string> {
    try {
      const res = await fetch('/api/ai/reflection', { method: 'GET', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch reflection suggestion');
      const data = await res.json();
      if (!(data as any).suggestion) throw new Error('No suggestion returned');
      return (data as any).suggestion;
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : 'Unknown error fetching AI reflection.');
    }
  }
}
