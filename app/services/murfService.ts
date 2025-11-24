export interface MurfStreamOptions {
  text: string;
  voiceId?: string;
  multiNativeLocale?: string;
  onChunk?: (chunk: Uint8Array) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export class MurfService {
  /**
   * Stream text-to-speech audio from Murf.ai
   */
  static async streamSpeech(options: MurfStreamOptions): Promise<void> {
    const {
      text,
      voiceId = 'en-US-matthew',
      multiNativeLocale = 'en-US',
      onChunk,
      onComplete,
      onError,
    } = options;

    try {
      const response = await fetch('/api/murf/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceId,
          multiNativeLocale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        const errorDetails = errorData.details ? `\nDetails: ${errorData.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete?.();
          break;
        }

        if (value && onChunk) {
          onChunk(value);
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      onError?.(err);
      throw err;
    }
  }

  /**
   * Generate complete audio file from text
   */
  static async generateAudio(
    text: string,
    voiceId?: string,
    multiNativeLocale?: string
  ): Promise<Blob> {
    const chunks: Uint8Array[] = [];

    await this.streamSpeech({
      text,
      voiceId,
      multiNativeLocale,
      onChunk: (chunk) => {
        chunks.push(chunk);
      },
    });

    return new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
  }

  /**
   * Play audio directly in the browser
   */
  static async playAudio(
    text: string,
    voiceId?: string,
    multiNativeLocale?: string
  ): Promise<HTMLAudioElement> {
    const audioBlob = await this.generateAudio(text, voiceId, multiNativeLocale);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    await audio.play();
    return audio;
  }
}

// Available voice IDs (common ones)
export const MURF_VOICES = {
  'en-US-matthew': 'Matthew (US Male)',
  'en-US-natalie': 'Natalie (US Female)',
  'en-US-terrell': 'Terrell (US Male)',
  'en-US-clint': 'Clint (US Male)',
  'en-GB-charles': 'Charles (UK Male)',
  'en-GB-lily': 'Lily (UK Female)',
  'en-AU-wayne': 'Wayne (AU Male)',
  'en-IN-arvind': 'Arvind (IN Male)',
} as const;

export type MurfVoiceId = keyof typeof MURF_VOICES;
