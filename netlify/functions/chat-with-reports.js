const axios = require('axios');

// Use environment variable for API key
const API_KEY = process.env.OPENAI_API_KEY;
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const GPT_MODEL = 'gpt-3.5-turbo';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { message, context: reportContext, userId } = JSON.parse(event.body);
    console.log('[chat-with-reports] Incoming:', { message, reportContext, userId });

    const { availableReports, auraReport, vibrationalReport, karmicReport } = reportContext;
    let contextString = `You are a spiritual AI guide with access to the user's completed spiritual assessments. Available reports: ${availableReports.join(', ')}.\n\n`;
    if (auraReport) {
      contextString += `AURA REPORT:\nPrimary Color: ${auraReport.primaryColor}\nSecondary Colors: ${auraReport.secondaryColors?.join(', ') || 'None'}\nAura Score: ${auraReport.auraScore}%\nPersonality Traits: ${auraReport.personalityTraits}\nEmotional Energy: ${auraReport.emotionalEnergy}\nStrengths: ${auraReport.strengths}\nAreas for Growth: ${auraReport.areasForGrowth}\nAffirmation: ${auraReport.affirmation}\n\n`;
    }
    if (vibrationalReport) {
      contextString += `VIBRATIONAL REPORT:\nFrequency: ${vibrationalReport.frequency} Hz\nLevel: ${vibrationalReport.level}\nPercentage: ${vibrationalReport.percentage}%\nAnalysis: ${vibrationalReport.analysis}\nRecommendations: ${vibrationalReport.recommendations?.join(', ') || 'None'}\nAffirmation: ${vibrationalReport.affirmation}\n\n`;
    }
    if (karmicReport) {
      contextString += `KARMIC REPORT:\nBirth Place: ${karmicReport.birthPlace}\nLife Area: ${karmicReport.lifeArea}\nChallenge: ${karmicReport.challenge}\nJyotish Reading: ${karmicReport.jyotishReading}\n\n`;
    }
    const prompt = `${contextString}\nUSER QUESTION: "${message}"\n\nPlease provide a helpful, spiritual, and personalized response based on the user's reports. Be encouraging, insightful, and practical. Connect different aspects of their reports when relevant. Keep responses conversational and warm, as if you're a wise spiritual guide.\n\nResponse:`;

    const openaiRes = await axios.post(API_ENDPOINT, {
      model: GPT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate spiritual AI guide for Eternal AI. You help users understand their spiritual assessments and provide personalized guidance. Always be encouraging, insightful, and practical. Connect different aspects of their spiritual profile when relevant. Be very consice in the answers - give short answers and be to the point. Tell them what they already know and what they need to do to improve.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('[chat-with-reports] OpenAI response:', openaiRes.data);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ response: openaiRes.data.choices[0].message.content })
    };
  } catch (error) {
    console.error('[chat-with-reports] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message, details: error.response?.data })
    };
  }
}; 