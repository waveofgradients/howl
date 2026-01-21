// Adaptive difficulty system based on historical performance
// Tracks daily scores and adjusts difficulty dynamically

import { PronunciationItem, ALL_CONTENT } from '@/data/words';
import { generateDynamicContent } from './content-generator';

// Historical record of daily performance
export interface DailyScore {
  date: string;
  level: number;
  completed: number;
  total: number;
  perfectCount: number;
  averageScore: number; // 0-100
}

export interface PerformanceHistory {
  dailyScores: DailyScore[];
  skillProfile: SkillProfile;
  adaptiveLevel: number; // Floating point difficulty level (1.0 - 7.0)
}

// Track proficiency in specific sound challenges
export interface SkillProfile {
  thSounds: number;      // 0-100 proficiency
  rVsL: number;
  vVsW: number;
  finalConsonants: number;
  vowelLength: number;
  multiSyllable: number;
  sentences: number;
}

const HISTORY_KEY = 'howl_performance_history';
const MAX_HISTORY_DAYS = 30;

// Default skill profile - start at 50% proficiency
const defaultSkillProfile: SkillProfile = {
  thSounds: 50,
  rVsL: 50,
  vVsW: 50,
  finalConsonants: 50,
  vowelLength: 50,
  multiSyllable: 50,
  sentences: 50,
};

const defaultHistory: PerformanceHistory = {
  dailyScores: [],
  skillProfile: { ...defaultSkillProfile },
  adaptiveLevel: 1.0,
};

export function getPerformanceHistory(): PerformanceHistory {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return { ...defaultHistory, skillProfile: { ...defaultSkillProfile } };
    return JSON.parse(stored) as PerformanceHistory;
  } catch {
    return { ...defaultHistory, skillProfile: { ...defaultSkillProfile } };
  }
}

