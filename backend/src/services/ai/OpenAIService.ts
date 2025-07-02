/**
 * OpenAIService
 * Provides journaling prompts, reflection suggestions, and voice-to-text using OpenAI API.
 * TODO: Integrate with real OpenAI API and secure key management.
 */
import axios from 'axios';
import FormData from 'form-data';

export class OpenAIService {
  private static readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  private static readonly OPENAI_API_URL = 'https://api.openai.com/v1';

  static async getPrompt(): Promise<string> {
    // TODO: Replace with real OpenAI API call
    return 'Describe a moment today that made you smile.';
    // Example for real API:
    // const res = await axios.post('https://api.openai.com/v1/chat/completions', ...);
    // return res.data.choices[0].message.content;
  }

  static async getReflectionSuggestion(): Promise<string> {
    // TODO: Replace with real OpenAI API call
    return 'Reflect on a recent challenge and what you learned from it.';
  }

  /**
   * Transcribe audio to text using OpenAI Whisper API
   * @param audioBuffer - Audio file buffer
   * @param filename - Original filename for proper content type detection
   * @returns Transcribed text
   */
  static async transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
    // For development mode, return mock transcription
    if (process.env.NODE_ENV !== 'production' || !this.OPENAI_API_KEY) {
      return 'This is a mock transcription of your voice recording. In production, this would be the actual transcribed text from your audio.';
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBuffer, {
        filename: filename,
        contentType: this.getContentType(filename),
      });
      formData.append('model', 'whisper-1');
      formData.append('language', 'en'); // Can be made configurable
      formData.append('response_format', 'text');

      const response = await axios.post(`${this.OPENAI_API_URL}/audio/transcriptions`, formData, {
        headers: {
          Authorization: `Bearer ${this.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
        maxContentLength: 25 * 1024 * 1024, // 25MB limit
        maxBodyLength: 25 * 1024 * 1024,
      });

      return response.data.trim();
    } catch (error) {
      console.error('OpenAI Whisper API error:', error);
      throw new Error('Failed to transcribe audio. Please try again.');
    }
  }

  /**
   * Get content type based on file extension
   */
  private static getContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'mp3':
        return 'audio/mpeg';
      case 'mp4':
        return 'audio/mp4';
      case 'm4a':
        return 'audio/mp4';
      case 'wav':
        return 'audio/wav';
      case 'webm':
        return 'audio/webm';
      case 'ogg':
        return 'audio/ogg';
      default:
        return 'audio/mpeg';
    }
  }
}
