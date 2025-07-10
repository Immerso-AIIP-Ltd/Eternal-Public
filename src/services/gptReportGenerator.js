// src/services/gptReportGenerator.js
import axios from 'axios';

const GPT_API_URL = 'http://localhost:5000/api/openai';

/**
 * Summarizes Vedic astrology data for AI processing
 * Extracts only essential insights to optimize tokens
 */
function summarizeVedicData(vedastroData) {
  if (!vedastroData || !vedastroData.astrologyData) {
    return "No Vedic astrology data available";
  }

  const data = vedastroData.astrologyData;
  
  // Extract key insights instead of raw data
  const summary = {
    chartType: "Vedic/Jyotish",
    keyPlanets: extractKeyPlanets(data),
    significantHouses: extractSignificantHouses(data),
    currentDasha: extractDashaInfo(data),
    majorAspects: extractMajorAspects(data),
    chartStrengths: extractChartStrengths(data)
  };

  return JSON.stringify(summary, null, 2);
}

/**
 * Summarizes Western numerology data for AI processing
 */
function summarizeNumerologyData(numerologyData) {
  if (!numerologyData) {
    return "No Western numerology data available";
  }

  const summary = {
    systemType: "Western Numerology",
    coreNumbers: {
      lifePathNumber: numerologyData.life_path_number?.result || 'N/A',
      destinyNumber: numerologyData.destiny_number?.result || 'N/A',
      soulUrgeNumber: numerologyData.soul_urge_number?.result || 'N/A',
      personalityNumber: numerologyData.personality_number?.result || 'N/A'
    },
    meanings: {
      lifePath: numerologyData.life_path_number?.meaning || '',
      destiny: numerologyData.destiny_number?.meaning || '',
      soulUrge: numerologyData.soul_urge_number?.meaning || '',
      personality: numerologyData.personality_number?.meaning || ''
    },
    challenge: numerologyData.challenge?.result || 'N/A',
    luckyNumbers: numerologyData.lucky_numbers || [],
    compatibility: numerologyData.compatibility || {}
  };

  return JSON.stringify(summary, null, 2);
}

/**
 * Helper functions to extract key insights from Vedic data
 */
function extractKeyPlanets(astrologyData) {
  const planetRegex = /\*\*(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu)\*\*:[\s\S]*?(?=\*\*|$)/g;
  const planets = [];
  let match;

  while ((match = planetRegex.exec(astrologyData)) !== null) {
    const planetData = match[0];
    const planet = match[1];
    
    // Extract house, sign, and key attributes
    const houseMatch = planetData.match(/Occupies House: (House\d+)/);
    const signMatch = planetData.match(/Zodiac Sign: (\w+)/);
    const beneficMatch = planetData.match(/Is Benefic: (True|False)/);
    const maleficMatch = planetData.match(/Is Malefic: (True|False)/);

    planets.push({
      name: planet,
      house: houseMatch ? houseMatch[1] : 'Unknown',
      sign: signMatch ? signMatch[1] : 'Unknown',
      isBenefic: beneficMatch ? beneficMatch[1] === 'True' : false,
      isMalefic: maleficMatch ? maleficMatch[1] === 'True' : false
    });
  }

  return planets;
}

function extractSignificantHouses(astrologyData) {
  const houseRegex = /\*\*House(\d+)\*\*:[\s\S]*?(?=\*\*House|\*\*Planet|$)/g;
  const houses = [];
  let match;

  while ((match = houseRegex.exec(astrologyData)) !== null) {
    const houseData = match[0];
    const houseNumber = match[1];
    
    const signMatch = houseData.match(/Sign: (\w+)/);
    const lordMatch = houseData.match(/Lord of House: (\w+)/);
    const planetsMatch = houseData.match(/Planets In House: ([^-\n]*)/);
    const strengthMatch = houseData.match(/House Strength: ([\d.]+) \((\w+)\)/);

    houses.push({
      number: houseNumber,
      sign: signMatch ? signMatch[1] : 'Unknown',
      lord: lordMatch ? lordMatch[1] : 'Unknown',
      planetsInHouse: planetsMatch ? planetsMatch[1].trim() : 'None',
      strength: strengthMatch ? {
        value: parseFloat(strengthMatch[1]),
        category: strengthMatch[2]
      } : null
    });
  }

  // Return only houses with planets or strong influence
  return houses.filter(house => 
    house.planetsInHouse !== 'None' || 
    (house.strength && house.strength.category === 'Strong')
  );
}

function extractDashaInfo(astrologyData) {
  const dashaRegex = /## Current Dasha[\s\S]*?(?=##|$)/;
  const match = astrologyData.match(dashaRegex);
  
  if (match) {
    const dashaData = match[0];
    const planetMatch = dashaData.match(/Current Planet: (\w+)/);
    const yearsMatch = dashaData.match(/Years Remaining: ([\d.]+)/);
    
    return {
      currentPlanet: planetMatch ? planetMatch[1] : 'Unknown',
      yearsRemaining: yearsMatch ? parseFloat(yearsMatch[1]) : 0
    };
  }
  
  return { currentPlanet: 'Unknown', yearsRemaining: 0 };
}

function extractMajorAspects(astrologyData) {
  // Extract planetary aspects from the data
  const aspectRegex = /Planets Aspecting: ([^-\n]*)/g;
  const aspects = [];
  let match;

  while ((match = aspectRegex.exec(astrologyData)) !== null) {
    const aspectingPlanets = match[1].trim();
    if (aspectingPlanets && aspectingPlanets !== 'None') {
      aspects.push(aspectingPlanets);
    }
  }

  return aspects;
}

