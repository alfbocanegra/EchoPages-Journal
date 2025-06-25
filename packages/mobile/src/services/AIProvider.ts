// AIProvider.ts
// Service for AI-powered features (prompt generation, etc.)

export type AIProviderStatus = 'idle' | 'loading' | 'error' | 'ready';

export class AIProvider {
  static status: AIProviderStatus = 'idle';
  static model: string = 'StubModel-v1';

  static async generatePrompt(context?: string): Promise<string> {
    this.status = 'loading';
    // Simulate network/API call
    return new Promise(resolve => {
      setTimeout(() => {
        this.status = 'ready';
        resolve(
          context
            ? `Write about how ${context} has impacted your life recently.`
            : 'Describe a meaningful moment from your week.'
        );
      }, 1200);
    });
  }

  static getStatus(): AIProviderStatus {
    return this.status;
  }

  static getModel(): string {
    return this.model;
  }

  static async searchEntries(query: string, entries: string[]): Promise<string[]> {
    this.status = 'loading';
    return new Promise(resolve => {
      setTimeout(() => {
        this.status = 'ready';
        // Return entries that contain any word from the query (stub logic)
        const q = query.toLowerCase();
        resolve(entries.filter(e => e.toLowerCase().includes(q.split(' ')[0])));
      }, 1200);
    });
  }

  static async summarizeEntries(entries: string[]): Promise<string> {
    this.status = 'loading';
    return new Promise(resolve => {
      setTimeout(() => {
        this.status = 'ready';
        resolve(`Summary: These entries reflect on gratitude, growth, and personal moments.`);
      }, 1200);
    });
  }
}
