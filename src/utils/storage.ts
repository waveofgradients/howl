// Local storage for progress tracking

export interface DailyChallenge {
  date: string;
  items: string[]; // The items for today
  completed: number; // How many completed successfully (good or perfect)
  currentIndex: number; // Current item index
  attempts: number; // Attempts on current item
}

export interface UserProgress {
  currentLevel: number;
  currentDay: number;
  streak: number;
  totalPerfect: number;
  totalCompleted: number;
  lastPlayedDate: string;
  dailyChallenge: DailyChallenge | null;
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
};

export function getProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaultProgress };
    return JSON.parse(stored) as UserProgress;
  } catch {
    return { ...defaultProgress };
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

// Get today's date as string
function getTodayString(): string {
  return new Date().toDateString();
}

// Initialize or get daily challenge
export function getDailyChallenge(allItems: string[], _level: number): DailyChallenge {
  const progress = getProgress();
  const today = getTodayString();
  
  // If we have a valid challenge for today, return it
  if (progress.dailyChallenge && progress.dailyChallenge.date === today) {
    return progress.dailyChallenge;
  }
  
  // Create new daily challenge
  // Shuffle and pick items based on level
  const shuffled = [...allItems].sort(() => Math.random() - 0.5);
  const items = shuffled.slice(0, DAILY_CHALLENGE_SIZE);
  
  const newChallenge: DailyChallenge = {
    date: today,
    items,
    completed: 0,
    currentIndex: 0,
    attempts: 0,
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
  
  progress.dailyChallenge = newChallenge;
  progress.lastPlayedDate = today;
  progress.currentDay++;
  saveProgress(progress);
  
  return newChallenge;
}

// Record attempt result
export function recordAttempt(
  isGoodOrPerfect: boolean, 
  isPerfect: boolean
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
  
  let shouldAdvance = false;
  
  if (isPerfect) {
    // Perfect - advance immediately
    shouldAdvance = true;
    challenge.completed++;
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
  
  // Level up every 3 days if doing well
  if (challengeComplete && challenge.completed >= 7 && progress.currentLevel < 7) {
    if (progress.currentDay % 3 === 0) {
      progress.currentLevel++;
    }
  }
  
  progress.dailyChallenge = challenge;
  saveProgress(progress);
  
  return { shouldAdvance, challengeComplete, progress };
}

// Get current item from daily challenge
export function getCurrentChallengeItem(): string | null {
  const progress = getProgress();
  const challenge = progress.dailyChallenge;
  
  if (!challenge || challenge.currentIndex >= challenge.items.length) {
    return null;
  }
  
  return challenge.items[challenge.currentIndex];
}

// Get daily progress (0-1)
export function getDailyProgress(): number {
  const progress = getProgress();
  const challenge = progress.dailyChallenge;
  
  if (!challenge) return 0;
  
  return challenge.completed / challenge.items.length;
}

// Reset progress (for testing)
export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

