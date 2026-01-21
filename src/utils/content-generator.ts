// Dynamic content generation using OpenAI with fallback to static content

import { PronunciationItem, ALL_CONTENT } from '@/data/words';
import type { SkillProfile } from './adaptive-difficulty';

const API_ENDPOINT = '/.netlify/functions/generate-challenges';

// Cache for generated content to avoid repeated API calls
const contentCache = new Map<string, { items: PronunciationItem[]; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Get cache key based on parameters
function getCacheKey(level: number, weakSkills: (keyof SkillProfile)[]): string {
  return `${level}-${weakSkills.sort().join(',')}`;
}

// Generate content using OpenAI API
export async function generateDynamicContent(
  level: number,
  weakSkills: (keyof SkillProfile)[],
  count: number = 10
): Promise<PronunciationItem[]> {
  const cacheKey = getCacheKey(level, weakSkills);
  
  // Check cache first
  const cached = contentCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    // Shuffle cached items for variety
    return [...cached.items].sort(() => Math.random() - 0.5).slice(0, count);
  }
  
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level,
        weakSkills,
        count: Math.max(count, 15), // Request more than needed for variety
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.challenges || !Array.isArray(data.challenges)) {
      throw new Error('Invalid response format');
    }
    
    const items: PronunciationItem[] = data.challenges.map((c: { text: string; difficulty: number; phonetic?: string }) => ({
      text: c.text,
      difficulty: c.difficulty || level,
      phonetic: c.phonetic || '',
    }));
    
    // Cache the result
    contentCache.set(cacheKey, { items, timestamp: Date.now() });
    
    return items.slice(0, count);
    
  } catch (error) {
    // Fall back to static content on any error
    return getStaticContent(level, weakSkills, count);
  }
}

// Fallback: get content from static word lists
function getStaticContent(
  level: number,
  weakSkills: (keyof SkillProfile)[],
  count: number
): PronunciationItem[] {
  const effectiveLevel = Math.min(3, Math.max(1, Math.round(level))) as keyof typeof ALL_CONTENT;
  const items = ALL_CONTENT[effectiveLevel] || ALL_CONTENT[1];
  
  // Score items by relevance to weak skills
  const scoredItems = items.map(item => ({
    item,
    score: scoreItemForSkills(item, weakSkills) + Math.random() * 0.5,
  }));
  
  // Sort by score and take top items
  scoredItems.sort((a, b) => b.score - a.score);
  
  return scoredItems.slice(0, count).map(s => s.item);
}

// Score how relevant an item is for practicing weak skills
function scoreItemForSkills(
  item: PronunciationItem,
  weakSkills: (keyof SkillProfile)[]
): number {
  const text = item.text.toLowerCase();
  let score = 0;
  
  for (const skill of weakSkills) {
    const weight = 2 - weakSkills.indexOf(skill) * 0.3;
    
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

// Prefetch content for tomorrow (call this after completing daily challenge)
export async function prefetchContent(level: number, weakSkills: (keyof SkillProfile)[]): Promise<void> {
  try {
    await generateDynamicContent(level, weakSkills, 15);
  } catch {
    // Prefetch failure is not critical
  }
}

// Clear content cache (for testing)
export function clearContentCache(): void {
  contentCache.clear();
}

