// Double Metaphone Algorithm for phonetic comparison
// This converts words to phonetic codes so similar-sounding words match

const VOWELS = 'AEIOU';

function isVowel(char: string): boolean {
  return VOWELS.includes(char.toUpperCase());
}

// Simplified Double Metaphone implementation
export function doubleMetaphone(word: string): [string, string] {
  if (!word) return ['', ''];
  
  let primary = '';
  let secondary = '';
  const original = word.toUpperCase().replace(/[^A-Z]/g, '');
  const length = original.length;
  let current = 0;
  
  // Skip these when at start of word
  if (['GN', 'KN', 'PN', 'WR', 'PS'].some(p => original.startsWith(p))) {
    current++;
  }
  
  // Initial X is pronounced Z
  if (original[0] === 'X') {
    primary += 'S';
    secondary += 'S';
    current++;
  }
  
  while (current < length) {
    const char = original[current];
    const next = original[current + 1] || '';
    const prev = original[current - 1] || '';
    
    switch (char) {
      case 'A':
      case 'E':
      case 'I':
      case 'O':
      case 'U':
        if (current === 0) {
          primary += 'A';
          secondary += 'A';
        }
        current++;
        break;
        
      case 'B':
        primary += 'P';
        secondary += 'P';
        current += (next === 'B') ? 2 : 1;
        break;
        
      case 'C':
        if (next === 'H') {
          primary += 'X';
          secondary += 'X';
          current += 2;
        } else if (next === 'I' || next === 'E' || next === 'Y') {
          primary += 'S';
          secondary += 'S';
          current += 1;
        } else if (next === 'K') {
          primary += 'K';
          secondary += 'K';
          current += 2;
        } else {
          primary += 'K';
          secondary += 'K';
          current++;
        }
        break;
        
      case 'D':
        if (next === 'G' && ['I', 'E', 'Y'].includes(original[current + 2] || '')) {
          primary += 'J';
          secondary += 'J';
          current += 3;
        } else {
          primary += 'T';
          secondary += 'T';
          current += (next === 'D') ? 2 : 1;
        }
        break;
        
      case 'F':
        primary += 'F';
        secondary += 'F';
        current += (next === 'F') ? 2 : 1;
        break;
        
      case 'G':
        if (next === 'H') {
          if (current > 0 && !isVowel(prev)) {
            current += 2;
          } else {
            primary += 'K';
            secondary += 'K';
            current += 2;
          }
        } else if (next === 'N') {
          current += 2;
        } else if (next === 'I' || next === 'E' || next === 'Y') {
          primary += 'J';
          secondary += 'K';
          current++;
        } else {
          primary += 'K';
          secondary += 'K';
          current += (next === 'G') ? 2 : 1;
        }
        break;
        
      case 'H':
        if (current === 0 || isVowel(prev)) {
          if (isVowel(next)) {
            primary += 'H';
            secondary += 'H';
          }
        }
        current++;
        break;
        
      case 'J':
        primary += 'J';
        secondary += 'J';
        current += (next === 'J') ? 2 : 1;
        break;
        
      case 'K':
        primary += 'K';
        secondary += 'K';
        current += (next === 'K') ? 2 : 1;
        break;
        
      case 'L':
        primary += 'L';
        secondary += 'L';
        current += (next === 'L') ? 2 : 1;
        break;
        
      case 'M':
        primary += 'M';
        secondary += 'M';
        current += (next === 'M') ? 2 : 1;
        break;
        
      case 'N':
        primary += 'N';
        secondary += 'N';
        current += (next === 'N') ? 2 : 1;
        break;
        
      case 'P':
        if (next === 'H') {
          primary += 'F';
          secondary += 'F';
          current += 2;
        } else {
          primary += 'P';
          secondary += 'P';
          current += (next === 'P') ? 2 : 1;
        }
        break;
        
      case 'Q':
        primary += 'K';
        secondary += 'K';
        current += (next === 'Q') ? 2 : 1;
        break;
        
      case 'R':
        primary += 'R';
        secondary += 'R';
        current += (next === 'R') ? 2 : 1;
        break;
        
      case 'S':
        if (next === 'H') {
          primary += 'X';
          secondary += 'X';
          current += 2;
        } else if (next === 'I' && ['O', 'A'].includes(original[current + 2] || '')) {
          primary += 'X';
          secondary += 'S';
          current += 3;
        } else {
          primary += 'S';
          secondary += 'S';
          current += (next === 'S') ? 2 : 1;
        }
        break;
        
      case 'T':
        if (next === 'H') {
          primary += '0'; // θ sound
          secondary += 'T';
          current += 2;
        } else if (next === 'I' && ['O', 'A'].includes(original[current + 2] || '')) {
          primary += 'X';
          secondary += 'X';
          current += 3;
        } else {
          primary += 'T';
          secondary += 'T';
          current += (next === 'T') ? 2 : 1;
        }
        break;
        
      case 'V':
        primary += 'F';
        secondary += 'F';
        current += (next === 'V') ? 2 : 1;
        break;
        
      case 'W':
        if (isVowel(next)) {
          primary += 'W';
          secondary += 'W';
        }
        current++;
        break;
        
      case 'X':
        primary += 'KS';
        secondary += 'KS';
        current += (next === 'X') ? 2 : 1;
        break;
        
      case 'Y':
        if (isVowel(next)) {
          primary += 'Y';
          secondary += 'Y';
        }
        current++;
        break;
        
      case 'Z':
        primary += 'S';
        secondary += 'S';
        current += (next === 'Z') ? 2 : 1;
        break;
        
      default:
        current++;
    }
  }
  
  return [primary, secondary];
}

// Compare two phonetic codes
export function phoneticSimilarity(code1: string, code2: string): number {
  if (code1 === code2) return 1;
  if (!code1 || !code2) return 0;
  
  const maxLen = Math.max(code1.length, code2.length);
  let matches = 0;
  
  for (let i = 0; i < Math.min(code1.length, code2.length); i++) {
    if (code1[i] === code2[i]) matches++;
  }
  
  return matches / maxLen;
}

// Compare two words phonetically
export function compareWordsPhonetically(word1: string, word2: string): number {
  const [primary1, secondary1] = doubleMetaphone(word1);
  const [primary2, secondary2] = doubleMetaphone(word2);
  
  // Check all combinations and take the best match
  const scores = [
    phoneticSimilarity(primary1, primary2),
    phoneticSimilarity(primary1, secondary2),
    phoneticSimilarity(secondary1, primary2),
    phoneticSimilarity(secondary1, secondary2),
  ];
  
  return Math.max(...scores);
}

// Find best phonetic match for a word in a list
export function findBestPhoneticMatch(word: string, candidates: string[]): { word: string; score: number } {
  let best = { word: '', score: 0 };
  
  for (const candidate of candidates) {
    const score = compareWordsPhonetically(word, candidate);
    if (score > best.score) {
      best = { word: candidate, score };
    }
  }
  
  return best;
}

