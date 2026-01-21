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
  sentences: 'Natural sentence flow and connected speech',
};

// Difficulty descriptions
const DIFFICULTY_PROMPTS = {
  1: 'Very simple single words (1-2 syllables), basic sounds',
  2: 'Simple words (2-3 syllables) with challenging sounds',
  3: 'Short 2-3 word phrases',
  4: 'Medium phrases (4-6 words)',
  5: 'Simple complete sentences',
  6: 'Complex sentences with multiple challenging sounds',
  7: 'Professional/technical sentences with advanced vocabulary',
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

    // Build the prompt
    const difficultyDesc = DIFFICULTY_PROMPTS[level] || DIFFICULTY_PROMPTS[3];
    const skillFocus = weakSkills && weakSkills.length > 0
      ? weakSkills.map(s => SKILL_PROMPTS[s] || s).join(', ')
      : 'general American English pronunciation';

    const prompt = `Generate ${count} unique American English pronunciation challenges for a Vietnamese/Mandarin speaker learning English.

DIFFICULTY LEVEL ${level}/7: ${difficultyDesc}

FOCUS ON THESE SOUNDS: ${skillFocus}

REQUIREMENTS:
- Each item should be natural, commonly used English
- Avoid obscure words or idioms
- Include sounds that are challenging for Vietnamese/Mandarin speakers
- For phrases/sentences, make them practical and conversational
- Vary the content - don't repeat similar patterns

OUTPUT FORMAT - Return ONLY a JSON array of objects, no markdown:
[
  {"text": "the phrase or word", "difficulty": ${level}},
  ...
]

Generate exactly ${count} items.`;

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
            content: 'You are an expert English pronunciation coach specializing in helping Vietnamese and Mandarin speakers. You generate pronunciation practice content. Always respond with valid JSON only, no markdown formatting.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
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

    // Parse the JSON response (handle potential markdown wrapping)
    let challenges;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      challenges = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to parse OpenAI response', content }),
      };
    }

    // Validate the response
    if (!Array.isArray(challenges)) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Invalid response format' }),
      };
    }

    // Ensure each item has required fields
    const validChallenges = challenges
      .filter(c => c && typeof c.text === 'string' && c.text.trim())
      .map(c => ({
        text: c.text.trim(),
        difficulty: c.difficulty || level,
        phonetic: '', // OpenAI doesn't generate IPA reliably
      }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache', // Don't cache - we want fresh content
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

