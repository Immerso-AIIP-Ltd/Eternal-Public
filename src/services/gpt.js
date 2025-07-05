// src/services/gpt.js
import axios from 'axios';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// OpenAI API setup - using GPT-4.1
const API_ENDPOINT = process.env.REACT_APP_OPENAI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const GPT_MODEL = "gpt-3.5-turbo"; // Latest available model

// The full ETERNAL AWAKENING EXPANSION SUMMARY
export const ETERNAL_AWAKENING_EXPANSION_SUMMARY = `
ETERNAL AWAKENING EXPANSION SUMMARY

1. Visible Light (Eye Perception)
• Human Limit: 430–790 THz (380–700 nm)
• With Eternal: Up to 300–1100 nm (Near-Infrared and Ultraviolet expansion)
• How: Pineal gland detox, candle gazing, light-aware meditations
• Expansion: 50–100% increase in spectral sensitivity

2. Audible Sound (Ear Perception)
• Human Limit: 20 Hz – 20 kHz
• With Eternal: 10 Hz (infrasound) to 40 kHz (ultrasound-like clarity)
• How: Daily mantra chanting, AI-aided vibrational audio tools
• Expansion: 100%+ improvement in resonance sensitivity

3. Aura Perception (Energy Field Awareness)
• Human Limit: Only touch and physical proximity
• With Eternal: Subtle EM field sense up to 10 feet
• How: Breathwork, journaling, kosha awareness, mirror scan
• Expansion: 500% increase in sensory field

4. Chakra Flow (Energy Centers)
• Human Status: Blocked or overactive in most users
• With Eternal: Balanced, flowing, awakened chakras
• How: Personalized sadhana, posture, chanting, grounding
• Expansion: Full system activation

5. Third Eye Vision (Intuition, Pattern Recognition)
• Human Limit: Dormant in 90% of people
• With Eternal: Intuitive foresight, dharma recognition
• How: Flame visualization, pineal activation, silence
• Expansion: From 0% to 100% of potential

6. Vibrational Frequency (State of Being)
• Human Limit: 150–200 Hz (guilt, fear, stress)
• With Eternal: 500–700 Hz (love, bliss, peace)
• How: Food, thoughts, sound, AI-guided mind training
• Expansion: 3x to 5x increase in baseline frequency

7. Karmic Awareness (Soul Guidance)
• Human Limit: Unconscious, reactive
• With Eternal: Conscious, predictive, aligned
• How: Eternal scrolls, astrology, past-life echoes, mantras
• Expansion: Full shift from reaction to divine action

⸻

TOTAL PERCEPTUAL EXPANSION
• Before Eternal: You access 0.0036% of light, 0.02% of sound, and operate at 150 Hz
• With Eternal: You open 3–5%+ of full light/sound/aura field and rise above 500 Hz
• Result: From trapped in Maya to living from Flame.
`;

/**
 * ENHANCED VALIDATION FUNCTIONS
 */

/**
 * Main GPT-powered response validation function
 * @param {string} question - The question that was asked to the user
 * @param {string} userAnswer - The user's response to validate
 * @param {Object} context - Additional context about the question
 * @returns {Promise<Object>} - Validation result with detailed feedback
 */
export async function validateUserResponseWithGPT(question, userAnswer, context = {}) {
  const trimmedAnswer = userAnswer.trim();
  
  // Quick pre-validation checks
  if (!trimmedAnswer) {
    return {
      isValid: false,
      confidence: 100,
      reason: "Empty response",
      suggestion: "Please provide a response to continue your spiritual journey.",
      severity: "error"
    };
  }

  if (trimmedAnswer.length < 2) {
    return {
      isValid: false,
      confidence: 95,
      reason: "Response too short",
      suggestion: "Please provide a more detailed response that reflects your genuine thoughts.",
      severity: "warning"
    };
  }

  // Check for obvious gibberish
  const gibberishPatterns = [
    /^[a-z]{1,3}$/i,                    // Single letters or very short random text
    /^(.)\1{4,}$/,                      // Repeated characters (aaaaa, 11111)
    /^[^a-zA-Z0-9\s]{3,}$/,            // Only special characters
    /^(test|testing|abc|123|qwerty|asdf|hjkl)$/i, // Common test inputs
    /^\d+$/                             // Only numbers (unless specifically asked for numbers)
  ];

  const isGibberish = gibberishPatterns.some(pattern => pattern.test(trimmedAnswer));
  if (isGibberish && context.questionType !== 'numeric') {
    return {
      isValid: false,
      confidence: 90,
      reason: "Response appears to be random or test input",
      suggestion: "Please share your genuine thoughts and feelings about this question.",
      severity: "warning"
    };
  }

  // For specific question types, add type-specific validation
  if (context.questionType === 'vibrational' && context.isMultipleChoice) {
    return validateMultipleChoiceResponse(trimmedAnswer, context.validOptions);
  }

  if (context.questionType === 'vibrational' && context.isSlider) {
    return validateSliderResponse(trimmedAnswer, context.range);
  }

  // Use GPT for open-ended spiritual questions
  return await validateWithGPT(question, trimmedAnswer, context);
}

