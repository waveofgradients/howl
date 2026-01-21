// Word and phrase database organized by difficulty level
// Specifically designed for Vietnamese and Mandarin speakers learning American English

const WORD_DATABASE = {
    // Level 1: Simple single words - common sounds
    1: {
        type: 'word',
        items: [
            'hello',
            'water',
            'coffee',
            'morning',
            'evening',
            'happy',
            'music',
            'phone',
            'table',
            'window',
            'beautiful',
            'together',
            'yellow',
            'purple',
            'orange'
        ]
    },
    
    // Level 2: Words with challenging sounds for Vietnamese/Mandarin speakers
    // Focus: th, r, l endings, v sounds
    2: {
        type: 'word',
        items: [
            'think',
            'three',
            'through',
            'Thursday',
            'weather',
            'rather',
            'brother',
            'mother',
            'father',
            'together',
            'world',
            'girl',
            'curl',
            'pearl',
            'early'
        ]
    },
    
    // Level 3: Words with consonant clusters
    3: {
        type: 'word',
        items: [
            'strength',
            'splash',
            'strange',
            'spring',
            'stream',
            'straight',
            'struggle',
            'stretch',
            'script',
            'strict',
            'complex',
            'context',
            'abstract',
            'construct',
            'instruct'
        ]
    },
    
    // Level 4: Multi-syllable words with stress patterns
    4: {
        type: 'word',
        items: [
            'algorithm',
            'particularly',
            'unfortunately',
            'comfortable',
            'vegetable',
            'temperature',
            'photography',
            'opportunity',
            'communication',
            'responsibility',
            'entrepreneurship',
            'characteristic',
            'infrastructure',
            'sophisticated',
            'revolutionary'
        ]
    },
    
    // Level 5: Short phrases with linking
    5: {
        type: 'phrase',
        items: [
            'What time is it?',
            'How are you doing?',
            'Nice to meet you.',
            'See you later.',
            'Take your time.',
            'Let me know.',
            'I appreciate it.',
            'That sounds great.',
            'What do you think?',
            'Could you help me?',
            'I\'ll be right back.',
            'Thanks for coming.',
            'Have a good one.',
            'Catch you later.',
            'No worries at all.'
        ]
    },
    
    // Level 6: Phrases with reductions and connected speech
    6: {
        type: 'phrase',
        items: [
            'What are you going to do?',
            'I\'m going to grab some coffee.',
            'Do you want to come with us?',
            'I should have called earlier.',
            'Would you mind helping me out?',
            'I\'ve been meaning to ask you.',
            'That\'s what I was thinking.',
            'Let me think about it.',
            'I\'ll get back to you on that.',
            'We\'re running a bit behind.',
            'I couldn\'t have done it without you.',
            'What would you have done?',
            'I\'m not sure what happened.',
            'Could you repeat that please?',
            'I didn\'t catch what you said.'
        ]
    },
    
    // Level 7: Longer sentences with intonation patterns
    7: {
        type: 'sentence',
        items: [
            'The weather forecast says it\'ll rain tomorrow afternoon.',
            'I was wondering if you\'d like to grab lunch sometime.',
            'The presentation went really well, considering the circumstances.',
            'We should probably reschedule the meeting for next week.',
            'I\'ve been working on this project for about three months now.',
            'Could you send me the report when you get a chance?',
            'The restaurant around the corner has amazing reviews.',
            'I think we need to reconsider our approach to this problem.',
            'She mentioned that the deadline might be extended.',
            'It would be great if we could finish this by Friday.'
        ]
    },
    
    // Level 8: Complex sentences with difficult sound combinations
    8: {
        type: 'sentence',
        items: [
            'The three brothers thoroughly thought through their theoretical thesis.',
            'Rural railroad workers rarely rely on regular routes.',
            'She sells seashells by the seashore, surely.',
            'The sixth sick sheikh\'s sixth sheep is sick.',
            'Specifically, the statistics show a substantial structural shift.',
            'The entrepreneur established an extraordinary enterprise.',
            'Particularly problematic pronunciation patterns persist persistently.',
            'The characteristic architecture attracts thousands of tourists.',
            'Revolutionary technology transforms traditional manufacturing methods.',
            'Sophisticated algorithms analyze comprehensive data infrastructure.'
        ]
    },
    
    // Level 9: Professional/Technical speech
    9: {
        type: 'sentence',
        items: [
            'According to our quarterly analysis, revenue growth exceeded expectations by approximately twelve percent.',
            'The infrastructure development initiative requires substantial investment and comprehensive strategic planning.',
            'We should leverage our competitive advantages while simultaneously addressing operational inefficiencies.',
            'The preliminary research suggests that further investigation would yield valuable insights.',
            'Implementation of the proposed methodology would significantly enhance organizational effectiveness.',
            'Cross-functional collaboration enables us to deliver innovative solutions more efficiently.',
            'The sustainability framework encompasses environmental, social, and governance considerations.',
            'Our strategic priorities focus on digital transformation and customer experience optimization.',
            'The acquisition presents synergistic opportunities across multiple business verticals.',
            'Regulatory compliance requirements necessitate comprehensive documentation and rigorous auditing procedures.'
        ]
    },
    
    // Level 10: Master level - natural conversational flow
    10: {
        type: 'conversation',
        items: [
            'You know what? I\'ve been thinking about this for a while, and I really believe we should give it a shot.',
            'To be perfectly honest with you, I wasn\'t entirely sure what to expect, but it turned out way better than I thought.',
            'Look, I totally get where you\'re coming from, but have you considered looking at it from a different angle?',
            'The thing is, we\'ve got to balance short-term priorities with our long-term strategic objectives.',
            'I mean, at the end of the day, what really matters is whether we can deliver value to our customers.',
            'Here\'s the deal: if we don\'t address this now, it\'s only going to become a bigger problem down the road.',
            'Between you and me, I think we might be overthinking this whole situation.',
            'Real talk though, the competition has been stepping up their game, and we need to respond accordingly.',
            'What I\'m trying to say is, we shouldn\'t let perfect be the enemy of good.',
            'All things considered, I\'d say we\'re in a pretty solid position moving forward.'
        ]
    }
};

