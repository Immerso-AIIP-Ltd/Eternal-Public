// services/gpt.js - Updated with token optimization

export async function generateReportWithVision(systemPrompt, imageUrl, data, apiKey) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  const messages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];

  // Add user message with or without image
  if (imageUrl) {
    messages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Generate a comprehensive life prediction report based on the provided astrological data and birth chart image.'
        },
        {
          type: 'image_url',
          image_url: {
            url: imageUrl,
            detail: 'high'
          }
        }
      ]
    });
  } else {
    messages.push({
      role: 'user',
      content: 'Generate a comprehensive life prediction report based on the provided astrological data.'
    });
  }

  const requestBody = {
    model: 'gpt-4o',
    messages,
    max_tokens: 4000,
    temperature: 0.7
  };

  console.log('OpenAI Request:', {
    messageCount: messages.length,
    hasImage: !!imageUrl,
    estimatedTokens: estimateTokens(systemPrompt)
  });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const result = data.choices[0].message.content;
      
      // Log usage for monitoring
      if (data.usage) {
        console.log('OpenAI Usage:', {
          prompt_tokens: data.usage.prompt_tokens,
          completion_tokens: data.usage.completion_tokens,
          total_tokens: data.usage.total_tokens
        });
      }
      
      return result;
    } else {
      throw new Error('No response generated from OpenAI');
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

// Token estimation utility
function estimateTokens(text) {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

// Alternative function for text-only generation (no vision)
export async function generateTextOnlyReport(systemPrompt, apiKey) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: 'Generate a comprehensive life prediction report based on the provided astrological data.'
    }
  ];

  const requestBody = {
    model: 'gpt-4o-mini', // Use mini for text-only to save costs
    messages,
    max_tokens: 4000,
    temperature: 0.7
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const result = data.choices[0].message.content;
      
      // Log usage for monitoring
      if (data.usage) {
        console.log('OpenAI Usage:', {
          prompt_tokens: data.usage.prompt_tokens,
          completion_tokens: data.usage.completion_tokens,
          total_tokens: data.usage.total_tokens
        });
      }
      
      return result;
    } else {
      throw new Error('No response generated from OpenAI');
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}