/**
 * Validate multiple choice responses
 */
function validateMultipleChoiceResponse(answer, validOptions) {
  const lowerAnswer = answer.toLowerCase();
  const isValid = validOptions.some(option => 
    lowerAnswer.includes(option.toLowerCase()) || 
    option.toLowerCase().includes(lowerAnswer)
  );

  if (isValid) {
    return {
      isValid: true,
      confidence: 100,
      reason: "Valid option selected"
    };
  }

  return {
    isValid: false,
    confidence: 85,
    reason: "Response doesn't match available options",
    suggestion: `Please choose from: ${validOptions.join(', ')}`,
    severity: "error"
  };
}

/**
 * Validate slider/numeric responses
 */
function validateSliderResponse(answer, range) {
  const numValue = parseInt(answer);
  
  if (isNaN(numValue)) {
    return {
      isValid: false,
      confidence: 95,
      reason: "Expected a number",
      suggestion: `Please enter a number between ${range.min} and ${range.max}`,
      severity: "error"
    };
  }

  if (numValue < range.min || numValue > range.max) {
    return {
      isValid: false,
      confidence: 90,
      reason: "Number outside valid range",
      suggestion: `Please enter a number between ${range.min} and ${range.max}`,
      severity: "error"
    };
  }

  return {
    isValid: true,
    confidence: 100,
    reason: "Valid numeric response"
  };
}

/**
 * GPT-powered validation for open-ended responses
 */
