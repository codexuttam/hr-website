'use client';

import { useState } from 'react';
import { MurfService, MURF_VOICES, MurfVoiceId } from '../services/murfService';

export default function MurfTextToSpeech() {
  const [text, setText] = useState('Hello! How can I assist you today?');
  const [voiceId, setVoiceId] = useState<MurfVoiceId>('en-US-matthew');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    // Clean up previous audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const audioBlob = await MurfService.generateAudio(text, voiceId);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      console.error('Generate audio error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayDirect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await MurfService.playAudio(text, voiceId);
    } catch (err) {
      console.error('Play audio error:', err);
      setError(err instanceof Error ? err.message : 'Failed to play audio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Murf.ai Text-to-Speech</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Text to Convert</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 border rounded-lg min-h-[100px]"
          placeholder="Enter text to convert to speech..."
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Voice</label>
        <select
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value as MurfVoiceId)}
          className="w-full p-3 border rounded-lg"
        >
          {Object.entries(MURF_VOICES).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleGenerate}
          disabled={isLoading || !text.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Audio'}
        </button>

        <button
          onClick={handlePlayDirect}
          disabled={isLoading || !text.trim()}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Playing...' : 'Play Direct'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {audioUrl && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Generated Audio</label>
          <audio controls src={audioUrl} className="w-full" />
          <a
            href={audioUrl}
            download="murf-audio.mp3"
            className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Download MP3
          </a>
        </div>
      )}
    </div>
  );
}
