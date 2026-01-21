// Pronunciation challenges - simple words only
// Focused on sounds that are challenging for Vietnamese and Mandarin speakers

export interface PronunciationItem {
  text: string;
  phonetic: string;
  difficulty: number; // 1-3
}

// Level 1: Basic single words
export const WORDS_LEVEL_1: PronunciationItem[] = [
  // TH sounds (very challenging for Vietnamese/Mandarin speakers)
  { text: "think", phonetic: "/θɪŋk/", difficulty: 1 },
  { text: "three", phonetic: "/θriː/", difficulty: 1 },
  { text: "this", phonetic: "/ðɪs/", difficulty: 1 },
  { text: "that", phonetic: "/ðæt/", difficulty: 1 },
  { text: "the", phonetic: "/ðə/", difficulty: 1 },
  { text: "thing", phonetic: "/θɪŋ/", difficulty: 1 },
  { text: "them", phonetic: "/ðem/", difficulty: 1 },
  { text: "with", phonetic: "/wɪð/", difficulty: 1 },
  { text: "both", phonetic: "/boʊθ/", difficulty: 1 },
  { text: "math", phonetic: "/mæθ/", difficulty: 1 },
  
  // R vs L sounds
  { text: "right", phonetic: "/raɪt/", difficulty: 1 },
  { text: "light", phonetic: "/laɪt/", difficulty: 1 },
  { text: "read", phonetic: "/riːd/", difficulty: 1 },
  { text: "lead", phonetic: "/liːd/", difficulty: 1 },
  { text: "rock", phonetic: "/rɑːk/", difficulty: 1 },
  { text: "lock", phonetic: "/lɑːk/", difficulty: 1 },
  { text: "rice", phonetic: "/raɪs/", difficulty: 1 },
  { text: "lice", phonetic: "/laɪs/", difficulty: 1 },
  { text: "wrong", phonetic: "/rɔːŋ/", difficulty: 1 },
  { text: "long", phonetic: "/lɔːŋ/", difficulty: 1 },
  
  // V vs W sounds
  { text: "very", phonetic: "/ˈveri/", difficulty: 1 },
  { text: "west", phonetic: "/west/", difficulty: 1 },
  { text: "vine", phonetic: "/vaɪn/", difficulty: 1 },
  { text: "wine", phonetic: "/waɪn/", difficulty: 1 },
  { text: "vent", phonetic: "/vent/", difficulty: 1 },
  { text: "went", phonetic: "/went/", difficulty: 1 },
  { text: "vest", phonetic: "/vest/", difficulty: 1 },
  { text: "view", phonetic: "/vjuː/", difficulty: 1 },
  { text: "wave", phonetic: "/weɪv/", difficulty: 1 },
  { text: "have", phonetic: "/hæv/", difficulty: 1 },
  
  // Final consonants (often dropped)
  { text: "card", phonetic: "/kɑːrd/", difficulty: 1 },
  { text: "best", phonetic: "/best/", difficulty: 1 },
  { text: "help", phonetic: "/help/", difficulty: 1 },
  { text: "month", phonetic: "/mʌnθ/", difficulty: 1 },
  { text: "hand", phonetic: "/hænd/", difficulty: 1 },
  { text: "cold", phonetic: "/koʊld/", difficulty: 1 },
  { text: "fast", phonetic: "/fæst/", difficulty: 1 },
  { text: "world", phonetic: "/wɜːrld/", difficulty: 1 },
  
  // Short vs Long vowels
  { text: "ship", phonetic: "/ʃɪp/", difficulty: 1 },
  { text: "sheep", phonetic: "/ʃiːp/", difficulty: 1 },
  { text: "bit", phonetic: "/bɪt/", difficulty: 1 },
  { text: "beat", phonetic: "/biːt/", difficulty: 1 },
  { text: "sit", phonetic: "/sɪt/", difficulty: 1 },
  { text: "seat", phonetic: "/siːt/", difficulty: 1 },
  { text: "fill", phonetic: "/fɪl/", difficulty: 1 },
  { text: "feel", phonetic: "/fiːl/", difficulty: 1 },
];