export function savePerformanceHistory(history: PerformanceHistory): void {
  try {
    // Keep only last MAX_HISTORY_DAYS
    history.dailyScores = history.dailyScores.slice(-MAX_HISTORY_DAYS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage error - ignore
  }
}

// Record a day's performance
export function recordDailyPerformance(
  completed: number,
  total: number,
  perfectCount: number,
  averageScore: number,
  level: number
): void {
  const history = getPerformanceHistory();
  const today = new Date().toDateString();
  
  // Update or add today's score
  const existingIndex = history.dailyScores.findIndex(s => s.date === today);
  const dailyScore: DailyScore = {
    date: today,
    level,
    completed,
    total,
    perfectCount,
    averageScore,
  };
  
  if (existingIndex >= 0) {
    history.dailyScores[existingIndex] = dailyScore;
  } else {
    history.dailyScores.push(dailyScore);
  }
  
  // Update adaptive level based on performance
  history.adaptiveLevel = calculateAdaptiveLevel(history);
  
  savePerformanceHistory(history);
}

// Calculate adaptive difficulty level (1.0 - 7.0)
export function calculateAdaptiveLevel(history: PerformanceHistory): number {
  const scores = history.dailyScores;
  
  if (scores.length === 0) return 1.0;
  
  // Weight recent days more heavily
  // Last 7 days get 70% weight, days 8-30 get 30% weight
  let weightedSum = 0;
  let weightSum = 0;
  
  const recentDays = scores.slice(-7);
  const olderDays = scores.slice(-30, -7);
  
  // Recent days - higher weight
  recentDays.forEach((score, i) => {
    const dayWeight = 1 + (i / recentDays.length); // More recent = higher weight
    const performanceScore = calculatePerformanceScore(score);
    weightedSum += performanceScore * dayWeight;
    weightSum += dayWeight;
  });
  
  // Older days - lower weight
  olderDays.forEach((score) => {
    const dayWeight = 0.3;
    const performanceScore = calculatePerformanceScore(score);
    weightedSum += performanceScore * dayWeight;
    weightSum += dayWeight;
  });
  
  const weightedAverage = weightSum > 0 ? weightedSum / weightSum : 50;
  
  // Map performance (0-100) to level (1-7)
  // 0-30 → Level 1
  // 30-45 → Level 2
  // 45-55 → Level 3
  // 55-65 → Level 4
  // 65-75 → Level 5
  // 75-85 → Level 6
  // 85-100 → Level 7
  
  let level: number;
  if (weightedAverage < 30) level = 1.0;
  else if (weightedAverage < 45) level = 1.0 + ((weightedAverage - 30) / 15);
  else if (weightedAverage < 55) level = 2.0 + ((weightedAverage - 45) / 10);
  else if (weightedAverage < 65) level = 3.0 + ((weightedAverage - 55) / 10);
  else if (weightedAverage < 75) level = 4.0 + ((weightedAverage - 65) / 10);
  else if (weightedAverage < 85) level = 5.0 + ((weightedAverage - 75) / 10);
  else level = 6.0 + ((weightedAverage - 85) / 15);
  
  // Clamp and round to 1 decimal
  return Math.round(Math.min(7.0, Math.max(1.0, level)) * 10) / 10;
}

// Calculate overall performance score for a day (0-100)
function calculatePerformanceScore(score: DailyScore): number {
  const completionRate = score.completed / score.total;
  const perfectRate = score.perfectCount / score.total;
  
  // Weight: 50% average score, 30% completion rate, 20% perfect rate
  return (
    score.averageScore * 0.5 +
    completionRate * 100 * 0.3 +
    perfectRate * 100 * 0.2
  );
}

// Get current adaptive level
export function getAdaptiveLevel(): number {
  return getPerformanceHistory().adaptiveLevel;
}

// Update skill profile based on specific item performance
export function updateSkillProfile(
  item: PronunciationItem,
  score: number
): void {
  const history = getPerformanceHistory();
  const profile = history.skillProfile;
  const text = item.text.toLowerCase();
  
  // Learning rate - how much each attempt affects the profile
  const learningRate = 0.15;
  
  // Detect which skills this item tests
  const skillsUsed: (keyof SkillProfile)[] = [];
  
  // TH sounds
  if (/th/.test(text)) {
    skillsUsed.push('thSounds');
  }
  
  // R vs L
  if (/[rl]/.test(text)) {
    skillsUsed.push('rVsL');
  }
  
  // V vs W
  if (/[vw]/.test(text)) {
    skillsUsed.push('vVsW');
  }
  
  // Final consonants (words ending in consonants)
  if (/[bcdfghjklmnpqrstvwxyz](\s|$)/i.test(text)) {
    skillsUsed.push('finalConsonants');
  }
  
  // Vowel length (words with ee, ea, oo, etc.)
  if (/ee|ea|oo|ou|ie|ai|ay/.test(text)) {
    skillsUsed.push('vowelLength');
  }
  
  // Multi-syllable words
  if (item.difficulty >= 2) {
    skillsUsed.push('multiSyllable');
  }
  
  // Sentences
  if (item.difficulty >= 5) {
    skillsUsed.push('sentences');
  }
  
  // Update each relevant skill
  skillsUsed.forEach(skill => {
    const currentLevel = profile[skill];
    // Move toward score with learning rate
    profile[skill] = currentLevel + (score - currentLevel) * learningRate;
    // Clamp to 0-100
    profile[skill] = Math.max(0, Math.min(100, profile[skill]));
  });
  
  history.skillProfile = profile;
  savePerformanceHistory(history);
}

// Generate adaptive content based on skill profile and adaptive level (sync fallback)
export function generateAdaptiveContent(count: number = 10): PronunciationItem[] {
  const history = getPerformanceHistory();
  const level = history.adaptiveLevel;
  const profile = history.skillProfile;
  
  const result: PronunciationItem[] = [];
  const usedTexts = new Set<string>();
  
  // Distribution:
  // 60% - Current level (confidence building)
  // 30% - Slightly harder (stretch)
  // 10% - Easier review (reinforce basics)
  
  const currentLevelCount = Math.floor(count * 0.6);
  const stretchCount = Math.floor(count * 0.3);
  const reviewCount = count - currentLevelCount - stretchCount;
  
  // Get weakest skills to prioritize
  const weakestSkills = getWeakestSkills(profile, 3);
  
  // Add current level items (prioritize weak skills)
  const primaryLevel = Math.round(level);
  addItemsFromLevel(result, primaryLevel, currentLevelCount, usedTexts, weakestSkills);
  
  // Add stretch items (one level up)
  const stretchLevel = Math.min(7, primaryLevel + 1);
  addItemsFromLevel(result, stretchLevel, stretchCount, usedTexts, weakestSkills);
  
  // Add review items (one level down)
  const reviewLevel = Math.max(1, primaryLevel - 1);
  addItemsFromLevel(result, reviewLevel, reviewCount, usedTexts, weakestSkills);
  
  // Shuffle the result
  return result.sort(() => Math.random() - 0.5);
}

// Generate adaptive content using AI (async, with static fallback)
export async function generateAdaptiveContentAsync(count: number = 10): Promise<PronunciationItem[]> {
  const history = getPerformanceHistory();
  const level = history.adaptiveLevel;
  const profile = history.skillProfile;
  
  // Get weakest skills to prioritize
  const weakestSkills = getWeakestSkills(profile, 3);
  const primaryLevel = Math.round(level);
  
  try {
    // Try to get AI-generated content
    const items = await generateDynamicContent(primaryLevel, weakestSkills, count);
    if (items && items.length >= count) {
      return items;
    }
  } catch {
    // AI generation failed, fall through to static
  }
  
  // Fall back to static content
  return generateAdaptiveContent(count);
}

// Export weak skills getter for external use
export function getWeakSkills(n: number = 3): (keyof SkillProfile)[] {
  const history = getPerformanceHistory();
  return getWeakestSkills(history.skillProfile, n);
}

// Get the N weakest skills
function getWeakestSkills(profile: SkillProfile, n: number): (keyof SkillProfile)[] {
  const skills = Object.entries(profile) as [keyof SkillProfile, number][];
  skills.sort((a, b) => a[1] - b[1]);
  return skills.slice(0, n).map(([skill]) => skill);
}

// Add items from a specific level, prioritizing weak skills
function addItemsFromLevel(
  result: PronunciationItem[],
  level: number,
  count: number,
  usedTexts: Set<string>,
  weakSkills: (keyof SkillProfile)[]
): void {
  const effectiveLevel = Math.min(7, Math.max(1, level)) as keyof typeof ALL_CONTENT;
  const levelItems = ALL_CONTENT[effectiveLevel] || ALL_CONTENT[1];
  
  // Score items by relevance to weak skills
  const scoredItems = levelItems.map(item => ({
    item,
    score: scoreItemForWeakSkills(item, weakSkills),
  }));
  
  // Sort by score (higher = more relevant to weak skills)
  scoredItems.sort((a, b) => b.score - a.score);
  
  // Add items, avoiding duplicates
  let added = 0;
  for (const { item } of scoredItems) {
    if (added >= count) break;
    if (!usedTexts.has(item.text)) {
      result.push(item);
      usedTexts.add(item.text);
      added++;
    }
  }
  
  // If not enough items, add random ones from adjacent levels
  if (added < count) {
    const adjacentLevels = [
      Math.min(7, level + 1),
      Math.max(1, level - 1),
    ] as (keyof typeof ALL_CONTENT)[];
    
    for (const adjLevel of adjacentLevels) {
      if (added >= count) break;
      const adjItems = ALL_CONTENT[adjLevel] || [];
      const shuffled = [...adjItems].sort(() => Math.random() - 0.5);
      
      for (const item of shuffled) {
        if (added >= count) break;
        if (!usedTexts.has(item.text)) {
          result.push(item);
          usedTexts.add(item.text);
          added++;
        }
      }
    }
  }
}

// Score how relevant an item is for practicing weak skills
function scoreItemForWeakSkills(
  item: PronunciationItem,
  weakSkills: (keyof SkillProfile)[]
): number {
  const text = item.text.toLowerCase();
  let score = Math.random() * 0.5; // Base randomness
  
  for (const skill of weakSkills) {
    const weight = 2 - weakSkills.indexOf(skill) * 0.5; // First weak skill weighted most
    
    switch (skill) {
      case 'thSounds':
        if (/th/.test(text)) score += weight;
        break;
      case 'rVsL':
        if (/[rl]/.test(text)) score += weight;
        break;
      case 'vVsW':
        if (/[vw]/.test(text)) score += weight;
        break;
      case 'finalConsonants':
        if (/[bcdfghjklmnpqrstvwxyz](\s|$)/i.test(text)) score += weight;
        break;
      case 'vowelLength':
        if (/ee|ea|oo|ou|ie|ai|ay/.test(text)) score += weight;
        break;
      case 'multiSyllable':
        if (item.difficulty >= 2) score += weight;
        break;
      case 'sentences':
        if (item.difficulty >= 5) score += weight;
        break;
    }
  }
  
  return score;
}

// Get a summary of current skill levels
export function getSkillSummary(): {
  overallLevel: number;
  levelLabel: string;
  weakestAreas: string[];
  strongestAreas: string[];
} {
  const history = getPerformanceHistory();
  const profile = history.skillProfile;
  
  const skillLabels: Record<keyof SkillProfile, string> = {
    thSounds: 'TH sounds',
    rVsL: 'R vs L',
    vVsW: 'V vs W',
    finalConsonants: 'Final consonants',
    vowelLength: 'Vowel length',
    multiSyllable: 'Multi-syllable words',
    sentences: 'Full sentences',
  };
  
  const skills = Object.entries(profile) as [keyof SkillProfile, number][];
  skills.sort((a, b) => a[1] - b[1]);
  
  const weakest = skills.slice(0, 2).map(([k]) => skillLabels[k]);
  const strongest = skills.slice(-2).map(([k]) => skillLabels[k]);
  
  const levelLabels = ['Beginner', 'Basic', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Expert', 'Master'];
  
  return {
    overallLevel: history.adaptiveLevel,
    levelLabel: levelLabels[Math.floor(history.adaptiveLevel) - 1] || 'Beginner',
    weakestAreas: weakest,
    strongestAreas: strongest.reverse(),
  };
}

// Reset performance history (for testing)
export function resetPerformanceHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

