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

// Record attempt result with score
export function recordAttempt(
  isGoodOrPerfect: boolean, 
  isPerfect: boolean,
  score: number = 0
): { 
  shouldAdvance: boolean; 
  challengeComplete: boolean;
  progress: UserProgress;
} {
  const progress = getProgress();
  const challenge = progress.dailyChallenge;
  
  if (!challenge) {
    return { shouldAdvance: false, challengeComplete: false, progress };
  }
  
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
  
  if (isPerfect) {
    // Perfect - advance immediately
    shouldAdvance = true;
    challenge.completed++;
    challenge.perfectCount++;
    progress.totalPerfect++;
    progress.totalCompleted++;
    progress.streak++;
  } else if (isGoodOrPerfect) {
    // Good - advance
    shouldAdvance = true;
    challenge.completed++;
    progress.totalCompleted++;
  } else if (challenge.attempts >= 3) {
    // Failed 3 times - advance without credit
    shouldAdvance = true;
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
  
  return { shouldAdvance, challengeComplete, progress };
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

// Get daily progress (0-1)
export function getDailyProgress(): number {
  const progress = getProgress();
  const challenge = progress.dailyChallenge;
  
  if (!challenge) return 0;
  
  return challenge.completed / challenge.items.length;
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
