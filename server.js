// Simple Express server to proxy ElevenLabs API calls
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

const ELEVENLABS_API_KEY = 'sk_04e897d295dd481764a7be9097e2c9e6bcea01b9bd569874';
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Text-to-speech endpoint
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    console.log(`TTS request for: "${text}"`);
    
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
          text: text,
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
      console.error('ElevenLabs error:', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    // Stream the audio back
    res.set({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    });
    
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
    
    console.log(`TTS success for: "${text}"`);
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// Listen on all interfaces so mobile devices can connect
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎤 HOWL API server running on port ${PORT}`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Network: http://192.168.86.30:${PORT}`);
  console.log(`   TTS endpoint: POST /api/tts`);
  console.log(`   Health check: GET /api/health\n`);
});

