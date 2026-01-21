// Pronunciation challenges organized by difficulty
// Focused on sounds that are challenging for Vietnamese and Mandarin speakers

export interface PronunciationItem {
  text: string;
  phonetic: string;
  difficulty: number; // 1-10
  tips?: string;
}

// Level 1: Single words - Basic sounds
export const WORDS_LEVEL_1: PronunciationItem[] = [
  // TH sounds (very challenging for Vietnamese/Mandarin speakers)
  { text: "think", phonetic: "/θɪŋk/", difficulty: 1, tips: "Tongue between teeth for 'th'" },
  { text: "three", phonetic: "/θriː/", difficulty: 1 },
  { text: "this", phonetic: "/ðɪs/", difficulty: 1 },
  { text: "that", phonetic: "/ðæt/", difficulty: 1 },
  { text: "the", phonetic: "/ðə/", difficulty: 1 },
  
  // R vs L sounds
  { text: "right", phonetic: "/raɪt/", difficulty: 1, tips: "Curl tongue back for R" },
  { text: "light", phonetic: "/laɪt/", difficulty: 1 },
  { text: "read", phonetic: "/riːd/", difficulty: 1 },
  { text: "lead", phonetic: "/liːd/", difficulty: 1 },
  { text: "rock", phonetic: "/rɑːk/", difficulty: 1 },
  { text: "lock", phonetic: "/lɑːk/", difficulty: 1 },
  
  // V vs W sounds
  { text: "very", phonetic: "/ˈveri/", difficulty: 1, tips: "Bite lower lip for V" },
  { text: "west", phonetic: "/west/", difficulty: 1 },
  { text: "vine", phonetic: "/vaɪn/", difficulty: 1 },
  { text: "wine", phonetic: "/waɪn/", difficulty: 1 },
  
  // Final consonants (often dropped)
  { text: "card", phonetic: "/kɑːrd/", difficulty: 1, tips: "Don't drop final D" },
  { text: "best", phonetic: "/best/", difficulty: 1 },
  { text: "help", phonetic: "/help/", difficulty: 1 },
  { text: "month", phonetic: "/mʌnθ/", difficulty: 1 },
  
  // Short vs Long vowels
  { text: "ship", phonetic: "/ʃɪp/", difficulty: 1 },
  { text: "sheep", phonetic: "/ʃiːp/", difficulty: 1 },
  { text: "bit", phonetic: "/bɪt/", difficulty: 1 },
  { text: "beat", phonetic: "/biːt/", difficulty: 1 },
];

// Level 2: More complex single words
export const WORDS_LEVEL_2: PronunciationItem[] = [
  { text: "algorithm", phonetic: "/ˈælɡəˌrɪðəm/", difficulty: 2 },
  { text: "comfortable", phonetic: "/ˈkʌmftəbəl/", difficulty: 2 },
  { text: "vegetable", phonetic: "/ˈvedʒtəbəl/", difficulty: 2 },
  { text: "temperature", phonetic: "/ˈtemprətʃər/", difficulty: 2 },
  { text: "interesting", phonetic: "/ˈɪntrəstɪŋ/", difficulty: 2 },
  { text: "chocolate", phonetic: "/ˈtʃɑːklət/", difficulty: 2 },
  { text: "restaurant", phonetic: "/ˈrestərɑːnt/", difficulty: 2 },
  { text: "through", phonetic: "/θruː/", difficulty: 2 },
  { text: "thought", phonetic: "/θɔːt/", difficulty: 2 },
  { text: "although", phonetic: "/ɔːlˈðoʊ/", difficulty: 2 },
  { text: "thoroughly", phonetic: "/ˈθɜːrəli/", difficulty: 2 },
  { text: "rural", phonetic: "/ˈrʊrəl/", difficulty: 2 },
  { text: "regularly", phonetic: "/ˈreɡjələrli/", difficulty: 2 },
  { text: "literally", phonetic: "/ˈlɪtərəli/", difficulty: 2 },
  { text: "particularly", phonetic: "/pərˈtɪkjələrli/", difficulty: 2 },
  { text: "February", phonetic: "/ˈfebruˌeri/", difficulty: 2 },
  { text: "library", phonetic: "/ˈlaɪbreri/", difficulty: 2 },
  { text: "entrepreneur", phonetic: "/ˌɑːntrəprəˈnɜːr/", difficulty: 2 },
  { text: "hierarchy", phonetic: "/ˈhaɪərɑːrki/", difficulty: 2 },
  { text: "variety", phonetic: "/vəˈraɪəti/", difficulty: 2 },
];

