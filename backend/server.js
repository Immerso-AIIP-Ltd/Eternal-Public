// backend/server.js
const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
// Update CORS to allow all local dev ports
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'] }));

// Replace the old fetch import with a dynamic import for compatibility
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Proxy endpoint for OpenAI chat completions
app.post('/api/openai', async (req, res) => {
  const { messages, model = 'gpt-4o', max_tokens = 4000, temperature = 0.7 } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not set in backend .env' });
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature
      })
    });
    const data = await response.json();
    console.log('OpenAI API response:', data); // Log the full OpenAI response
    res.status(response.status).json(data);
  } catch (error) {
    console.error('OpenAI Proxy Error:', error);
    res.status(500).json({ error: 'Failed to contact OpenAI API' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`OpenAI proxy server running on port ${PORT}`)); 