function extractChartStrengths(astrologyData) {
  const strengthRegex = /House Strength: ([\d.]+) \((\w+)\)/g;
  const strengths = { Strong: 0, Average: 0, Weak: 0 };
  let match;

  while ((match = strengthRegex.exec(astrologyData)) !== null) {
    const category = match[2];
    if (strengths.hasOwnProperty(category)) {
      strengths[category]++;
    }
  }

  return strengths;
}

/**
 * Converts SVG chart to PNG for better compatibility
 */
async function convertSVGtoPNG(svgUrl) {
  try {
    const response = await fetch(svgUrl);
    const svgText = await response.text();
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 800; // Standard size
        canvas.height = 800;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => reject(new Error('Failed to load SVG'));
      img.src = 'data:image/svg+xml;base64,' + btoa(svgText);
    });
  } catch (error) {
    console.error('SVG to PNG conversion failed:', error);
    return null;
  }
}

/**
 * Main function to generate AI-powered life prediction report
 */
export async function generateKarmicReport(userData) {
  try {
    console.log('🚀 Starting AI report generation...');
    
    // Prepare summarized data
    const vedicSummary = summarizeVedicData(userData.vedastroData);
    const numerologySummary = summarizeNumerologyData(userData.numerologyData);
    
    // Create the master prompt
    const systemPrompt = `You are a master astrologer with deep expertise in both Vedic astrology and Western numerology. You will create a comprehensive life prediction report that seamlessly blends insights from both systems.

CRITICAL INSTRUCTIONS:
- Give EXACTLY 50% weight to Vedic astrology insights
- Give EXACTLY 50% weight to Western numerology insights  
- Blend both systems naturally in each section (don't separate them)
- Focus on actionable life predictions, not just descriptions
- Write in a mystical yet practical tone
- Keep total response under 2000 words
- Include a synthesis section that combines both systems

USER PROFILE:
Name: ${userData.birthPlace}
Date of Birth: ${userData.dob}
Time of Birth: ${userData.tob}
Place of Birth: ${userData.birthPlace}
Area of Curiosity: ${userData.areaOfCuriosity}

VEDIC ASTROLOGY INSIGHTS:
${vedicSummary}

WESTERN NUMEROLOGY INSIGHTS:
${numerologySummary}`;

    const userPrompt = `Generate a comprehensive life prediction report with these exact sections:

## 🌟 Core Life Theme & Purpose
Blend Vedic planetary positions with numerology life path to reveal the soul's mission in this lifetime.

## 🔮 Current Life Phase Analysis  
Analyze current Dasha period alongside numerology cycles to understand present energies and timing.

## 💼 Career & Life Direction
Combine 10th house analysis with destiny number insights for professional guidance.

## 💝 Relationships & Social Dynamics
Merge 7th house influences with personality number patterns for relationship insights.

## ⚡ Challenges & Growth Opportunities
Identify karmic lessons from both systems and growth areas for spiritual evolution.

## 🎯 Next 12 Months Cosmic Forecast
Predict upcoming opportunities and challenges using both Vedic transits and numerology cycles.

## 🔗 Synthesis: The Complete Picture
Weave together all insights from both systems into unified guidance for the user's journey.

## ⭐ Actionable Cosmic Recommendations
Provide specific, practical steps the user can take based on this analysis.

Remember: Each section should naturally blend Vedic and Western insights rather than treating them separately.`;

    // Make API call to GPT-4o
    const response = await axios.post(GPT_API_URL, {
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.7
    });

    const generatedReport = response.data.choices[0].message.content;
    
    console.log('✅ AI report generated successfully');
    return {
      success: true,
      report: generatedReport,
      metadata: {
        tokensUsed: response.data.usage?.total_tokens || 0,
        model: 'gpt-4o',
        generatedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ Error generating AI report:', error);
    
    // Return fallback report with available data
    return {
      success: false,
      report: generateFallbackReport(userData),
      error: error.message,
      metadata: {
        fallback: true,
        generatedAt: new Date().toISOString()
      }
    };
  }
}

/**
 * Fallback report generator when AI fails
 */
function generateFallbackReport(userData) {
  return `# Your Karmic Life Prediction Report

## 🌟 Core Life Theme & Purpose
Based on your birth details (${userData.dob} at ${userData.tob} in ${userData.birthPlace}), your cosmic blueprint reveals a unique path of growth and discovery.

Your area of curiosity in **${userData.areaOfCuriosity}** suggests this is a significant theme in your current life journey.

## 📊 Available Data Summary
We have successfully gathered your Vedic astrology and Western numerology data. However, the AI analysis encountered a temporary issue.

**Vedic Astrology Status:** ${userData.vedastroData ? '✅ Data Available' : '❌ Data Missing'}
**Western Numerology Status:** ${userData.numerologyData ? '✅ Data Available' : '❌ Data Missing'}

## 🔄 Next Steps
Your complete personalized report will be ready shortly. Please refresh this page or use the chat feature below to ask specific questions about your charts.

The cosmic insights are being aligned for your personal journey. Thank you for your patience as we prepare your comprehensive karmic analysis.

---
*Generated on ${new Date().toLocaleDateString()} - Fallback Report*`;
}

/**
 * Chat function for answering user questions about their report
 */
export async function generateChatResponse(userQuestion, userData, chatHistory = []) {
  const messages = [
    { role: 'system', content: 'You are a helpful astrology and numerology assistant.' },
    ...chatHistory,
    { role: 'user', content: userQuestion }
  ];
  try {
    const response = await axios.post(GPT_API_URL, { messages });
    const data = response.data;
    if (data.choices && data.choices.length > 0) {
      return { success: true, response: data.choices[0].message.content, tokensUsed: data.usage?.total_tokens };
    } else {
      return { success: false, response: 'No response from AI.' };
    }
  } catch (error) {
    console.error('Chat response error:', error);
    return { success: false, response: 'Error contacting AI service.' };
  }
}