// Level 3: Short phrases
export const PHRASES_LEVEL_3: PronunciationItem[] = [
  { text: "three thirty-three", phonetic: "/θriː ˈθɜːrti θriː/", difficulty: 3 },
  { text: "red lorry, yellow lorry", phonetic: "/red ˈlɒri jeloʊ ˈlɒri/", difficulty: 3 },
  { text: "world wide web", phonetic: "/wɜːrld waɪd web/", difficulty: 3 },
  { text: "very well", phonetic: "/ˈveri wel/", difficulty: 3 },
  { text: "weather forecast", phonetic: "/ˈweðər ˈfɔːrkæst/", difficulty: 3 },
  { text: "further research", phonetic: "/ˈfɜːrðər rɪˈsɜːrtʃ/", difficulty: 3 },
  { text: "rural area", phonetic: "/ˈrʊrəl ˈeriə/", difficulty: 3 },
  { text: "regular exercise", phonetic: "/ˈreɡjələr ˈeksərsaɪz/", difficulty: 3 },
  { text: "thirty-three thieves", phonetic: "/ˈθɜːrti θriː θiːvz/", difficulty: 3 },
  { text: "the other brother", phonetic: "/ðə ˈʌðər ˈbrʌðər/", difficulty: 3 },
  { text: "with the weather", phonetic: "/wɪð ðə ˈweðər/", difficulty: 3 },
  { text: "breathe in, breathe out", phonetic: "/briːð ɪn briːð aʊt/", difficulty: 3 },
];

// Level 4: Longer phrases
export const PHRASES_LEVEL_4: PronunciationItem[] = [
  { text: "I really appreciate it", phonetic: "/aɪ ˈrɪəli əˈpriːʃieɪt ɪt/", difficulty: 4 },
  { text: "That's very thoughtful of you", phonetic: "/ðæts ˈveri ˈθɔːtfəl əv juː/", difficulty: 4 },
  { text: "The weather is rather unpredictable", phonetic: "/ðə ˈweðər ɪz ˈræðər ˌʌnprɪˈdɪktəbəl/", difficulty: 4 },
  { text: "I thoroughly enjoyed the experience", phonetic: "/aɪ ˈθɜːrəli ɪnˈdʒɔɪd ðə ɪkˈspɪriəns/", difficulty: 4 },
  { text: "Let me think about that", phonetic: "/let miː θɪŋk əˈbaʊt ðæt/", difficulty: 4 },
  { text: "Would you rather have", phonetic: "/wʊd juː ˈræðər hæv/", difficulty: 4 },
  { text: "I'm running a little late", phonetic: "/aɪm ˈrʌnɪŋ ə ˈlɪtəl leɪt/", difficulty: 4 },
  { text: "That's a great idea", phonetic: "/ðæts ə ɡreɪt aɪˈdɪə/", difficulty: 4 },
  { text: "What do you think about", phonetic: "/wʌt duː juː θɪŋk əˈbaʊt/", difficulty: 4 },
  { text: "I'll get right on it", phonetic: "/aɪl ɡet raɪt ɑːn ɪt/", difficulty: 4 },
];

// Level 5: Simple sentences
export const SENTENCES_LEVEL_5: PronunciationItem[] = [
  { text: "The three brothers thought thoroughly.", phonetic: "/ðə θriː ˈbrʌðərz θɔːt ˈθɜːrəli/", difficulty: 5 },
  { text: "I think this thing is worth the trouble.", phonetic: "/aɪ θɪŋk ðɪs θɪŋ ɪz wɜːrθ ðə ˈtrʌbəl/", difficulty: 5 },
  { text: "The rural road leads to the library.", phonetic: "/ðə ˈrʊrəl roʊd liːdz tuː ðə ˈlaɪbreri/", difficulty: 5 },
  { text: "Very valuable vegetables are available.", phonetic: "/ˈveri ˈvæljuəbəl ˈvedʒtəbəlz ɑːr əˈveɪləbəl/", difficulty: 5 },
  { text: "The weather whether we like it or not.", phonetic: "/ðə ˈweðər ˈweðər wiː laɪk ɪt ɔːr nɑːt/", difficulty: 5 },
  { text: "Real leaders rarely rely on luck alone.", phonetic: "/rɪəl ˈliːdərz ˈrerli rɪˈlaɪ ɑːn lʌk əˈloʊn/", difficulty: 5 },
  { text: "Please pass the peas to Peter.", phonetic: "/pliːz pæs ðə piːz tuː ˈpiːtər/", difficulty: 5 },
  { text: "She sells seashells by the seashore.", phonetic: "/ʃiː selz ˈsiːʃelz baɪ ðə ˈsiːʃɔːr/", difficulty: 5 },
];

