import React, { useEffect, useState } from 'react';
import { numerologyApi } from './services/numerologyApi';

const sample = {
  year: 1990,
  month: 5,
  day: 12,
  birthdate: '1990-05-12',
  name: 'John Robert Doe',
  initials: 'JRD',
  firstName: 'John',
  middleName: 'Robert',
  lastName: 'Doe',
  phone: '12066852344',
  lat: 37.7749,
  lng: -122.4194,
  tz: 'America/Los_Angeles',
};

const endpoints = [
  { key: 'Life Path', fn: () => numerologyApi.getLifePath(sample.year, sample.month, sample.day) },
  { key: 'Attitude', fn: () => numerologyApi.getAttitudeNumber(sample.day, sample.month) },
  { key: 'Balance', fn: () => numerologyApi.getBalanceNumber(sample.initials) },
  { key: 'Challenge', fn: () => numerologyApi.getChallengeNumber(sample.year, sample.month, sample.day) },
  { key: 'Karmic Debt', fn: () => numerologyApi.getKarmicDebt(sample.year, sample.month, sample.day) },
  { key: 'Karmic Lessons', fn: () => numerologyApi.getKarmicLessons(sample.name) },
  { key: 'Personality', fn: () => numerologyApi.getPersonalityNumber(sample.firstName, sample.middleName, sample.lastName) },
  { key: 'Destiny', fn: () => numerologyApi.getDestinyNumber(sample.firstName, sample.middleName, sample.lastName) },
  { key: 'Heart Desire', fn: () => numerologyApi.getHeartDesire(sample.firstName, sample.middleName, sample.lastName) },
  { key: 'Subconscious', fn: () => numerologyApi.getSubconsciousNumber(sample.name) },
  { key: 'Thought', fn: () => numerologyApi.getThoughtNumber(sample.firstName, sample.day) },
  { key: 'Lucky Numbers', fn: () => numerologyApi.getLuckyNumbers(sample.birthdate, sample.name) },
  { key: 'Period Cycles', fn: () => numerologyApi.getPeriodCycles(sample.year, sample.month, sample.day) },
  { key: 'Lucky Days', fn: () => numerologyApi.getLuckyDaysCalendar(sample.birthdate) },
  { key: 'Birth Chart', fn: () => numerologyApi.getBirthChart({ name: sample.name, year: sample.year, month: sample.month, day: sample.day, hour: 12, minute: 0, lat: sample.lat, lng: sample.lng, tz: sample.tz }) },
  { key: 'Birth Chart SVG', fn: () => numerologyApi.getBirthChartSVG({ name: sample.name, year: sample.year, month: sample.month, day: sample.day, hour: 12, minute: 0, lat: sample.lat, lng: sample.lng, tz: sample.tz }) },
];

const NumerologyApiFullDebug: React.FC = () => {
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all(
      endpoints.map(async ({ key, fn }) => {
        try {
          const res = await fn();
          return { key, res };
        } catch (err: any) {
          return { key, res: { error: err.message || 'API error' } };
        }
      })
    ).then((all) => {
      const out: { [key: string]: any } = {};
      all.forEach(({ key, res }) => {
        out[key] = res;
      });
      setResults(out);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2>Numerology API Full Debug</h2>
      {loading && <p>Loading all endpoints...</p>}
      {!loading && (
        <div>
          {Object.entries(results).map(([key, res]) => (
            <div key={key} style={{ marginBottom: 24 }}>
              <h4>{key}</h4>
              <pre style={{ background: '#f0f0f0', padding: 16, maxHeight: 300, overflow: 'auto' }}>{JSON.stringify(res, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NumerologyApiFullDebug; 