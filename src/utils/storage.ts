// Local storage for progress tracking

import { PronunciationItem } from '@/data/words';
import { 
  recordDailyPerformance, 
  updateSkillProfile, 
  generateAdaptiveContent,
  generateAdaptiveContentAsync,
  getAdaptiveLevel,
  resetPerformanceHistory
} from './adaptive-difficulty';

export interface DailyChallenge {
  date: string;
  items: PronunciationItem[]; // Full items with metadata
  completed: number; // How many completed successfully (good or perfect)
  currentIndex: number; // Current item index
  attempts: number; // Attempts on current item
  scores: number[]; // Score for each attempt (for calculating average)
  perfectCount: number; // Number of perfect scores
  dailyScore: number; // 0-100, can go up AND down
  comboStreak: number; // Consecutive perfects
  isRecoveryMode: boolean; // True when retrying after NOOOO
  pendingLoss: number; // Points to lose if recovery fails
}

export interface UserProgress {
  currentLevel: number;
  currentDay: number;
  streak: number;
  totalPerfect: number;
  totalCompleted: number;
  lastPlayedDate: string;
  dailyChallenge: DailyChallenge | null;
  allTimeScore: number; // Running all-time average
  allTimeAttempts: number; // Total attempts ever
}

const STORAGE_KEY = 'howl_progress';
const DAILY_CHALLENGE_SIZE = 10;

const defaultProgress: UserProgress = {
  currentLevel: 1,
  currentDay: 1,
  streak: 0,
  totalPerfect: 0,
  totalCompleted: 0,
  lastPlayedDate: '',
  dailyChallenge: null,
  allTimeScore: 0,
  allTimeAttempts: 0,
};

export function getProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaultProgress };
    const progress = JSON.parse(stored) as UserProgress;
    // Ensure new fields exist
    if (progress.allTimeScore === undefined) progress.allTimeScore = 0;
    if (progress.allTimeAttempts === undefined) progress.allTimeAttempts = 0;
    return progress;
  } catch {
    return { ...defaultProgress };
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage error - ignore
  }
}

// Get today's date as string
function getTodayString(): string {
  return new Date().toDateString();
}

// Initialize or get daily challenge using adaptive content (sync - uses static fallback)
export function getDailyChallenge(): DailyChallenge {
  const progress = getProgress();
  const today = getTodayString();
  
  // If we have a valid challenge for today, return it
  if (progress.dailyChallenge && progress.dailyChallenge.date === today) {
    return progress.dailyChallenge;
  }
  
  // Record yesterday's performance if there was a challenge
  if (progress.dailyChallenge) {
    const lastChallenge = progress.dailyChallenge;
    const avgScore = lastChallenge.scores.length > 0
      ? lastChallenge.scores.reduce((a, b) => a + b, 0) / lastChallenge.scores.length
      : 0;
    
    recordDailyPerformance(
      lastChallenge.completed,
      lastChallenge.items.length,
      lastChallenge.perfectCount,
      avgScore,
      progress.currentLevel
    );
  }
  
  // Generate adaptive content based on performance history (sync/static)
  const items = generateAdaptiveContent(DAILY_CHALLENGE_SIZE);
  
  const newChallenge: DailyChallenge = {
    date: today,
    items,
    completed: 0,
    currentIndex: 0,
    attempts: 0,
    scores: [],
    perfectCount: 0,
    dailyScore: 0,
    comboStreak: 0,
    isRecoveryMode: false,
    pendingLoss: 0,
  };
  
  // Update streak
  if (progress.lastPlayedDate) {
    const lastDate = new Date(progress.lastPlayedDate);
    const todayDate = new Date(today);
    const dayDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff > 1) {
      progress.streak = 0; // Streak broken
    }
  }
  
  // Update level from adaptive system
  progress.currentLevel = Math.round(getAdaptiveLevel());
  
  progress.dailyChallenge = newChallenge;
  progress.lastPlayedDate = today;
  progress.currentDay++;
  saveProgress(progress);
  
  return newChallenge;
}