// Level 6: Complex sentences
export const SENTENCES_LEVEL_6: PronunciationItem[] = [
  { text: "Through three cheese trees three free fleas flew.", phonetic: "/θruː θriː tʃiːz triːz θriː friː fliːz fluː/", difficulty: 6 },
  { text: "Whether the weather is warm, whether the weather is hot, we have to put up with the weather, whether we like it or not.", phonetic: "/ˈweðər ðə ˈweðər ɪz wɔːrm ˈweðər ðə ˈweðər ɪz hɑːt wiː hæv tuː pʊt ʌp wɪð ðə ˈweðər ˈweðər wiː laɪk ɪt ɔːr nɑːt/", difficulty: 6 },
  { text: "The thirty-three thieves thought that they thrilled the throne throughout Thursday.", phonetic: "/ðə ˈθɜːrti θriː θiːvz θɔːt ðæt ðeɪ θrɪld ðə θroʊn θruːˈaʊt ˈθɜːrzdeɪ/", difficulty: 6 },
  { text: "I regularly review the literature thoroughly before writing.", phonetic: "/aɪ ˈreɡjələrli rɪˈvjuː ðə ˈlɪtrətʃər ˈθɜːrəli bɪˈfɔːr ˈraɪtɪŋ/", difficulty: 6 },
  { text: "The entrepreneur's hierarchy particularly interested the variety of investors.", phonetic: "/ðə ˌɑːntrəprəˈnɜːrz ˈhaɪərɑːrki pərˈtɪkjələrli ˈɪntrəstɪd ðə vəˈraɪəti əv ɪnˈvestərz/", difficulty: 6 },
  { text: "Really rural railway routes rarely receive regular renovations.", phonetic: "/ˈrɪəli ˈrʊrəl ˈreɪlweɪ ruːts ˈrerli rɪˈsiːv ˈreɡjələr ˌrenəˈveɪʃənz/", difficulty: 6 },
];

// Level 7: Professional/Technical
export const SENTENCES_LEVEL_7: PronunciationItem[] = [
  { text: "The algorithm's theoretical framework requires thorough analysis.", phonetic: "/ðə ˈælɡəˌrɪðəmz ˌθɪəˈretɪkəl ˈfreɪmwɜːrk rɪˈkwaɪərz ˈθɜːrə əˈnæləsɪs/", difficulty: 7 },
  { text: "Our quarterly reports demonstrate consistent growth throughout the region.", phonetic: "/ˈaʊər ˈkwɔːrtərli rɪˈpɔːrts ˈdemənstreɪt kənˈsɪstənt ɡroʊθ θruːˈaʊt ðə ˈriːdʒən/", difficulty: 7 },
  { text: "The infrastructure development specifically addresses rural connectivity.", phonetic: "/ðə ˈɪnfrəˌstrʌktʃər dɪˈveləpmənt spəˈsɪfɪkli əˈdresɪz ˈrʊrəl ˌkɑːnekˈtɪvəti/", difficulty: 7 },
  { text: "Artificial intelligence requires significant computational resources.", phonetic: "/ˌɑːrtɪˈfɪʃəl ɪnˈtelɪdʒəns rɪˈkwaɪərz sɪɡˈnɪfɪkənt ˌkɑːmpjuːˈteɪʃənəl ˈriːsɔːrsɪz/", difficulty: 7 },
  { text: "The manufacturing process utilizes revolutionary materials.", phonetic: "/ðə ˌmænjuˈfæktʃərɪŋ ˈprɑːses ˈjuːtəlaɪzɪz ˌrevəˈluːʃəneri məˈtɪriəlz/", difficulty: 7 },
];

// Combine all levels for easy access
export const ALL_CONTENT = {
  1: WORDS_LEVEL_1,
  2: WORDS_LEVEL_2,
  3: PHRASES_LEVEL_3,
  4: PHRASES_LEVEL_4,
  5: SENTENCES_LEVEL_5,
  6: SENTENCES_LEVEL_6,
  7: SENTENCES_LEVEL_7,
};

// Get items for a specific level
export function getItemsForLevel(level: number): PronunciationItem[] {
  const effectiveLevel = Math.min(Math.max(level, 1), 7);
  return ALL_CONTENT[effectiveLevel as keyof typeof ALL_CONTENT] || WORDS_LEVEL_1;
}

// Get a random item from a level
export function getRandomItem(level: number): PronunciationItem {
  const items = getItemsForLevel(level);
  return items[Math.floor(Math.random() * items.length)];
}

// Get difficulty label
export function getDifficultyLabel(level: number): string {
  if (level <= 2) return "WORDS";
  if (level <= 4) return "PHRASES";
  return "SENTENCES";
}

