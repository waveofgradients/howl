// Netlify serverless function for generating pronunciation challenges with OpenAI

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Skill categories for Vietnamese/Mandarin speakers
const SKILL_PROMPTS = {
  thSounds: 'TH sounds (θ and ð) - tongue between teeth',
  rVsL: 'R vs L distinction - common confusion for Asian speakers',
  vVsW: 'V vs W sounds - V requires biting lower lip',
  finalConsonants: 'Final consonants - often dropped in Vietnamese/Mandarin',
  vowelLength: 'Short vs long vowels (bit/beat, ship/sheep)',
  multiSyllable: 'Multi-syllable word stress and rhythm',
};

// Difficulty descriptions - simplified to just words
const DIFFICULTY_PROMPTS = {
  1: 'Simple single words (1-2 syllables)',
  2: 'Medium words (2-3 syllables) with challenging sounds',
  3: 'Two-word pairs only (exactly 2 words)',
};

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!OPENAI_API_KEY) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'OpenAI API key not configured' }) 
    };
  }

  try {
    const { level, weakSkills, count = 10 } = JSON.parse(event.body);
    
    // Cap level at 3 (no sentences)
    const effectiveLevel = Math.min(Math.max(level || 1, 1), 3);

    // Build the prompt
    const difficultyDesc = DIFFICULTY_PROMPTS[effectiveLevel] || DIFFICULTY_PROMPTS[1];
    const skillFocus = weakSkills && weakSkills.length > 0
      ? weakSkills.map(s => SKILL_PROMPTS[s] || s).join(', ')
      : 'general American English pronunciation';

    const prompt = `Generate ${count} unique American English pronunciation challenges for a Vietnamese/Mandarin speaker.

DIFFICULTY LEVEL ${effectiveLevel}/3: ${difficultyDesc}

FOCUS ON THESE SOUNDS: ${skillFocus}

STRICT REQUIREMENTS:
- Level 1-2: ONLY single words (no phrases, no sentences)
- Level 3: ONLY two-word pairs (exactly 2 words, like "red light" or "very well")
- NO sentences, NO phrases longer than 2 words
- Use common, everyday words
- Include sounds challenging for Vietnamese/Mandarin speakers

OUTPUT FORMAT - Return ONLY a JSON array, no markdown:
[
  {"text": "word", "difficulty": ${effectiveLevel}},
  ...
]

Generate exactly ${count} items. Remember: NO sentences, just single words or 2-word pairs.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an English pronunciation coach. Generate ONLY single words or 2-word pairs for practice. NEVER generate sentences or phrases longer than 2 words. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'OpenAI API error', details: errorText }),
      };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No content from OpenAI' }),
      };
    }

    // Parse the JSON response
    let challenges;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      challenges = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to parse OpenAI response', content }),
      };
    }

    if (!Array.isArray(challenges)) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Invalid response format' }),
      };
    }

    // Filter and validate - ensure no long phrases snuck through
    const validChallenges = challenges
      .filter(c => c && typeof c.text === 'string' && c.text.trim())
      .map(c => ({
        text: c.text.trim(),
        difficulty: Math.min(c.difficulty || effectiveLevel, 3),
        phonetic: '',
      }))
      // Extra safety: filter out anything with more than 2 words
      .filter(c => c.text.split(/\s+/).length <= 2);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({ challenges: validChallenges }),
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