// Initialize daily challenge with AI-generated content (async)
export async function getDailyChallengeAsync(): Promise<DailyChallenge> {
  const progress = getProgress();
  const today = getTodayString();
  
  // If we have a valid challenge for today, return it
  if (progress.dailyChallenge && progress.dailyChallenge.date === today) {
    return progress.dailyChallenge;
  }
  
  // Record yesterday's performance if there was a challenge
  if (progress.dailyChallenge) {
    const lastChallenge = progress.dailyChallenge;
    const avgScore = lastChallenge.scores.length > 0
      ? lastChallenge.scores.reduce((a, b) => a + b, 0) / lastChallenge.scores.length
      : 0;
    
    recordDailyPerformance(
      lastChallenge.completed,
      lastChallenge.items.length,
      lastChallenge.perfectCount,
      avgScore,
      progress.currentLevel
    );
  }
  
  // Generate adaptive content using AI (async, with static fallback)
  const items = await generateAdaptiveContentAsync(DAILY_CHALLENGE_SIZE);
  
  const newChallenge: DailyChallenge = {
    date: today,
    items,
    completed: 0,
    currentIndex: 0,
    attempts: 0,
    scores: [],
    perfectCount: 0,
    dailyScore: 0,
    comboStreak: 0,
    isRecoveryMode: false,
    pendingLoss: 0,
  };
  
  // Update streak
  if (progress.lastPlayedDate) {
    const lastDate = new Date(progress.lastPlayedDate);
    const todayDate = new Date(today);
    const dayDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff > 1) {
      progress.streak = 0; // Streak broken
    }
  }
  
  // Update level from adaptive system
  progress.currentLevel = Math.round(getAdaptiveLevel());
  
  progress.dailyChallenge = newChallenge;
  progress.lastPlayedDate = today;
  progress.currentDay++;
  saveProgress(progress);
  
  return newChallenge;
}

// Rating type for game logic
export type GameRating = 'perfect' | 'good' | 'ok' | 'bad';

