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

// Check availability - on iOS Safari, webkitSpeechRecognition exists
export function isSpeechRecognitionAvailable(): boolean {
  // Check for standard or webkit-prefixed API
  const hasAPI = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  
  // On iOS, Chrome and other browsers use WKWebView which doesn't support speech recognition
  // Only Safari has actual support
  if (isIOS() && !isSafari()) {
    return false;
  }
  
  return hasAPI;
}

// Check if on iOS
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad with iPadOS
}

// Check if Safari (not Chrome/Firefox on iOS)
export function isSafari(): boolean {
  const ua = navigator.userAgent;
  // Safari on iOS: has Safari in UA but NOT CriOS (Chrome) or FxiOS (Firefox)
  return /Safari/.test(ua) && !/CriOS/.test(ua) && !/FxiOS/.test(ua) && !/Chrome/.test(ua);
}

// Get helpful error message for speech recognition
export function getSpeechRecognitionError(): string {
  if (isIOS() && !isSafari()) {
    return 'On iPhone, open in Safari for voice recognition.';
  }
  if (isIOS()) {
    return 'Tap the mic button and allow microphone access.';
  }
  return 'Use Chrome on Android or Safari on iPhone.';
}

// Start listening
export function startListening(): Promise<RecognitionResult> {
  return new Promise((resolve, reject) => {
    if (!isSpeechRecognitionAvailable()) {
      reject(new Error('Speech recognition not supported. Use Chrome or Safari.'));
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

    // 10 second timeout
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        recognition.abort();
        reject(new Error('No speech detected. Tap mic and speak clearly.'));
      }
    }, 10000);

    recognition.onstart = () => {
      
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (resolved) return;
      resolved = true;
      cleanup();

      const result = event.results[0];
      if (result && result[0]) {
        const { transcript, confidence } = result[0];
        
        resolve({ transcript, confidence });
      } else {
        reject(new Error('Could not understand. Try again.'));
      }
    };

    recognition.onerror = (event: Event & { error: string }) => {
      if (resolved) return;
      resolved = true;
      cleanup();

      console.error('Speech error:', event.error);
      
      const messages: Record<string, string> = {
        'no-speech': 'No speech detected. Speak into the mic.',
        'audio-capture': 'No microphone found.',
        'not-allowed': 'Microphone blocked. Allow mic access in browser settings.',
        'network': 'Network error. Check your connection.',
        'aborted': 'Cancelled.',
      };
      
      reject(new Error(messages[event.error] || `Error: ${event.error}`));
    };

    recognition.onend = () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error('No speech detected. Tap and speak clearly.'));
      }
    };

    try {
      recognition.start();
    } catch (err) {
      resolved = true;
      cleanup();
      reject(new Error('Failed to start mic. Refresh the page.'));
    }
  });
}

import { compareWordsPhonetically } from './phonetics';

// Levenshtein distance for character-level comparison
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1] 
        ? dp[i-1][j-1] 
        : Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]) + 1;
    }
  }
  return dp[m][n];
}

// Sophisticated pronunciation scoring
// Uses: phonetic matching, character similarity, word coverage, and confidence
export function scorePronunciation(expected: string, spoken: string, confidence: number = 0.9): number {
  const norm = (s: string) => s.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
  
  const exp = norm(expected);
  const spk = norm(spoken);

  
  
  
  

  // Perfect match
  if (exp === spk) {
    
    return 100;
  }

  const expWords = exp.split(' ');
  const spkWords = spk.split(' ');

  // 1. PHONETIC WORD MATCHING (40%)
  // For each expected word, find best phonetic match in spoken words
  let phoneticScore = 0;
  const matchedSpoken = new Set<number>();
  
  for (const expWord of expWords) {
    let bestMatch = { index: -1, score: 0 };
    
    for (let i = 0; i < spkWords.length; i++) {
      if (matchedSpoken.has(i)) continue;
      
      // Exact match
      if (expWord === spkWords[i]) {
        bestMatch = { index: i, score: 1 };
        break;
      }
      
      // Phonetic match
      const phonScore = compareWordsPhonetically(expWord, spkWords[i]);
      if (phonScore > bestMatch.score) {
        bestMatch = { index: i, score: phonScore };
      }
    }
    
    if (bestMatch.index >= 0 && bestMatch.score > 0.5) {
      matchedSpoken.add(bestMatch.index);
      phoneticScore += bestMatch.score;
      
    } else {
      
    }
  }
  
  phoneticScore = phoneticScore / expWords.length;

  // 2. CHARACTER SIMILARITY (30%)
  // Catches overall string similarity
  const dist = levenshtein(exp, spk);
  const charScore = 1 - dist / Math.max(exp.length, spk.length, 1);

  // 3. WORD COVERAGE (20%)
  // Penalize missing or extra words
  const coverageScore = Math.min(
    matchedSpoken.size / expWords.length, // How many expected words were matched
    expWords.length / Math.max(spkWords.length, 1) // Penalize too many extra words
  );

  // 4. CONFIDENCE BOOST (10%)
  // Browser's confidence in what it heard
  const confidenceScore = confidence;

  // Weighted combination
  const rawScore = (
    phoneticScore * 0.40 +
    charScore * 0.30 +
    coverageScore * 0.20 +
    confidenceScore * 0.10
  ) * 100;

  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));
  
  
  
  
  
  
  

  return finalScore;
}

// Rating levels
export type Rating = 'perfect' | 'good' | 'ok' | 'bad';

// Get rating from score
export function getRating(score: number): Rating {
  if (score >= 95) return 'perfect';
  if (score >= 70) return 'good';
  if (score >= 40) return 'ok';
  return 'bad';
}

// Get display feedback text
export function getFeedback(score: number): string {
  if (score >= 95) return 'YOOOO';
  if (score >= 70) return 'GOOOOD';
  if (score >= 40) return 'OKKKK';
  return 'NOOOO';
}
