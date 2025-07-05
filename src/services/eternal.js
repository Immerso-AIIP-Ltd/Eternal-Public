const axios = require('axios'); // For making HTTP requests
const fs = require('fs');     // For file system operations

async function getVedastroDataAndImage(
    location, time_str, date_str, timezone, ayanamsa,
    image_filename = "south_indian_rasi_d1_chart.svg"
) {
    /**
     * Fetches astrological data from Vedastro APIs, saves the chart image,
     * and formats all text data into a single file for an LLM.
     *
     * Args:
     * location (str): The location (e.g., "Paris").
     * time_str (str): The time in HH:MM format (e.g., "00:12").
     * date_str (str): The date in DD/MM/YYYY format (e.g., "04/02/2025").
     * timezone (str): The timezone offset (e.g., "+01:00").
     * ayanamsa (str): The Ayanamsa system (e.g., "RAMAN").
     * image_filename (str): The name to save the SVG image as.
     *
     * Returns:
     * str: A formatted string containing parsed astrological data, ready for an LLM.
     * Returns null if there's a critical error.
     */

    const base_url = "https://api.vedastro.org/api/Calculate/";
    const all_output_lines = []; // List to collect all text output

    // --- Chart Image ---
    const chart_image_url = (
        `${base_url}SouthIndianChart/Location/${location}/` +
        `Time/${time_str.replace(':', '%3A')}/${date_str.replace(/\//g, '%2F')}/${timezone.replace(':', '%3A').replace('+', '%2B')}/ChartType/RasiD1/Ayanamsa/${ayanamsa}`
    );
    console.log(`Attempting to download chart image from: ${chart_image_url}`);
    try {
        const image_response = await axios.get(chart_image_url, { responseType: 'arraybuffer' });
        if (image_response.headers['content-type'] === 'image/svg+xml') {
            fs.writeFileSync(image_filename, image_response.data);
            const chart_msg = `The South Indian Rasi D1 Chart has been saved as '${image_filename}'.`;
            all_output_lines.push("## Chart Image Status");
            all_output_lines.push(chart_msg);
        } else {
            const chart_msg = `Failed to download chart image. Content type: ${image_response.headers['content-type']}`;
            all_output_lines.push("## Chart Image Status");
            all_output_lines.push(chart_msg);
        }
    } catch (e) {
        const chart_msg = `Error fetching chart image: ${e.message}`;
        all_output_lines.push("## Chart Image Status");
        all_output_lines.push(chart_msg);
    }
    all_output_lines.push(`Chart URL: ${chart_image_url}`);
    all_output_lines.push("-".repeat(30)); // Separator


    // --- House Data ---
    const house_data_url = (
        `${base_url}AllHouseData/HouseName/All/Location/${location}/` +
        `Time/${time_str.replace(':', '%3A')}/${date_str.replace(/\//g, '%2F')}/${timezone.replace(':', '%3A').replace('+', '%2B')}/Ayanamsa/${ayanamsa}`
    );
    console.log(`Fetching House Data from: ${house_data_url}`);
    all_output_lines.push("\n## House Data");
    try {
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
        } else {
            all_output_lines.push(`Failed to retrieve House Data: Status '${house_data.Status || 'Unknown error'}'`);
        }
    } catch (e) {
        all_output_lines.push(`Error fetching House Data: ${e.message}`);
    }
    all_output_lines.push("-".repeat(30)); // Separator


    // --- Planet Data ---
    const planet_data_url = (
        `${base_url}AllPlanetData/PlanetName/All/Location/${location}/` +
        `Time/${time_str.replace(':', '%3A')}/${date_str.replace(/\//g, '%2F')}/${timezone.replace(':', '%3A').replace('+', '%2B')}/Ayanamsa/${ayanamsa}`
    );
    console.log(`Fetching Planet Data from: ${planet_data_url}`);
    all_output_lines.push("\n## Planet Data");
    try {
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
        } else {
            all_output_lines.push(`Failed to retrieve Planet Data: Status '${planet_data.Status || 'Unknown error'}'`);
        }
    } catch (e) {
        all_output_lines.push(`Error fetching Planet Data: ${e.message}`);
    }
    all_output_lines.push("-".repeat(30)); // Separator


    // --- Predictions ---
    const predictions_url = (
        `${base_url}HoroscopePredictions/Location/${location}/` +
        `Time/${time_str.replace(':', '%3A')}/${date_str.replace(/\//g, '%2F')}/${timezone.replace(':', '%3A').replace('+', '%2B')}/Ayanamsa/${ayanamsa}`
    );
    console.log(`Fetching Horoscope Predictions from: ${predictions_url}`);
    all_output_lines.push("\n## Horoscope Predictions");
    try {
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
        } else {
            all_output_lines.push(`Failed to retrieve Horoscope Predictions: Status '${predictions_data.Status || 'Unknown error'}'`);
        }
    } catch (e) {
        all_output_lines.push(`Error fetching Horoscope Predictions: ${e.message}`);
    }
    all_output_lines.push("-".repeat(30)); // Separator


    // --- Save All Text Data to a Variable (do NOT write to file) ---
    const all_data_text = all_output_lines.join("\n");

    console.log(`The chart image has been saved to '${image_filename}'.`);

    // Return the formatted string for LLM, or null if critical error
    if (all_output_lines.length === 0) {
        return "No astrological data could be fetched.";
    }
    return all_data_text;
}

// --- Example Usage ---
async function main() {
    const location = "Paris";
    const time_str = "00:12";
    const date_str = "04/02/2025";
    const timezone = "+01:00";
    const ayanamsa = "RAMAN";

    // Call the modified function
    const formatted_data = await getVedastroDataAndImage(
        location, time_str, date_str, timezone, ayanamsa,
        "south_indian_rasi_d1_chart.svg"
    );

    if (formatted_data) {
        console.log("\n--- Formatted Data for LLM ---");
        // You can now process 'formatted_data' string directly
        // console.log(formatted_data); // Uncomment to print the full formatted data
    }
}

// Run the main function
main();