/**
 * Utilities for parsing and processing AI responses
 */

/**
 * Attempts to extract JSON from an AI text response
 * @param {string} responseText - The raw text response from the AI
 * @returns {Object} - The parsed JSON object
 * @throws {Error} - If JSON cannot be parsed
 */
export const extractJsonFromResponse = (responseText) => {
  // First, try direct JSON parsing
  try {
    return JSON.parse(responseText);
  } catch (e) {
    // Not valid JSON, so try to extract it
    console.log('Direct parsing failed, attempting to extract JSON from text');
  }

  // Try to extract JSON that might be wrapped in markdown code blocks
  const jsonRegexPatterns = [
    /```json\n([\s\S]*?)\n```/, // Markdown JSON code block
    /```\n([\s\S]*?)\n```/,     // Generic markdown code block
    /{[\s\S]*?}/                // Any JSON-like object
  ];

  for (const pattern of jsonRegexPatterns) {
    const match = responseText.match(pattern);
    if (match) {
      try {
        // For the first two patterns, we want the captured group
        // For the last pattern, we want the full match
        const jsonContent = pattern === jsonRegexPatterns[2] ? match[0] : match[1];
        return JSON.parse(jsonContent.replace(/```json\n|```/g, '').trim());
      } catch (err) {
        console.error('Failed to parse extracted potential JSON:', err);
      }
    }
  }

  // If we get here, we couldn't extract valid JSON
  throw new Error('Could not parse or extract valid JSON from the response');
};

/**
 * Processes raw text from the AI about face and palm reading
 * into a structured format
 * @param {string} analysisText - The raw text from the AI
 * @returns {Object} - Structured report data
 */
export const processAnalysisText = (analysisText) => {
  try {
    // Try to extract JSON from the text
    return extractJsonFromResponse(analysisText);
  } catch (error) {
    console.error('Could not process analysis text to JSON', error);
    
    // As a fallback, attempt to extract information manually
    // This is a very basic implementation that would need to be expanded
    // for a production system
    
    const fallbackData = {
      overallScore: 75,
      faceAnalysis: {
        faceShape: "Unknown",
        faceShapeMeaning: "Not determined from analysis",
        dominantTraits: [],
        personality: "Analysis couldn't be structured properly",
        lifePhase: "Current",
        energyLevel: "Moderate"
      },
      palmAnalysis: {
        handType: "Unknown",
        handTypeMeaning: "Not determined from analysis",
        lifeLine: "Present in palm",
        heartLine: "Present in palm",
        headLine: "Present in palm",
        destinyPath: "Your unique journey continues"
      },
      compatibility: {
        bestMatches: ["Compatible personalities"],
        challenges: ["Communication"],
        recommendations: ["Self-reflection", "Open dialogue"]
      },
      predictions: {
        career: "Your career path has potential for growth",
        relationships: "Meaningful connections are possible",
        health: "Balance is key to wellbeing",
        spiritual: "Your spiritual journey is personal"
      }
    };
    
    // Try to extract some basic information
    if (analysisText.includes("oval face")) {
      fallbackData.faceAnalysis.faceShape = "Oval";
      fallbackData.faceAnalysis.faceShapeMeaning = "Balanced and harmonious";
    }
    
    // Extract traits mentioned in the text
    const traitsToCheck = [
      "leadership", "creativity", "intuition", "analytical", 
      "emotional", "logical", "practical", "ambitious"
    ];
    
    const extractedTraits = traitsToCheck.filter(trait => 
      analysisText.toLowerCase().includes(trait)
    ).map(trait => trait.charAt(0).toUpperCase() + trait.slice(1));
    
    if (extractedTraits.length > 0) {
      fallbackData.faceAnalysis.dominantTraits = extractedTraits;
    }
    
    // Return the fallback data with some extracted information
    return fallbackData;
  }
};

/**
 * Ensures the report data has all required fields with fallbacks
 * @param {Object} data - The report data to validate
 * @returns {Object} - Validated and completed data
 */
export const ensureCompleteReportData = (data) => {
  // Start with a deep copy to avoid mutating the original
  const result = JSON.parse(JSON.stringify(data));
  
  // Check for all required sections
  result.overallScore = result.overallScore || Math.floor(Math.random() * 30) + 70;
  result.faceAnalysis = result.faceAnalysis || {};
  result.palmAnalysis = result.palmAnalysis || {};
  result.compatibility = result.compatibility || {};
  result.predictions = result.predictions || {};
  
  // Ensure face analysis has all fields
  const faceAnalysis = result.faceAnalysis;
  faceAnalysis.faceShape = faceAnalysis.faceShape || "Balanced";
  faceAnalysis.faceShapeMeaning = faceAnalysis.faceShapeMeaning || "Harmonious features indicate balance";
  faceAnalysis.dominantTraits = faceAnalysis.dominantTraits || ["Analytical", "Creative", "Intuitive"];
  faceAnalysis.forehead = faceAnalysis.forehead || "Proportionate to facial structure";
  faceAnalysis.eyes = faceAnalysis.eyes || "Expressive and attentive";
  faceAnalysis.eyebrows = faceAnalysis.eyebrows || "Well-defined";
  faceAnalysis.nose = faceAnalysis.nose || "Balanced and proportionate";
  faceAnalysis.lips = faceAnalysis.lips || "Expressive";
  faceAnalysis.chin = faceAnalysis.chin || "Shows determination";
  faceAnalysis.personality = faceAnalysis.personality || "Balanced personality with analytical and creative tendencies";
  faceAnalysis.lifePhase = faceAnalysis.lifePhase || "Growth";
  faceAnalysis.energyLevel = faceAnalysis.energyLevel || "Moderate to High";
  
  // Ensure palm analysis has all fields
  const palmAnalysis = result.palmAnalysis;
  palmAnalysis.handType = palmAnalysis.handType || "Mixed";
  palmAnalysis.handTypeMeaning = palmAnalysis.handTypeMeaning || "Balanced qualities";
  palmAnalysis.lifeLine = palmAnalysis.lifeLine || "Shows vitality and resilience";
  palmAnalysis.heartLine = palmAnalysis.heartLine || "Balanced emotional nature";
  palmAnalysis.headLine = palmAnalysis.headLine || "Analytical thinking capabilities";
  palmAnalysis.fateLine = palmAnalysis.fateLine || "Direction in career and purpose";
  palmAnalysis.mountOfVenus = palmAnalysis.mountOfVenus || "Passion for life";
  palmAnalysis.fingerAnalysis = palmAnalysis.fingerAnalysis || "Balanced abilities";
  palmAnalysis.specialMarkings = palmAnalysis.specialMarkings || "Unique characteristics";
  palmAnalysis.destinyPath = palmAnalysis.destinyPath || "Path of personal growth and fulfillment";
  
  // Ensure compatibility has all fields
  const compatibility = result.compatibility;
  compatibility.bestMatches = compatibility.bestMatches || ["Compatible personalities", "Similar values"];
  compatibility.challenges = compatibility.challenges || ["Communication", "Balance"];
  compatibility.recommendations = compatibility.recommendations || ["Self-reflection", "Mindfulness", "Creative expression"];
  
  // Ensure predictions has all fields
  const predictions = result.predictions;
  predictions.career = predictions.career || "Potential for growth and fulfillment";
  predictions.relationships = predictions.relationships || "Meaningful connections with authentic communication";
  predictions.health = predictions.health || "Balance physical and mental wellbeing";
  predictions.spiritual = predictions.spiritual || "Journey of self-discovery and growth";
  
  return result;
}; 