// Netlify serverless function for ElevenLabs TTS
const ELEVENLABS_API_KEY = 'sk_04e897d295dd481764a7be9097e2c9e6bcea01b9bd569874';
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - clear American English

export async function handler(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { text } = JSON.parse(event.body);
    
    if (!text) {
      return { statusCode: 400, body: 'Text is required' };
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        statusCode: response.status, 
        body: errorText 
      };
    }

    const audioBuffer = await response.arrayBuffer();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
      body: Buffer.from(audioBuffer).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: `Error: ${error.message}` 
    };
  }
}

