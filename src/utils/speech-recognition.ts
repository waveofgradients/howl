// Speech Recognition for pronunciation scoring

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface RecognitionResult {
  transcript: string;
  confidence: number;
}

// Check if on iOS
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Check if Safari
function isSafari(): boolean {
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/CriOS/.test(ua) && !/FxiOS/.test(ua) && !/Chrome/.test(ua);
}

// Check availability
export function isSpeechRecognitionAvailable(): boolean {
  const hasAPI = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  if (isIOS() && !isSafari()) return false;
  return hasAPI;
}

// Get helpful error message
export function getSpeechRecognitionError(): string {
  if (isIOS() && !isSafari()) {
    return 'Open in Safari for voice recognition.';
  }
  return 'Use Chrome or Safari.';
}

// Start listening - FAST timeout
export function startListening(): Promise<RecognitionResult> {
  return new Promise((resolve, reject) => {
    if (!isSpeechRecognitionAvailable()) {
      reject(new Error('Speech recognition not supported.'));
      return;
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let resolved = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const cleanup = () => {
      clearTimeout(timeoutId);
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };

    // 3 second timeout - FAST
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        recognition.abort();
        reject(new Error('no-speech'));
      }
    }, 3000);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (resolved) return;
      resolved = true;
      cleanup();

      const result = event.results[0];
      if (result && result[0]) {
        resolve({ 
          transcript: result[0].transcript, 
          confidence: result[0].confidence 
        });
      } else {
        reject(new Error('Could not understand.'));
      }
    };

    recognition.onerror = (event: Event & { error: string }) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      reject(new Error(event.error));
    };

    recognition.onend = () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error('no-speech'));
      }
    };

    try {
      recognition.start();
    } catch {
      resolved = true;
      cleanup();
      reject(new Error('Failed to start mic.'));
    }
  });
}

// Fast string similarity
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  
  if (longer.length === 0) return 1;
  
  let matches = 0;
  const chars = longer.split('');
  
  for (const char of shorter) {
    const idx = chars.indexOf(char);
    if (idx !== -1) {
      matches++;
      chars.splice(idx, 1);
    }
  }
  
  return matches / longer.length;
}

// Fast pronunciation scoring
export function scorePronunciation(expected: string, spoken: string, confidence: number = 0.9): number {
  const norm = (s: string) => s.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
  
  const exp = norm(expected);
  const spk = norm(spoken);

  if (exp === spk) return 100;
  if (!spk) return 0;

  const sim = similarity(exp, spk);
  const score = (sim * 0.8 + confidence * 0.2) * 100;
  
  // Generous for close matches
  if (sim > 0.85) return Math.min(100, Math.round(score * 1.15));
  if (sim > 0.7) return Math.min(100, Math.round(score * 1.05));
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

// Rating levels
export type Rating = 'perfect' | 'good' | 'ok' | 'bad';

export function getRating(score: number): Rating {
  if (score >= 90) return 'perfect';
  if (score >= 65) return 'good';
  if (score >= 40) return 'ok';
  return 'bad';
}

export function getFeedback(score: number): string {
  if (score >= 90) return 'YOOOO';
  if (score >= 65) return 'GOOOOD';
  if (score >= 40) return 'OKKKK';
  return 'NOOOO';
}
