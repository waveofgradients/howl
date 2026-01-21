// Text-to-Speech - ElevenLabs via Netlify function or local server

const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

// Determine API endpoint based on environment
function getApiUrl(): string {
  if (typeof window === 'undefined') return '/api/tts';
  
  // If on localhost with port 5173/5174, use local server
  if (window.location.hostname === 'localhost' || window.location.port) {
    return `http://${window.location.hostname}:3001/api/tts`;
  }
  
  // Otherwise use Netlify function
  return '/api/tts';
}

// Fetch audio from API (Netlify function or local server)
async function fetchAudio(text: string): Promise<string> {
  const cacheKey = text.toLowerCase().trim();
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  const response = await fetch(getApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`TTS error: ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  audioCache.set(cacheKey, url);
  return url;
}

// Play audio URL
function playAudioUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => { currentAudio = null; resolve(); };
    audio.onerror = () => { currentAudio = null; reject(new Error('Playback failed')); };
    audio.play().catch(reject);
  });
}

// Browser speech synthesis fallback
function playBrowserTTS(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('No TTS available'));
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const usVoice = voices.find(v => v.lang === 'en-US');
    if (usVoice) utterance.voice = usVoice;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') resolve();
      else reject(new Error(e.error));
    };

    setTimeout(() => window.speechSynthesis.speak(utterance), 50);
  });
}

// Main TTS function - tries ElevenLabs first, falls back to browser
export async function playTextToSpeech(text: string): Promise<void> {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  window.speechSynthesis.cancel();

  try {
    const audioUrl = await fetchAudio(text);
    await playAudioUrl(audioUrl);
  } catch {
    // Fallback to browser TTS
    await playBrowserTTS(text);
  }
}

// Prefetch audio (best effort)
export async function prefetchAudio(text: string): Promise<void> {
  try {
    await fetchAudio(text);
  } catch {
    // Ignore prefetch errors
  }
}
