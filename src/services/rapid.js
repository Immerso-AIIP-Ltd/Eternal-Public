// Updated rapid.js with RapidAPI integration for birth charts
import axios from 'axios';

const RAPIDAPI_KEY = "8c40e6d32emsh0127cfbba73f121p1d8a0ejsnd24c9ea2bfd1";
const BASE_URL = "https://the-numerology-api.p.rapidapi.com";

const headers = {
    "x-rapidapi-key": RAPIDAPI_KEY,
    "x-rapidapi-host": "the-numerology-api.p.rapidapi.com",
    "Content-Type": "application/json"
};

/**
 * Enhanced getBirthChartSvgPost with detailed logging for life prediction reports
 */
export async function getBirthChartSvgPost(params) {
    console.log("=== RapidAPI Birth Chart Request ===");
    console.log("Input params:", JSON.stringify(params, null, 2));
    
    const {
        name,
        year,
        month,
        day,
        hour = 12,
        minute = 0,
        lat = null,
        lng = null,
        city = null,
        country = null,
        tz = "UTC",
        lang = "EN",
        theme = "classic"
    } = params;

    try {
        const url = `${BASE_URL}/birth-chart/svg`;
        
        // Build payload with validation for life prediction
        const payload = {
            name: String(name || "User"),
            year: String(year),
            month: String(month),
            day: String(day),
            hour: String(hour),
            minute: String(minute),
            lang: String(lang),
            theme: String(theme),
            tz: String(tz)
        };
        
        // Add location data if available
        if (lat !== null && lat !== undefined && lat !== '') {
            payload.lat = Number(lat);
        }
        if (lng !== null && lng !== undefined && lng !== '') {
            payload.lng = Number(lng);
        }
        if (city && city !== '') {
            payload.city = String(city);
        }
        if (country && country !== '') {
            payload.country = String(country);
        }

        console.log("Sending payload:", JSON.stringify(payload, null, 2));
        
        const response = await axios.post(url, payload, { 
            headers,
            timeout: 30000
        });
        
        console.log("RapidAPI Response status:", response.status);
        
        if (response.status === 200 && response.data) {
            return {
                success: true,
                svg: response.data,
                source: 'rapidapi'
            };
        } else {
            throw new Error(`Unexpected response status: ${response.status}`);
        }
        
    } catch (error) {
        console.error('RapidAPI Error:', error.message);
        console.error('Error response:', error.response?.data);
        
        return {
            success: false,
            error: error.message,
            source: 'rapidapi'
        };
    }
}

/**
 * Get Indian astrology charts from existing system (placeholder for your existing functions)
 */
export async function getIndianAstrologyCharts(birthData) {
    try {
        // This should call your existing Vedastro or Indian astrology API
        // For now, returning placeholder - replace with your actual functions
        
        console.log("Fetching Indian astrology charts for:", birthData);
        
        // Replace these with your actual API calls
        const rasiChart = await getVedastroChart(birthData, 'rasi');
        const navamshaChart = await getVedastroChart(birthData, 'navamsha');
        
        return {
            success: true,
            charts: {
                rasiChart,
                navamshaChart
            },
            source: 'indian'
        };
        
    } catch (error) {
        console.error('Indian astrology charts error:', error.message);
        return {
            success: false,
            error: error.message,
            source: 'indian'
        };
    }
}

/**
 * Placeholder for your existing Vedastro chart function
 * Replace this with your actual implementation
 */
async function getVedastroChart(birthData, chartType) {
    // Replace with your actual Vedastro API call
    console.log(`Getting ${chartType} chart from Vedastro...`);
    
    // This is a placeholder - implement your actual Vedastro API call here
    return `<svg><!-- ${chartType} chart SVG data --></svg>`;
}

/**
 * Master function to get all 3 charts for life prediction report
 */
export async function getAllChartsForLifePrediction(userData) {
    console.log("=== Getting All Charts for Life Prediction ===");
    const { birthData, birthPlace, lat, lng } = userData;
    // Parse birth data
    let year, month, day;
    if (birthData.dob.includes('-')) {
        // Format: YYYY-MM-DD
        [year, month, day] = birthData.dob.split('-').map(Number);
    } else if (birthData.dob.includes('/')) {
        // Format: DD/MM/YYYY
        [day, month, year] = birthData.dob.split('/').map(Number);
    }
    const [hour, minute] = birthData.tob.split(':').map(Number);
    // Validate date
    if (
        typeof year !== 'number' || isNaN(year) ||
        typeof month !== 'number' || isNaN(month) ||
        typeof day !== 'number' || isNaN(day)
    ) {
        throw new Error('Invalid date of birth format in birthData.dob: ' + birthData.dob);
    }
    // Extract city and country from birthPlace if possible
    const locationParts = birthPlace.split(',').map(s => s.trim());
    let city = locationParts[0] || '';
    let country = locationParts[locationParts.length - 1] || '';
    // Map country/city to valid values for API
    if (city.toLowerCase() === 'chennai') {
        country = 'IN';
    }
    // Use a valid timezone string for Chennai/India
    let tz = 'UTC';
    if (city.toLowerCase() === 'chennai' || country === 'IN' || country.toLowerCase() === 'india') {
        tz = 'Asia/Kolkata';
    }
    // Capitalize city
    city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    const chartParams = {
        name: "Life Prediction Chart",
        year,
        month,
        day,
        hour,
        minute,
        lat,
        lng,
        city,
        country,
        tz,
        lang: 'EN',
        theme: 'classic'
    };
    // Get all charts concurrently
    const [rapidChart, indianCharts] = await Promise.all([
        getBirthChartSvgPost(chartParams),
        getIndianAstrologyCharts(birthData)
    ]);
    return {
        rapidApi: rapidChart,
        indian: indianCharts,
        metadata: {
            birthPlace,
            coordinates: { lat, lng },
            timestamp: new Date().toISOString()
        }
    };
}

/**
 * Test function for multiple scenarios
 */
export async function testRapidApiIntegration() {
    console.log("🧪 Testing RapidAPI Integration...\n");
    
    // Test with minimal data
    const testData1 = {
        name: "Test User",
        year: 1990,
        month: 7,
        day: 16,
        hour: 12,
        minute: 0
    };
    
    console.log("Test 1: Minimal data");
    const result1 = await getBirthChartSvgPost(testData1);
    console.log("Result 1:", result1.success ? "SUCCESS" : "FAILED", result1.error || "");
    
    // Test with full location data
    const testData2 = {
        name: "Test User",
        year: 1990,
        month: 7,
        day: 16,
        hour: 12,
        minute: 0,
        lat: 28.6139,
        lng: 77.2090,
        city: "New Delhi",
        country: "IN",
        tz: "Asia/Kolkata"
    };
    
    console.log("Test 2: Full location data");
    const result2 = await getBirthChartSvgPost(testData2);
    console.log("Result 2:", result2.success ? "SUCCESS" : "FAILED", result2.error || "");
    
    return { test1: result1, test2: result2 };
}

// Export all functions
export default {
    getBirthChartSvgPost,
    getIndianAstrologyCharts,
    getAllChartsForLifePrediction,
    testRapidApiIntegration
};