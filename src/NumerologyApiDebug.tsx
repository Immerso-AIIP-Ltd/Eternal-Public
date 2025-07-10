import React, { useEffect, useState } from 'react';
import { numerologyApi } from './services/numerologyApi';

const NumerologyApiDebug: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    numerologyApi.getLifePath(1990, 5, 12)
      .then((res) => {
        setResult(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'API error');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2>Numerology API Debug</h2>
      {loading && <p>Loading...</p>}
      {error && <pre style={{ color: 'red' }}>{error}</pre>}
      {result && <pre style={{ background: '#f0f0f0', padding: 16 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
};

export default NumerologyApiDebug; 