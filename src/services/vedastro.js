// src/services/vedastro.js
import axios from 'axios';

const VEDASTRO_API_KEY = "Ob6NPD2tAC"; // Your API key
const BASE_URL = "https://api.vedastro.org/api/Calculate/";

/**
 * Fetches complete astrological data from Vedastro APIs
 * @param {Object} birthData - { location, dob, tob, timezone }
 * @returns {Promise<Object>} - Formatted astrological data for LLM and chart images
 */
export async function getVedastroDataAndImage(birthData) {
    const { location, dob, tob, timezone } = birthData;
    const ayanamsa = "RAMAN"; // Static as per requirements
    
    const all_output_lines = [];
    
    const encoded_time = tob.replace(':', '%3A');
    const encoded_date = dob.replace(/\//g, '%2F');
    const encoded_timezone = timezone.replace(':', '%3A').replace('+', '%2B');

    try {
        // --- Rasi D1 Chart Image ---
        const rasi_chart_url = (
            `${BASE_URL}SouthIndianChart/Location/${location}/` +
            `Time/${encoded_time}/${encoded_date}/${encoded_timezone}/ChartType/RasiD1/Ayanamsa/${ayanamsa}`
        );
        
        all_output_lines.push("## Chart Image Status (Rasi D1)");
        all_output_lines.push(`Rasi D1 Chart URL: ${rasi_chart_url}`);
        all_output_lines.push("-".repeat(30));

        // --- Navamsha D9 Chart Image ---
        const navamsha_chart_url = (
            `${BASE_URL}SouthIndianChart/Location/${location}/` +
            `Time/${encoded_time}/${encoded_date}/${encoded_timezone}/ChartType/NavamshaD9/Ayanamsa/${ayanamsa}`
        );
        
        all_output_lines.push("## Chart Image Status (Navamsha D9)");
        all_output_lines.push(`Navamsha D9 Chart URL: ${navamsha_chart_url}`);
        all_output_lines.push("-".repeat(30));

        // --- House Data ---
        const house_data_url = (
            `${BASE_URL}AllHouseData/HouseName/All/Location/${location}/` +
            `Time/${encoded_time}/${encoded_date}/${encoded_timezone}/Ayanamsa/${ayanamsa}`
        );
        
        console.log(`Fetching House Data from: ${house_data_url}`);
        all_output_lines.push("\n## House Data");
        
        const house_response = await axios.get(house_data_url);
        const house_data = house_response.data;
        
        if (house_data.Status === "Pass" && house_data.Payload) {
            for (const house_info of house_data.Payload.AllHouseData) {
                for (const house_name in house_info) {
                    const details = house_info[house_name];
                    all_output_lines.push(`**${house_name}**: (URL: ${house_data_url})`);
                    all_output_lines.push(`   - Sign: ${details.HouseRasiSign?.Name || 'N/A'}`);
                    all_output_lines.push(`   - Constellation: ${details.HouseConstellation || 'N/A'} (Lord: ${details.HouseConstellationLord?.Name || 'N/A'})`);
                    all_output_lines.push(`   - Lord of House: ${details.LordOfHouse?.Name || 'N/A'}`);
                    all_output_lines.push(`   - Planets In House: ${details.PlanetsInHouse && details.PlanetsInHouse.length > 0 ? details.PlanetsInHouse.join(', ') : 'None'}`);
                    all_output_lines.push(`   - Planets Aspecting House: ${details.PlanetsAspectingHouse && details.PlanetsAspectingHouse.length > 0 ? details.PlanetsAspectingHouse.join(', ') : 'None'}`);
                    all_output_lines.push(`   - House Strength: ${details.HouseStrength || 'N/A'} (${details.HouseStrengthCategory || 'N/A'})`);
                    all_output_lines.push("");
                }
            }
        }
        all_output_lines.push("-".repeat(30));

        // --- Planet Data ---
        const planet_data_url = (
            `${BASE_URL}AllPlanetData/PlanetName/All/Location/${location}/` +
            `Time/${encoded_time}/${encoded_date}/${encoded_timezone}/Ayanamsa/${ayanamsa}`
        );
        
        console.log(`Fetching Planet Data from: ${planet_data_url}`);
        all_output_lines.push("\n## Planet Data");
        
        const planet_response = await axios.get(planet_data_url);
        const planet_data = planet_response.data;
        
        if (planet_data.Status === "Pass" && planet_data.Payload) {
            for (const planet_info of planet_data.Payload.AllPlanetData) {
                for (const planet_name in planet_info) {
                    const details = planet_info[planet_name];
                    all_output_lines.push(`**${planet_name}**: (URL: ${planet_data_url})`);
                    all_output_lines.push(`   - Occupies House: ${details.HousePlanetOccupiesBasedOnSign || 'N/A'}`);
                    all_output_lines.push(`   - Zodiac Sign: ${details.PlanetRasiD1Sign?.Name || 'N/A'}`);
                    all_output_lines.push(`   - Constellation: ${details.PlanetConstellation || 'N/A'} (Lord: ${details.PlanetLordOfConstellation?.Name || 'N/A'})`);
                    all_output_lines.push(`   - Avasta (State): ${details.PlanetAvasta || 'N/A'}`);
                    all_output_lines.push(`   - Is Benefic: ${details.IsPlanetBenefic || 'N/A'}`);
                    all_output_lines.push(`   - Is Malefic: ${details.IsPlanetMalefic || 'N/A'}`);
                    all_output_lines.push(`   - Planets in Conjunction: ${details.PlanetsInConjunction && details.PlanetsInConjunction.length > 0 ? details.PlanetsInConjunction.join(', ') : 'None'}`);
                    all_output_lines.push(`   - Planets Aspecting: ${details.PlanetsAspectingPlanet && details.PlanetsAspectingPlanet.length > 0 ? details.PlanetsAspectingPlanet.join(', ') : 'None'}`);
                    all_output_lines.push(`   - Dasa Effects (Ishta Kashta): ${details.PlanetDasaEffectsBasedOnIshtaKashta || 'N/A'}`);
                    all_output_lines.push("");
                }
            }
        }
        all_output_lines.push("-".repeat(30));

        // --- Horoscope Predictions ---
        const predictions_url = (
            `${BASE_URL}HoroscopePredictions/Location/${location}/` +
            `Time/${encoded_time}/${encoded_date}/${encoded_timezone}/Ayanamsa/${ayanamsa}`
        );
        
        console.log(`Fetching Horoscope Predictions from: ${predictions_url}`);
        all_output_lines.push("\n## Horoscope Predictions");
        
        const predictions_response = await axios.get(predictions_url);
        const predictions_data = predictions_response.data;
        
        if (predictions_data.Status === "Pass" && predictions_data.Payload) {
            for (const prediction of predictions_data.Payload) {
                all_output_lines.push(`**Yoga**: ${prediction.Name || 'N/A'}`);
                all_output_lines.push(`   - Description: ${prediction.Description || 'N/A'}`);
                if (prediction.RelatedBody) {
                    const related_planets = prediction.RelatedBody.Planets?.filter(p => p).join(', ') || 'None';
                    const related_houses = prediction.RelatedBody.Houses?.filter(h => h).join(', ') || 'None';
                    all_output_lines.push(`   - Related Planets: ${related_planets}`);
                    all_output_lines.push(`   - Related Houses: ${related_houses}`);
                }
                all_output_lines.push(`   - Tags: ${prediction.Tags?.join(', ') || ''}`);
                all_output_lines.push("");
            }
        }
        all_output_lines.push("-".repeat(30));

        // --- Current Dasha Period ---
        const dasha_url = (
            `${BASE_URL}CurrentDasha/Location/${location}/` +
            `Time/${encoded_time}/${encoded_date}/${encoded_timezone}/Ayanamsa/${ayanamsa}`
        );
        
        console.log(`Fetching Current Dasha from: ${dasha_url}`);
        all_output_lines.push("\n## Current Dasha Period");
        
        try {
            const dasha_response = await axios.get(dasha_url);
            const dasha_data = dasha_response.data;
            
            if (dasha_data.Status === "Pass" && dasha_data.Payload) {
                all_output_lines.push(`**Current Mahadasha**: ${dasha_data.Payload.PlanetName || 'N/A'}`);
                all_output_lines.push(`   - Period: ${dasha_data.Payload.StartTime || 'N/A'} to ${dasha_data.Payload.EndTime || 'N/A'}`);
                all_output_lines.push(`   - Years Remaining: ${dasha_data.Payload.YearsLeft || 'N/A'}`);
            }
        } catch (error) {
            all_output_lines.push("Dasha information not available");
        }
        all_output_lines.push("-".repeat(30));

        const all_data_text = all_output_lines.join("\n");
        
        return {
            astrologyData: all_data_text,
            chartImages: {
                rasiChart: rasi_chart_url,
                navamshaChart: navamsha_chart_url
            }
        };

    } catch (error) {
        console.error('Error fetching Vedastro data:', error);
        return {
            astrologyData: `Error fetching astrological data: ${error.message}`,
            chartImages: {
                rasiChart: null,
                navamshaChart: null
            }
        };
    }
}

/**
 * Generates Jyotish reading using GPT and astrology data
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
        // Import the GPT service dynamically to avoid circular dependencies
        const { generateJyotishReading } = await import('./gpt.js');
        return await generateJyotishReading({ astrologyData, userResponses, birthData });
    } catch (error) {
        console.error('Error generating Jyotish reading:', error);
        return `## Key Planetary Influences

Your birth chart reveals a unique cosmic signature with significant planetary influences shaping your life path. The positioning of your ascendant lord suggests a strong foundation for personal growth and spiritual development.

Based on your birth details (${birthData.dob} at ${birthData.tob} in ${birthData.location}), the cosmic energies present at your birth continue to influence your current journey.

## Current Karmic Challenges

Your stated challenge regarding "${userResponses.challenge}" is deeply connected to your karmic patterns. This challenge represents an opportunity for soul growth and spiritual evolution. The planetary positions suggest that working with patience and spiritual practices will help you transform this challenge into wisdom.

The cosmic energies are guiding you toward greater self-awareness in the area of ${userResponses.lifeArea}, which appears to be a key focus for your spiritual development at this time.

## Current Cosmic Phase

You are currently in a transformative period that supports deep inner work and spiritual awakening. This is an excellent time for meditation, self-reflection, and connecting with your higher purpose. The current planetary influences favor personal growth and development in your area of focus.

The universe is aligning to support your journey of self-discovery and spiritual evolution. Trust in the process and remain open to the lessons that are presenting themselves to you.

*This reading is based on the ancient wisdom of Vedic astrology. For a more detailed analysis, a comprehensive consultation would provide deeper insights into your unique birth chart.*`;
    }
}

export default {
    getVedastroDataAndImage,
    generateJyotishReading
};