// Record attempt with game-like scoring
// Perfect: +15% (with combo multiplier), Good: +8%, OK: -5%, Bad: -10% (must retry)
export function recordAttempt(
  isGoodOrPerfect: boolean, 
  isPerfect: boolean,
  score: number = 0
): { 
  shouldAdvance: boolean; 
  challengeComplete: boolean;
  progress: UserProgress;
  scoreChange: number; // How much the score changed (for UI feedback)
  isRecovery: boolean; // True if this was a recovery attempt
} {
  const progress = getProgress();
  const challenge = progress.dailyChallenge;
  
  if (!challenge) {
    return { shouldAdvance: false, challengeComplete: false, progress, scoreChange: 0, isRecovery: false };
  }
  
  // Ensure new fields exist (migration)
  if (challenge.dailyScore === undefined) challenge.dailyScore = 0;
  if (challenge.comboStreak === undefined) challenge.comboStreak = 0;
  if (challenge.isRecoveryMode === undefined) challenge.isRecoveryMode = false;
  if (challenge.pendingLoss === undefined) challenge.pendingLoss = 0;
  
  challenge.attempts++;
  challenge.scores.push(score);
  
  // Update all-time running average
  progress.allTimeAttempts++;
  progress.allTimeScore = (
    (progress.allTimeScore * (progress.allTimeAttempts - 1) + score) / 
    progress.allTimeAttempts
  );
  
  // Update skill profile for the current item
  const currentItem = challenge.items[challenge.currentIndex];
  if (currentItem) {
    updateSkillProfile(currentItem, score);
  }
  
  let shouldAdvance = false;
  let scoreChange = 0;
  const wasRecoveryMode = challenge.isRecoveryMode;
  
  // Determine rating: perfect (90+), good (65-89), ok (40-64), bad (<40)
  const rating: GameRating = isPerfect ? 'perfect' 
    : isGoodOrPerfect ? 'good' 
    : score >= 40 ? 'ok' 
    : 'bad';
  
  if (wasRecoveryMode) {
    // RECOVERY MODE: Trying to recover from a NOOOO
    if (rating === 'perfect' || rating === 'good') {
      // Recovered! Don't lose points, but don't gain either
      scoreChange = 0; // Just prevented the loss
      challenge.pendingLoss = 0;
      challenge.isRecoveryMode = false;
      shouldAdvance = true;
      challenge.comboStreak = 0; // Reset combo
      challenge.completed++;
      progress.totalCompleted++;
      if (rating === 'perfect') {
        challenge.perfectCount++;
        progress.totalPerfect++;
      }
    } else if (rating === 'ok') {
      // OK in recovery - still lose half the pending points
      scoreChange = -Math.round(challenge.pendingLoss / 2);
      challenge.dailyScore = Math.max(0, challenge.dailyScore + scoreChange);
      challenge.pendingLoss = 0;
      challenge.isRecoveryMode = false;
      shouldAdvance = true;
      challenge.comboStreak = 0;
    } else {
      // Still bad - keep trying (up to 3 attempts total)
      if (challenge.attempts >= 3) {
        // Give up - take full loss and move on
        scoreChange = -challenge.pendingLoss;
        challenge.dailyScore = Math.max(0, challenge.dailyScore + scoreChange);
        challenge.pendingLoss = 0;
        challenge.isRecoveryMode = false;
        shouldAdvance = true;
        challenge.comboStreak = 0;
      }
    }
  } else {
    // NORMAL MODE
    if (rating === 'perfect') {
      // PERFECT: +15% base, with combo multiplier
      challenge.comboStreak++;
      const comboMultiplier = Math.min(challenge.comboStreak, 3); // Max 3x
      const baseGain = 15;
      scoreChange = Math.round(baseGain * comboMultiplier);
      challenge.dailyScore = Math.min(100, challenge.dailyScore + scoreChange);
      shouldAdvance = true;
      challenge.completed++;
      challenge.perfectCount++;
      progress.totalPerfect++;
      progress.totalCompleted++;
      progress.streak++;
    } else if (rating === 'good') {
      // GOOD: +8%, reset combo
      scoreChange = 8;
      challenge.dailyScore = Math.min(100, challenge.dailyScore + scoreChange);
      shouldAdvance = true;
      challenge.comboStreak = 0;
      challenge.completed++;
      progress.totalCompleted++;
    } else if (rating === 'ok') {
      // OK: -5%, but still advance
      scoreChange = -5;
      challenge.dailyScore = Math.max(0, challenge.dailyScore + scoreChange);
      shouldAdvance = true;
      challenge.comboStreak = 0;
    } else {
      // BAD (NOOOO): Enter recovery mode, pending -10%
      challenge.pendingLoss = 10;
      challenge.isRecoveryMode = true;
      challenge.comboStreak = 0;
      // Don't advance yet - must retry
    }
  }
  
  if (shouldAdvance) {
    challenge.currentIndex++;
    challenge.attempts = 0;
  }
  
  const challengeComplete = challenge.currentIndex >= challenge.items.length;
  
  // If challenge complete, record to performance history
  if (challengeComplete) {
    const avgScore = challenge.scores.length > 0
      ? challenge.scores.reduce((a, b) => a + b, 0) / challenge.scores.length
      : 0;
    
    recordDailyPerformance(
      challenge.completed,
      challenge.items.length,
      challenge.perfectCount,
      avgScore,
      progress.currentLevel
    );
    
    // Update level from adaptive system
    progress.currentLevel = Math.round(getAdaptiveLevel());
  }
  
  progress.dailyChallenge = challenge;
  saveProgress(progress);
  
  return { shouldAdvance, challengeComplete, progress, scoreChange, isRecovery: wasRecoveryMode };
}

// Get current item from daily challenge
export function getCurrentChallengeItem(): PronunciationItem | null {
  const progress = getProgress();
  const challenge = progress.dailyChallenge;
  
  if (!challenge || challenge.currentIndex >= challenge.items.length) {
    return null;
  }
  
  return challenge.items[challenge.currentIndex];
}

// Get current item text (for backwards compatibility)
export function getCurrentChallengeText(): string | null {
  const item = getCurrentChallengeItem();
  return item ? item.text : null;
}

// Get daily progress (0-1) - now uses dynamic dailyScore
export function getDailyProgress(): number {
  const progress = getProgress();
  const challenge = progress.dailyChallenge;
  
  if (!challenge) return 0;
  
  // Use the new dailyScore (0-100) converted to 0-1
  return (challenge.dailyScore ?? 0) / 100;
}

// Get combo streak
export function getComboStreak(): number {
  const progress = getProgress();
  return progress.dailyChallenge?.comboStreak ?? 0;
}

// Check if in recovery mode
export function isInRecoveryMode(): boolean {
  const progress = getProgress();
  return progress.dailyChallenge?.isRecoveryMode ?? false;
}

// Get all-time progress as percentage (0-100)
export function getAllTimeProgress(): number {
  const progress = getProgress();
  return Math.round(progress.allTimeScore);
}

// Reset progress (for testing)
export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
  resetPerformanceHistory();
}
