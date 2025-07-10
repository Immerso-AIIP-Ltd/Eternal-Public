// gpt4VisionService.js

/**
 * Service for interacting with OpenAI's GPT-4 Vision API
 * This service handles sending images for analysis and processing the response
 */

// You would need to set up environment variables for your API key in a real implementation
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

/**
 * Calls the GPT-4 Vision API with face and palm images
 * @param {string} faceImageUrl - URL to the face image
 * @param {string} palmImageUrl - URL to the palm image
 * @returns {Promise<Object>} - Structured report data from the analysis
 */
export const analyzeImagesWithGPT4Vision = async (faceImageUrl, palmImageUrl) => {
  try {
    // Prepare the system prompt with detailed instructions
    const systemPrompt = `
      You are an expert in traditional face reading (physiognomy) and palmistry (chiromancy).
      Analyze the provided images to give detailed personality insights, characteristics, and life tendencies.
      
      For the face image analysis:
      - Determine face shape and provide personality analysis
      - Examine forehead, eyes, eyebrows, nose, mouth, lips, and chin
      - Identify dominant personality traits
      
      For the palm image analysis:
      - Identify hand type (Earth, Air, Water, Fire)
      - Analyze major lines (Life, Heart, Head, Fate)
      - Examine mounts and their prominence
      - Note any special markings
      
      Format your response as a structured JSON object with the following schema:
      {
        "overallScore": number,
        "faceAnalysis": {
          "faceShape": string,
          "faceShapeMeaning": string,
          "dominantTraits": string[],
          "forehead": string,
          "eyes": string,
          "eyebrows": string,
          "nose": string,
          "lips": string,
          "chin": string,
          "personality": string,
          "lifePhase": string,
          "energyLevel": string
        },
        "palmAnalysis": {
          "handType": string,
          "handTypeMeaning": string,
          "lifeLine": string,
          "heartLine": string,
          "headLine": string,
          "fateLine": string,
          "mountOfVenus": string,
          "fingerAnalysis": string,
          "specialMarkings": string,
          "destinyPath": string
        },
        "compatibility": {
          "bestMatches": string[],
          "challenges": string[],
          "recommendations": string[]
        },
        "predictions": {
          "career": string,
          "relationships": string,
          "health": string,
          "spiritual": string
        }
      }
      
      Ensure all analysis is positive and constructive, focusing on potential and growth rather than negative predictions.
    `;

    // Make the API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze these images for face reading (first image) and palm reading (second image) based on traditional physiognomy and palmistry. Provide detailed personality insights, characteristics, and life tendencies in the JSON format specified."
              },
              {
                type: "image_url",
                image_url: {
                  url: faceImageUrl
                }
              },
              {
                type: "image_url",
                image_url: {
                  url: palmImageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 3000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    
    // Parse the content from GPT-4 Vision's response
    // The model should return JSON, but it might be embedded in text
    const content = result.choices[0].message.content;
    
    // Try to extract JSON from the response
    let reportData;
    try {
      // First try direct JSON parsing
      reportData = JSON.parse(content);
    } catch (e) {
      // If that fails, try to extract JSON from the text (the model might wrap it)
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*}/);
                        
      if (jsonMatch) {
        try {
          reportData = JSON.parse(jsonMatch[0].replace(/```json\n|```/g, ''));
        } catch (err) {
          console.error('Failed to parse extracted JSON', err);
          throw new Error('Could not parse the AI response into structured data.');
        }
      } else {
        // If we can't find JSON, we'll have to handle the response differently
        throw new Error('AI response did not contain valid JSON data.');
      }
    }
    
    // Add final validation and cleanup
    validateReportData(reportData);
    
    return reportData;
    
  } catch (error) {
    console.error('Error calling GPT-4 Vision API:', error);
    throw error;
  }
};

/**
 * Validates and cleans up the report data structure
 * @param {Object} data - The report data to validate
 */
const validateReportData = (data) => {
  // Ensure all required fields exist
  if (!data.overallScore) {
    data.overallScore = Math.floor(Math.random() * 30) + 70; // Fallback between 70-100
  }
  
  // Ensure object structures exist
  data.faceAnalysis = data.faceAnalysis || {};
  data.palmAnalysis = data.palmAnalysis || {};
  data.compatibility = data.compatibility || {};
  data.predictions = data.predictions || {};
  
  // Ensure arrays exist
  data.faceAnalysis.dominantTraits = data.faceAnalysis.dominantTraits || ["Intuitive", "Analytical", "Creative"];
  data.compatibility.bestMatches = data.compatibility.bestMatches || [];
  data.compatibility.challenges = data.compatibility.challenges || [];
  data.compatibility.recommendations = data.compatibility.recommendations || ["Meditation", "Creative expression", "Nature connection"];
  
  return data;
};

/**
 * For development/testing when API is not available
 * @returns {Promise<Object>} - Mock report data
 */
export const getMockAnalysisData = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return {
    overallScore: 87,
    faceAnalysis: {
      faceShape: "Oval",
      faceShapeMeaning: "Balanced, harmonious, and adaptable personality",
      dominantTraits: ["Intuition", "Leadership", "Creativity"],
      forehead: "High forehead indicating intelligence and imagination",
      eyes: "Deep-set eyes suggesting analytical thinking and depth of emotion",
      eyebrows: "Well-defined, showing determination and clarity of purpose",
      nose: "Straight and proportionate, indicating balanced judgment",
      lips: "Full lips, showing expressive and passionate nature",
      chin: "Defined chin showing persistence and determination",
      personality: "Your facial features suggest a harmonious blend of analytical thinking and creative expression. Your balanced oval face shape indicates adaptability and a well-rounded personality.",
      lifePhase: "Growth & Expansion",
      energyLevel: "High"
    },
    palmAnalysis: {
      handType: "Air Hand",
      handTypeMeaning: "Intellectual, analytical, and communicative",
      lifeLine: "Strong and curved - indicates vitality and a well-balanced approach to life challenges",
      heartLine: "Deep and curved - passionate emotional nature with strong connections to loved ones",
      headLine: "Long and clear - analytical thinking and strong intellectual capabilities",
      fateLine: "Visible and well-defined - clear direction in career and life purpose",
      mountOfVenus: "Well-developed - strong passion and zest for life",
      fingerAnalysis: "Long fingers suggest detail-oriented thinking and artistic tendencies",
      specialMarkings: "Triangle formation near Apollo mount indicates creative success",
      destinyPath: "Success through balancing analytical thinking with creative expression"
    },
    compatibility: {
      bestMatches: ["Earth signs", "Water signs", "Artistic personalities"],
      challenges: ["Overthinking", "Perfectionism", "Balancing logic and emotion"],
      recommendations: ["Meditation", "Creative expression", "Nature connection", "Mindfulness practice"]
    },
    predictions: {
      career: "Breakthrough in a field that combines analytical thinking with creative expression within 6-8 months",
      relationships: "Deep and meaningful connection forming with someone who appreciates both your intellectual and emotional depth",
      health: "Focus on balancing mental exertion with physical activity for optimal wellbeing",
      spiritual: "Awakening to a deeper understanding of your life purpose and spiritual gifts"
    }
  };
};