// Level 2: Slightly harder words
export const WORDS_LEVEL_2: PronunciationItem[] = [
  { text: "through", phonetic: "/θruː/", difficulty: 2 },
  { text: "thought", phonetic: "/θɔːt/", difficulty: 2 },
  { text: "although", phonetic: "/ɔːlˈðoʊ/", difficulty: 2 },
  { text: "weather", phonetic: "/ˈweðər/", difficulty: 2 },
  { text: "whether", phonetic: "/ˈweðər/", difficulty: 2 },
  { text: "brother", phonetic: "/ˈbrʌðər/", difficulty: 2 },
  { text: "another", phonetic: "/əˈnʌðər/", difficulty: 2 },
  { text: "together", phonetic: "/təˈɡeðər/", difficulty: 2 },
  
  { text: "really", phonetic: "/ˈrɪəli/", difficulty: 2 },
  { text: "rarely", phonetic: "/ˈrerli/", difficulty: 2 },
  { text: "rural", phonetic: "/ˈrʊrəl/", difficulty: 2 },
  { text: "world", phonetic: "/wɜːrld/", difficulty: 2 },
  { text: "girl", phonetic: "/ɡɜːrl/", difficulty: 2 },
  { text: "early", phonetic: "/ˈɜːrli/", difficulty: 2 },
  
  { text: "value", phonetic: "/ˈvæljuː/", difficulty: 2 },
  { text: "every", phonetic: "/ˈevri/", difficulty: 2 },
  { text: "never", phonetic: "/ˈnevər/", difficulty: 2 },
  { text: "river", phonetic: "/ˈrɪvər/", difficulty: 2 },
  { text: "seven", phonetic: "/ˈsevən/", difficulty: 2 },
  { text: "eleven", phonetic: "/ɪˈlevən/", difficulty: 2 },
  
  { text: "comfortable", phonetic: "/ˈkʌmftəbəl/", difficulty: 2 },
  { text: "vegetable", phonetic: "/ˈvedʒtəbəl/", difficulty: 2 },
  { text: "temperature", phonetic: "/ˈtemprətʃər/", difficulty: 2 },
  { text: "interesting", phonetic: "/ˈɪntrəstɪŋ/", difficulty: 2 },
  { text: "chocolate", phonetic: "/ˈtʃɑːklət/", difficulty: 2 },
  { text: "restaurant", phonetic: "/ˈrestərɑːnt/", difficulty: 2 },
  { text: "library", phonetic: "/ˈlaɪbreri/", difficulty: 2 },
  { text: "February", phonetic: "/ˈfebruˌeri/", difficulty: 2 },
  { text: "literally", phonetic: "/ˈlɪtərəli/", difficulty: 2 },
  { text: "regularly", phonetic: "/ˈreɡjələrli/", difficulty: 2 },
];

// Level 3: Two-word phrases only
export const WORDS_LEVEL_3: PronunciationItem[] = [
  { text: "three things", phonetic: "/θriː θɪŋz/", difficulty: 3 },
  { text: "this thing", phonetic: "/ðɪs θɪŋ/", difficulty: 3 },
  { text: "that thought", phonetic: "/ðæt θɔːt/", difficulty: 3 },
  { text: "both brothers", phonetic: "/boʊθ ˈbrʌðərz/", difficulty: 3 },
  { text: "with them", phonetic: "/wɪð ðem/", difficulty: 3 },
  
  { text: "red light", phonetic: "/red laɪt/", difficulty: 3 },
  { text: "really wrong", phonetic: "/ˈrɪəli rɔːŋ/", difficulty: 3 },
  { text: "long road", phonetic: "/lɔːŋ roʊd/", difficulty: 3 },
  { text: "right left", phonetic: "/raɪt left/", difficulty: 3 },
  { text: "real life", phonetic: "/rɪəl laɪf/", difficulty: 3 },
  
  { text: "very well", phonetic: "/ˈveri wel/", difficulty: 3 },
  { text: "wave view", phonetic: "/weɪv vjuː/", difficulty: 3 },
  { text: "every week", phonetic: "/ˈevri wiːk/", difficulty: 3 },
  { text: "never ever", phonetic: "/ˈnevər ˈevər/", difficulty: 3 },
  
  { text: "cold world", phonetic: "/koʊld wɜːrld/", difficulty: 3 },
  { text: "best friend", phonetic: "/best frend/", difficulty: 3 },
  { text: "fast food", phonetic: "/fæst fuːd/", difficulty: 3 },
  { text: "last month", phonetic: "/læst mʌnθ/", difficulty: 3 },
  
  { text: "deep breath", phonetic: "/diːp breθ/", difficulty: 3 },
  { text: "big ship", phonetic: "/bɪɡ ʃɪp/", difficulty: 3 },
  { text: "cheap seat", phonetic: "/tʃiːp siːt/", difficulty: 3 },
  { text: "feel free", phonetic: "/fiːl friː/", difficulty: 3 },
];

// Combine all levels for easy access
export const ALL_CONTENT = {
  1: WORDS_LEVEL_1,
  2: WORDS_LEVEL_2,
  3: WORDS_LEVEL_3,
};

// Get items for a specific level (capped at 3)
export function getItemsForLevel(level: number): PronunciationItem[] {
  const effectiveLevel = Math.min(Math.max(level, 1), 3);
  return ALL_CONTENT[effectiveLevel as keyof typeof ALL_CONTENT] || WORDS_LEVEL_1;
}

// Get a random item from a level
export function getRandomItem(level: number): PronunciationItem {
  const items = getItemsForLevel(level);
  return items[Math.floor(Math.random() * items.length)];
}

// Get difficulty label
export function getDifficultyLabel(level: number): string {
  if (level <= 1) return "BASIC";
  if (level <= 2) return "WORDS";
  return "PAIRS";
}