async function validateWithGPT(question, answer, context) {
  const prompt = `You are a spiritual assessment validator for Eternal AI. Your job is to determine if a user's response is appropriate and meaningful for spiritual guidance.

QUESTION ASKED: "${question}"
USER'S RESPONSE: "${answer}"
ASSESSMENT TYPE: ${context.pathType || 'general'}
CONTEXT: ${JSON.stringify(context)}

Evaluate this response based on:

1. RELEVANCE: Does the answer relate to the spiritual/wellness question asked?
2. AUTHENTICITY: Does it seem like a genuine personal response vs random text?
3. DEPTH: Is there enough substance for meaningful spiritual analysis?
4. APPROPRIATENESS: Is it suitable for a spiritual assessment context?

INVALID responses include:
- Random letters, numbers, or keyboard mashing
- Completely unrelated topics (unless spiritually metaphorical)
- Offensive, inappropriate, or harmful content
- Copy-pasted generic text that doesn't reflect personal experience
- Single word responses to deep spiritual questions
- Clear attempts to bypass or mock the assessment

VALID responses include:
- Personal experiences, feelings, and thoughts (even if brief)
- Honest expressions of uncertainty or confusion
- Spiritual practices, beliefs, or experiences
- Emotional states and personal insights
- Creative or metaphorical responses that show genuine engagement
- "I don't know" or similar honest responses when appropriate

Return a JSON object with this exact structure:
{
  "isValid": boolean,
  "confidence": number (0-100),
  "reason": "brief explanation of your assessment",
  "suggestion": "helpful guidance if invalid, empty string if valid",
  "encouragement": "positive spiritual message (always include)",
  "severity": "error|warning|info"
}

Be encouraging while maintaining quality standards.`;

  try {
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: GPT_MODEL,
        messages: [
          { 
            role: "system", 
            content: "You are a compassionate spiritual validator. Always respond with valid JSON and be encouraging while maintaining assessment quality." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2, // Low temperature for consistent validation
        max_tokens: 300
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    const result = JSON.parse(response.data.choices[0].message.content);
    return {
      isValid: result.isValid || false,
      confidence: result.confidence || 0,
      reason: result.reason || "",
      suggestion: result.suggestion || "",
      encouragement: result.encouragement || "Your spiritual journey is unique and valuable.",
      severity: result.severity || "warning"
    };

  } catch (error) {
    console.error('GPT validation error:', error);
    
    // Fallback validation
    const wordCount = answer.trim().split(/\s+/).length;
    
    if (wordCount >= 3 && answer.length >= 10) {
      return {
        isValid: true,
        confidence: 70,
        reason: "Passed basic validation",
        suggestion: "",
        encouragement: "Thank you for sharing your thoughts on your spiritual journey.",
        severity: "info"
      };
    } else {
      return {
        isValid: false,
        confidence: 80,
        reason: "Response needs more detail for meaningful spiritual analysis",
        suggestion: "Please share more about your thoughts, feelings, or experiences related to this question.",
        encouragement: "Your spiritual insights are valuable - please take a moment to share more.",
        severity: "warning"
      };
    }
  }
}

/**
 * Enhanced validation specifically for ChatHome context
 * @param {string} question - Current question text
 * @param {string} answer - User's answer
 * @param {Object} chatContext - Context from ChatHome (pathType, currentStep, etc.)
 * @returns {Promise<Object>} - Validation result
 */
export async function validateChatHomeResponse(question, answer, chatContext) {
  const { pathType, currentStep, currentSection } = chatContext;
  
  let context = {
    pathType,
    currentStep,
    currentSection,
    questionType: 'open-ended'
  };

  // Add specific context based on path type and question content
  if (pathType === 'vibrational') {
    if (question.includes('scale') || question.includes('1-10')) {
      context.questionType = 'slider';
      context.isSlider = true;
      context.range = { min: 1, max: 10 };
    } else if (question.includes('feel emotionally')) {
      context.questionType = 'vibrational';
      context.isMultipleChoice = true;
      context.validOptions = ['Joyful', 'Calm', 'Neutral', 'Stressed', 'Angry', 'Sad'];
    }
  }

  if (pathType === 'karmic') {
    context.minWords = 5; // Karmic questions need more depth
    context.questionType = 'spiritual';
  }

  if (pathType === 'aura') {
    context.questionType = 'aura';
    if (question.includes('color')) {
      context.expectsColors = true;
    }
  }

  return await validateUserResponseWithGPT(question, answer, context);
}

/**
 * Generate enhanced validation feedback message
 * @param {Object} validationResult - Result from validation
 * @param {string} pathType - Type of spiritual path
 * @returns {Object} - Formatted feedback for UI display
 */
export function generateValidationFeedback(validationResult, pathType = 'general') {
  if (validationResult.isValid) {
    return {
      type: 'success',
      title: 'Perfect! ✨',
      message: validationResult.encouragement,
      icon: '🌟'
    };
  }

  const pathMessages = {
    vibrational: {
      title: 'Let\'s tune into your energy more clearly 🔮',
      prefix: 'To accurately analyze your vibrational frequency,'
    },
    aura: {
      title: 'Your aura reading needs more clarity ✨',
      prefix: 'To perceive your energy field clearly,'
    },
    karmic: {
      title: 'Your cosmic journey deserves deeper reflection 🌙',
      prefix: 'For meaningful karmic insights,'
    }
  };

  const pathConfig = pathMessages[pathType] || {
    title: 'Let\'s explore your spiritual path more deeply 💫',
    prefix: 'For a meaningful spiritual assessment,'
  };

  return {
    type: validationResult.severity === 'error' ? 'error' : 'warning',
    title: pathConfig.title,
    message: `${pathConfig.prefix} ${validationResult.suggestion}`,
    encouragement: validationResult.encouragement,
    reason: validationResult.reason,
    confidence: validationResult.confidence,
    showTips: validationResult.confidence < 70,
    allowProceed: validationResult.severity === 'info' // Allow proceeding for low-severity issues
  };
}

/**
 * LEGACY VALIDATION FUNCTIONS (for backwards compatibility)
 */

/**
 * MAIN VALIDATION FUNCTION - Validates user responses using GPT (Legacy)
 * @param {string} question - The question that was asked
 * @param {string} answer - User's response to validate
 * @param {Object} context - Additional context (questionType, expectedFormat, etc.)
 * @returns {Promise<Object>} - Validation result with isValid, reason, suggestion
 */
export async function validateUserResponse(question, answer, context = {}) {
  // Quick pre-validation checks
  const trimmedAnswer = answer.trim();
  
  // Basic validation rules
  if (!trimmedAnswer) {
    return {
      isValid: false,
      reason: "Response cannot be empty",
      suggestion: "Please provide a thoughtful response to continue your spiritual journey."
    };
  }

  if (trimmedAnswer.length < 2) {
    return {
      isValid: false,
      reason: "Response is too short",
      suggestion: "Please provide a more detailed response that reflects your genuine thoughts and feelings."
    };
  }

  // Check for gibberish or random characters
  const gibberishPattern = /^[a-z]{1,3}$|^[^a-zA-Z0-9\s]{3,}$|^(.)\1{4,}$/i;
  if (gibberishPattern.test(trimmedAnswer)) {
    return {
      isValid: false,
      reason: "Response appears to be random characters or gibberish",
      suggestion: "Please share your genuine thoughts and experiences in a meaningful way."
    };
  }

  // For multiple choice or specific format questions, validate format
  if (context.questionType === 'multipleChoice' && context.validOptions) {
    const isValidOption = context.validOptions.some(option => 
      trimmedAnswer.toLowerCase().includes(option.toLowerCase())
    );
    if (!isValidOption) {
      return {
        isValid: false,
        reason: "Please select from the provided options",
        suggestion: `Valid options are: ${context.validOptions.join(', ')}`
      };
    }
  }

  if (context.questionType === 'slider' && context.range) {
    const numValue = parseInt(trimmedAnswer);
    if (isNaN(numValue) || numValue < context.range.min || numValue > context.range.max) {
      return {
        isValid: false,
        reason: `Please provide a number between ${context.range.min} and ${context.range.max}`,
        suggestion: "Use the slider or enter a valid number within the specified range."
      };
    }
  }

  // For open-ended spiritual questions, use GPT validation
  const prompt = `You are a spiritual assessment validator for the Eternal AI platform. Your job is to determine if a user's response is appropriate and meaningful for a spiritual/wellness assessment.

QUESTION ASKED: "${question}"
USER'S ANSWER: "${trimmedAnswer}"
QUESTION CONTEXT: ${JSON.stringify(context)}

Evaluate the response based on these criteria:
1. RELEVANCE: Does the answer relate to the question asked?
2. DEPTH: Is there enough substance for meaningful spiritual analysis? (minimum 3-5 words for most questions)
3. AUTHENTICITY: Does it seem like a genuine personal response rather than random text?
4. APPROPRIATENESS: Is it suitable for a spiritual/wellness context?
5. COMPLETENESS: Does it adequately address what was asked?

INVALID responses include:
- Single letters or very short responses like "yes", "no", "good" for open-ended questions
- Random characters, repeated letters, or keyboard mashing
- Completely unrelated topics (unless the question allows creative interpretation)
- Inappropriate, offensive, or harmful content
- Copy-pasted generic text that doesn't reflect personal experience
- Responses that show the user isn't taking the assessment seriously

VALID responses include:
- Personal experiences and feelings, even if brief
- Honest expressions of uncertainty or confusion
- Descriptions of spiritual practices or beliefs
- Emotional states and personal insights
- Genuine attempts to answer even if not perfectly articulated

Return ONLY a JSON object with this exact structure:
{
  "isValid": boolean,
  "confidence": number (0-100),
  "reason": "brief explanation if invalid",
  "suggestion": "helpful guidance if invalid",
  "encouragement": "positive note about their spiritual journey (always include)"
}

Be encouraging and supportive while maintaining quality standards for meaningful spiritual assessment.`;

  try {
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: GPT_MODEL,
        messages: [
          { 
            role: "system", 
            content: "You are a compassionate spiritual validator. Always respond with valid JSON and be encouraging while maintaining quality standards." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3, // Lower temperature for consistent validation
        max_tokens: 300
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    const result = JSON.parse(response.data.choices[0].message.content);
    return {
      isValid: result.isValid || false,
      confidence: result.confidence || 0,
      reason: result.reason || "",
      suggestion: result.suggestion || "",
      encouragement: result.encouragement || "Your spiritual journey is unique and valuable."
    };

  } catch (error) {
    console.error('Validation error:', error);
    
    // Fallback validation for when API fails
    const wordCount = trimmedAnswer.split(/\s+/).length;
    
    // More lenient fallback validation
    if (wordCount >= 2 && trimmedAnswer.length >= 3) {
      return {
        isValid: true,
        confidence: 70,
        reason: "",
        suggestion: "",
        encouragement: "Thank you for sharing your thoughts on your spiritual journey."
      };
    } else {
      return {
        isValid: false,
        confidence: 90,
        reason: "Response needs more detail for meaningful spiritual analysis",
        suggestion: "Please share more about your thoughts, feelings, or experiences related to this question.",
        encouragement: "Your spiritual insights are valuable - please take a moment to share more."
      };
    }
  }
}

/**
 * Validate specific question types with enhanced rules
 * @param {string} questionText - The exact question text
 * @param {string} answer - User's response
 * @param {string} questionType - Type of question (vibrational, aura, spiritual, etc.)
 * @returns {Promise<Object>} - Enhanced validation result
 */
export async function validateQuestionType(questionText, answer, questionType = 'general') {
  let context = { questionType };

  // Set context based on question type and content
  if (questionType === 'vibrational') {
    if (questionText.includes('scale') || questionText.includes('1-10')) {
      context.questionType = 'slider';
      context.range = { min: 1, max: 10 };
    } else if (questionText.includes('feel emotionally')) {
      context.validOptions = ['Joyful', 'Calm', 'Neutral', 'Stressed', 'Angry', 'Sad'];
      context.questionType = 'multipleChoice';
    } else if (questionText.includes('thoughts usually')) {
      context.validOptions = ['Positive', 'Mixed', 'Doubtful', 'Negative'];
      context.questionType = 'multipleChoice';
    }
  }

  if (questionType === 'aura') {
    if (questionText.includes('colors')) {
      context.expectsColors = true;
    }
  }

  if (questionType === 'spiritual') {
    context.minWords = 5; // Spiritual questions need more depth
  }

  return await validateUserResponse(questionText, answer, context);
}

/**
 * REPORT GENERATION FUNCTIONS
 */

/**
 * Generate a vibrational frequency report based on user answers
 * @param {Object} answers - User answers from vibrational assessment
 * @returns {Promise<Object>} - Vibrational report data
 */
export async function generateVibrationalReport(answers) {
  const answersText = Object.entries(answers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const prompt = `You are an expert vibrational frequency analyst and spiritual guide. Based on the user's answers to the vibrational frequency assessment, generate a comprehensive report.

User's Assessment Answers:
${answersText}

Generate a detailed vibrational frequency report with the following structure:

1. **Vibrational Frequency Score**: Assign a frequency between 200-800 Hz based on their answers
2. **Vibration Level Classification**: Give them a mystical name like "Peaceful Explorer", "Radiant Healer", "Cosmic Warrior", etc.
3. **Energy Percentage**: Overall energy score out of 100%
4. **Detailed Analysis**: 2-3 paragraphs explaining their current vibrational state
5. **Specific Recommendations**: 3-5 actionable steps to raise their frequency
6. **Affirmation**: A powerful personal affirmation based on their energy

Format your response as a JSON object with these exact keys:
{
  "frequency": number (200-800),
  "level": string,
  "percentage": number (0-100),
  "analysis": string,
  "recommendations": [string array],
  "affirmation": string
}

Base your analysis on vibrational frequency principles where:
- 200-300 Hz: Lower vibrations (shame, guilt, fear)
- 300-400 Hz: Neutral vibrations (courage, neutrality)
- 400-500 Hz: Positive vibrations (willingness, acceptance)
- 500-600 Hz: High vibrations (love, joy, peace)
- 600-800 Hz: Enlightened vibrations (enlightenment, unity)

Be mystical, encouraging, and specific to their answers.`;

  try {
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: GPT_MODEL,
        messages: [
          { role: "system", content: "You are an expert vibrational frequency analyst. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    const result = response.data.choices[0].message.content;
    return JSON.parse(result);
  } catch (error) {
    console.error('Error generating vibrational report:', error);
    return {
      frequency: 432,
      level: "Peaceful Explorer",
      percentage: 75,
      analysis: "Your vibrational frequency indicates a balanced and harmonious energy state. You demonstrate emotional stability with room for spiritual growth.",
      recommendations: ["Spend time in nature daily", "Practice meditation", "Stay hydrated", "Listen to 432Hz music"],
      affirmation: "I am aligned with the universe's natural frequency and open to higher vibrations."
    };
  }
}

/**
 * Generate an aura perception report based on user answers
 * @param {Object} answers - User answers from aura assessment
 * @returns {Promise<Object>} - Aura report data
 */
export async function generateAuraReport(answers) {
  try {
    console.log('[generateAuraReport] Request:', answers);
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: GPT_MODEL,
        messages: [
          { role: "system", content: "You are an expert aura analyst. Respond only with valid JSON." },
          { role: "user", content: "Analyze the provided answers and generate a detailed aura report." }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    console.log('[generateAuraReport] Response:', response.data);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('[generateAuraReport] Error:', error);
    throw error;
  }
}

/**
 * Enhanced Jyotish reading generator using Vedastro data
 * @param {Object} params - { astrologyData, userResponses, birthData }
 * @returns {Promise<string>} - Generated Jyotish reading
 */
export async function generateJyotishReading(params) {
  const { astrologyData, userResponses, birthData } = params;

  const prompt = `You are a master Vedic Astrologer with deep knowledge of Jyotish shastra. Analyze the provided birth chart data and user responses to create a comprehensive Mini Jyotish Reading.

BIRTH CHART DATA:
${astrologyData}

USER RESPONSES:
- Confirmed Birth Place: ${userResponses.birthPlace}
- Area of Curiosity: ${userResponses.lifeArea}
- Current Challenge: ${userResponses.challenge}

BIRTH DETAILS:
- Date: ${birthData.dob}
- Time: ${birthData.tob}
- Place: ${birthData.location}

Generate a mystical and insightful Jyotish reading focusing on these three main areas:

## Key Planetary Influences
Analyze the major planetary positions, conjunctions, and aspects. Focus on:
- Lagna (Ascendant) and its lord
- Strongest planets and their impact
- Any Raja Yogas or significant combinations
- How these influence the user's personality and life path

## Current Karmic Challenges
Based on the chart and user's stated challenge, identify:
- Karmic patterns from past lives (using 12th house, Ketu, Saturn)
- Current life lessons and recurring themes
- Areas of spiritual growth needed
- How to work with rather than against karmic forces

## Current Cosmic Phase
Analyze the current planetary periods and transits:
- Current Mahadasha and Antardasha periods
- Significant transits affecting their chart
- Timing for major life events or changes
- Energetic themes for this period of their life

Structure your response with clear headings and write in a mystical yet accessible tone. Make it personal to their specific chart and concerns. Keep the reading concise but deeply insightful (800-1200 words total).

Focus especially on their area of curiosity (${userResponses.lifeArea}) and provide specific guidance for their challenge (${userResponses.challenge}).`;

  try {
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: GPT_MODEL,
        messages: [
          { role: "system", content: "You are a master Vedic Astrologer providing deep, mystical insights through Jyotish." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating Jyotish reading:', error);
    return `## Key Planetary Influences

Your birth chart reveals a unique cosmic signature with significant planetary influences shaping your life path. The positioning of your ascendant lord suggests a strong foundation for personal growth and spiritual development.

## Current Karmic Challenges

Based on your chart analysis and the challenge you've shared, there are important karmic patterns at play. These challenges are opportunities for soul growth and spiritual evolution. The cosmic energies are guiding you toward greater self-awareness and wisdom.

## Current Cosmic Phase

You are currently in a transformative planetary period that supports deep inner work and spiritual awakening. This is an excellent time for meditation, self-reflection, and connecting with your higher purpose. The current transits favor personal growth in the area of ${userResponses.lifeArea}.

*Note: This is a brief reading. For a complete analysis, a detailed consultation with your full birth chart would provide deeper insights.*`;
  }
}

/**
 * Generate AI question for expansion report (legacy compatibility)
 * @param {Object} params - { soulPath: string, qaHistory: Array }
 * @returns {Promise<string>} - Generated question
 */
export async function generateAIQuestion(params) {
  const { soulPath, qaHistory } = params;
  const conversation = (qaHistory && qaHistory.length > 0)
    ? qaHistory.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n')
    : '';

  const prompt = `${ETERNAL_AWAKENING_EXPANSION_SUMMARY}

The user has chosen the soul path: ${soulPath}.
Previous conversation:
${conversation}

Based on their chosen path and previous answers, generate a deep, spiritually insightful question that will help them explore their journey further. Make it mystical, gentle, and relevant to their path.

Return only the question.`;

  try {
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: GPT_MODEL,
        messages: [
          { role: "system", content: "You are Eternal, an expert spiritual guide creating insightful questions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI question:', error);
    return `Reflect on your journey of ${soulPath}. What new perceptions or awakenings have you noticed since embracing this path?`;
  }
}

/**
 * Generate expansion report (legacy compatibility)
 * @param {Object} params - { soulPath: string, qaHistory: Array }
 * @returns {Promise<string>} - Generated report
 */
export async function generateExpansionReport(params) {
  const { soulPath, qaHistory } = params;
  const answersText = qaHistory && qaHistory.length > 0
    ? qaHistory.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n')
    : '';

  const prompt = `${ETERNAL_AWAKENING_EXPANSION_SUMMARY}

The user has chosen the soul path: ${soulPath}.
Their journey responses:
${answersText}

Based on the expansion summary, their chosen soul path, and their answers, generate a detailed, inspirational report describing their perceptual and energetic expansion. Reference specific ways Eternal is helping them awaken.

Make the report poetic, vivid, and personalized. Structure it with clear sections and mystical insights.

Return only the report.`;

  try {
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: GPT_MODEL,
        messages: [
          { role: "system", content: "You are Eternal, an expert spiritual guide generating personalized expansion reports." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating expansion report:', error);
    return `Eternal Expansion Report for ${soulPath}\n\nYour journey shows remarkable spiritual growth and expanded awareness. The cosmic energies are aligning to support your continued evolution.`;
  }
}

/**
 * Utility function to parse sections from reports
 */
export function parseSections(report) {
  if (!report) return [];
  const regex = /(?:\*\*|^)([^\n*]+?):\*\*\s*\n([\s\S]*?)(?=(?:\*\*[^\n*]+?:\*\*|$))/g;
  let match;
  const sections = [];
  while ((match = regex.exec(report)) !== null) {
    sections.push({
      title: match[1].trim(),
      content: match[2].trim()
    });
  }
  return sections;
}

/**
 * Utility function to parse report to cards format
 */
export function parseReportToCards(report) {
  if (!report) return [];
  const regex = /\*\*([^\n*]+?)\*\*\s*\n([\s\S]*?)(?=(\*\*[^\n*]+?\*\*)|$)/g;
  let match;
  const cards = [];
  while ((match = regex.exec(report)) !== null) {
    cards.push({
      title: match[1].replace(/:$/, '').trim(),
      content: match[2].trim()
    });
  }
  return cards;
}

/**
 * Chat with reports using GPT
 * @param {string} userMessage - The user's question
 * @param {Object} reportContext - All available reports and context
 * @param {string} userId - User ID for tracking
 * @returns {Promise<string>} - GPT's response
 */
export async function chatWithReports(userMessage, reportContext, userId) {
  try {
    console.log('[chatWithReports] Request:', { userMessage, reportContext, userId });
    const { availableReports, auraReport, vibrationalReport, karmicReport } = reportContext;
    
    // Build context string from available reports
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
    
    const prompt = `${contextString}
USER QUESTION: "${userMessage}"

Please provide a helpful, spiritual, and personalized response based on the user's reports. Be encouraging, insightful, and practical. Connect different aspects of their reports when relevant. Keep responses conversational and warm, as if you're a wise spiritual guide.

Response:`;

    const response = await axios.post(API_ENDPOINT, {
      model: GPT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a compassionate spiritual AI guide for Eternal AI. You help users understand their spiritual assessments and provide personalized guidance. Always be encouraging, insightful, and practical. Connect different aspects of their spiritual profile when relevant."
        },
        {
          role: "user",
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

    console.log('[chatWithReports] Response:', response.data);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('[chatWithReports] Error:', error);
    throw new Error('Failed to get AI response');
  }
}

export default {
  validateUserResponse,
  validateQuestionType,
  generateValidationFeedback,
  generateVibrationalReport,
  generateAuraReport,
  generateJyotishReading,
  generateAIQuestion,
  generateExpansionReport,
  parseSections,
  parseReportToCards,
  chatWithReports,
  ETERNAL_AWAKENING_EXPANSION_SUMMARY
};