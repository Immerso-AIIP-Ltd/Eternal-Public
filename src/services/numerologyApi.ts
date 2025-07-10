import axios from 'axios';

const BASE_URL = 'https://the-numerology-api.p.rapidapi.com';
const RAPIDAPI_HOST = 'the-numerology-api.p.rapidapi.com';
const RAPIDAPI_KEY = '8c40e6d32emsh0127cfbba73f121p1d8a0ejsnd24c9ea2bfd1';

const headers = {
  'x-rapidapi-host': RAPIDAPI_HOST,
  'x-rapidapi-key': RAPIDAPI_KEY,
};

// Utility: Check API health
export async function checkApiHealth() {
  try {
    const res = await axios.get(BASE_URL + '/life_path', {
      params: { year: 2000, month: 1, day: 1 },
      headers,
    });
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

// Helper for GET requests
async function get(endpoint: string, params: any) {
  try {
    const res = await axios.get(BASE_URL + endpoint, { params, headers });
    return res.data;
  } catch (error: any) {
    console.error(`API error [${endpoint}]:`, error?.response?.data || error.message);
    throw error;
  }
}

// Numerology Endpoints
export const numerologyApi = {
  getLifePath: (year: number, month: number, day: number) => get('/life_path', { year, month, day }),
  getAttitudeNumber: (birth_day: number, birth_month: number) => get('/attitude_number', { birth_day, birth_month }),
  getBalanceNumber: (initials: string) => get('/balance_number', { initials }),
  getChallengeNumber: (birth_year: number, birth_month: number, birth_day: number) => get('/challenge_number', { birth_year, birth_month, birth_day }),
  getKarmicDebt: (year: number, month: number, day: number) => get('/karmic_debt', { year, month, day }),
  getKarmicLessons: (full_name: string) => get('/karmic_lessons', { full_name }),
  getPersonalityNumber: (first_name: string, middle_name: string, last_name: string) =>
    get('/personality_number', {
      first_name,
      middle_name: middle_name && middle_name.trim() !== '' ? middle_name : ' ',
      last_name
    }),
  getDestinyNumber: (first_name: string, middle_name: string, last_name: string) =>
    get('/destiny_number', {
      first_name,
      middle_name: middle_name && middle_name.trim() !== '' ? middle_name : ' ',
      last_name
    }),
  getHeartDesire: (first_name: string, middle_name: string, last_name: string) =>
    get('/heart_desire', {
      first_name,
      middle_name: middle_name && middle_name.trim() !== '' ? middle_name : ' ',
      last_name
    }),
  getSubconsciousNumber: (name: string) => get('/subconscious_number', { name }),
  getThoughtNumber: (first_name: string, birth_day: number) => get('/thought_number', { first_name, birth_day }),
  getLuckyNumbers: (birthdate: string, full_name: string) => get('/lucky_numbers', { birthdate, full_name }),
  getPeriodCycles: (birth_year: number, birth_month: number, birth_day: number) => get('/period_cycles', { birth_year, birth_month, birth_day }),
  getLuckyDaysCalendar: (dob: string, start_date?: string, weeks?: number) => get('/lucky-days-calendar', { dob, start_date, weeks }),
  // Astrology/Birth Chart
  getBirthChart: (params: any) => get('/birth-chart', params),
  getBirthChartSVG: (params: any) => get('/birth-chart/svg', params),
  // Horoscope (example: today, weekly, monthly, etc.)
  getHoroscope: (type: string, params: any) => get(`/horoscope/${type}`, params),
  // Compatibility
  getCompatibility: (type: string, params: any) => get(`/horoscope/compatibility/${type}`, params),
  // Tarot, Gematria, Phone Analyzer, etc. can be added similarly
};

// Usage example (in your components):
// const data = await numerologyApi.getLifePath(1990, 5, 12); 