// Specific problem sounds for Vietnamese speakers
const VIETNAMESE_FOCUS = [
    // Final consonants (Vietnamese lacks many final consonants)
    'build', 'cold', 'hand', 'send', 'fact', 'kept',
    // th sounds (doesn't exist in Vietnamese)
    'think', 'three', 'through', 'other', 'weather',
    // r vs l distinction
    'right', 'light', 'rice', 'lice', 'pray', 'play',
    // v vs b distinction  
    'very', 'berry', 'vote', 'boat', 'vest', 'best',
    // Consonant clusters
    'street', 'spring', 'splash', 'strange'
];

// Specific problem sounds for Mandarin speakers
const MANDARIN_FOCUS = [
    // r sounds (different from Mandarin r)
    'red', 'right', 'wrong', 'around', 'very',
    // th sounds
    'think', 'this', 'that', 'there', 'three',
    // v sound (doesn't exist in Mandarin)
    'very', 'voice', 'video', 'value', 'view',
    // Final consonants
    'makes', 'asked', 'helped', 'jumped', 'fixed',
    // Vowel distinctions
    'ship', 'sheep', 'bit', 'beat', 'full', 'fool'
];

// Get random item from current level
function getRandomChallenge(level) {
    const clampedLevel = Math.min(Math.max(level, 1), 10);
    const levelData = WORD_DATABASE[clampedLevel];
    const items = levelData.items;
    const randomIndex = Math.floor(Math.random() * items.length);
    
    return {
        text: items[randomIndex],
        type: levelData.type,
        level: clampedLevel
    };
}

// Export for use in main app
window.WORD_DATABASE = WORD_DATABASE;
window.getRandomChallenge = getRandomChallenge;

