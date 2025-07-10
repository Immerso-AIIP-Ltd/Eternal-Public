// Test runner for RapidAPI debugging
import { 
    getBirthChartSvgPostDebug, 
    getBirthChartSvgGetDebug, 
    testMultipleScenarios 
} from './rapidapi_debug.js';

async function runComprehensiveTest() {
    console.log("🚀 Starting comprehensive RapidAPI test...\n");
    
    // Test the multiple scenarios function
    await testMultipleScenarios();
    
    console.log("\n" + "=".repeat(60));
    console.log("🔄 Testing GET vs POST comparison...");
    console.log("=".repeat(60) + "\n");
    
    const testParams = {
        name: "Test User",
        year: 1990,
        month: 7,
        day: 16,
        hour: 12,
        minute: 0,
        city: "Paris",
        country: "FR",
        tz: "Europe/Paris"
    };
    
    console.log("Testing GET method...");
    const getResult = await getBirthChartSvgGetDebug(testParams);
    console.log("GET Result:", getResult.slice ? getResult.slice(0, 100) + "..." : getResult);
    
    console.log("\nTesting POST method...");
    const postResult = await getBirthChartSvgPostDebug(testParams);
    console.log("POST Result:", postResult.slice ? postResult.slice(0, 100) + "..." : postResult);
    
    console.log("\n✅ Test completed!");
}

// Alternative payload formats to try
export async function tryAlternativeFormats() {
    console.log("🔧 Trying alternative payload formats...\n");
    
    const baseUrl = "https://the-numerology-api.p.rapidapi.com/birth-chart/svg";
    const headers = {
        "x-rapidapi-key": "8c40e6d32emsh0127cfbba73f121p1d8a0ejsnd24c9ea2bfd1",
        "x-rapidapi-host": "the-numerology-api.p.rapidapi.com",
        'Content-Type': 'application/json'
    };
    
    // Format 1: Numbers as numbers, not strings
    console.log("FORMAT 1: Numbers as actual numbers");
    const payload1 = {
        name: "John Doe",
        year: 1990,
        month: 7,
        day: 16,
        hour: 12,
        minute: 0,
        city: "Paris",
        country: "FR",
        tz: "Europe/Paris",
        lang: "EN",
        theme: "classic"
    };
    
    try {
        const response1 = await fetch(baseUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload1)
        });
        const result1 = await response1.text();
        console.log("Format 1 status:", response1.status);
        console.log("Format 1 result:", result1.slice(0, 200) + "...");
    } catch (error) {
        console.log("Format 1 error:", error.message);
    }
    
    console.log("\n" + "-".repeat(40) + "\n");
    
    // Format 2: All strings (your current approach)
    console.log("FORMAT 2: All values as strings");
    const payload2 = {
        name: "John Doe",
        year: "1990",
        month: "7", 
        day: "16",
        hour: "12",
        minute: "0",
        city: "Paris",
        country: "FR",
        tz: "Europe/Paris",
        lang: "EN",
        theme: "classic"
    };
    
    try {
        const response2 = await fetch(baseUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload2)
        });
        const result2 = await response2.text();
        console.log("Format 2 status:", response2.status);
        console.log("Format 2 result:", result2.slice(0, 200) + "...");
    } catch (error) {
        console.log("Format 2 error:", error.message);
    }
    
    console.log("\n" + "-".repeat(40) + "\n");
    
    // Format 3: With coordinates as numbers
    console.log("FORMAT 3: With coordinates as numbers");
    const payload3 = {
        name: "John Doe",
        year: 1990,
        month: 7,
        day: 16,
        hour: 12,
        minute: 0,
        lat: 48.8566,
        lng: 2.3522,
        tz: "Europe/Paris",
        lang: "EN",
        theme: "classic"
    };
    
    try {
        const response3 = await fetch(baseUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload3)
        });
        const result3 = await response3.text();
        console.log("Format 3 status:", response3.status);
        console.log("Format 3 result:", result3.slice(0, 200) + "...");
    } catch (error) {
        console.log("Format 3 error:", error.message);
    }
    
    console.log("\n" + "-".repeat(40) + "\n");
    
    // Format 4: Minimal payload
    console.log("FORMAT 4: Minimal required fields only");
    const payload4 = {
        name: "John Doe",
        year: 1990,
        month: 7,
        day: 16
    };
    
    try {
        const response4 = await fetch(baseUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload4)
        });
        const result4 = await response4.text();
        console.log("Format 4 status:", response4.status);
        console.log("Format 4 result:", result4.slice(0, 200) + "...");
    } catch (error) {
        console.log("Format 4 error:", error.message);
    }
}

// Run the test
runComprehensiveTest().then(() => {
    console.log("\n" + "=".repeat(60));
    console.log("Running alternative format tests...");
    console.log("=".repeat(60));
    return tryAlternativeFormats();
}).catch(error => {
    console.error("Test failed:", error);
});