import React, { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { useAuth } from './context/AuthContext';

// OpenAI API configuration - Use environment variable for security
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface LifePredictionGeneratorProps {
  userId?: string;
}

interface LifePredictionReport {
  overview: string;
  personality: {
    strengths: string[];
    challenges: string[];
    traits: string;
  };
  lifeJourney: {
    past: string;
    present: string;
    future: string;
  };
  career: {
    suitable_fields: string[];
    peak_periods: string;
    advice: string;
  };
  relationships: {
    compatibility: string;
    marriage_timing: string;
    advice: string;
  };
  health: {
    areas_of_attention: string[];
    favorable_periods: string;
    recommendations: string;
  };
  spirituality: {
    path: string;
    practices: string[];
    growth_areas: string;
  };
  lucky_elements: {
    numbers: number[];
    colors: string[];
    days: string[];
    gemstones: string[];
  };
  yearly_predictions: {
    [year: string]: string;
  };
  advice: string;
}

const LifePredictionGenerator: React.FC<LifePredictionGeneratorProps> = ({ userId }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<LifePredictionReport | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');

  const generateLifePrediction = async () => {
    const targetUserId = userId || currentUser?.uid;
    if (!targetUserId) {
      setError('No user ID available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch user's karmic report data from Firebase
      const karmicReportDoc = await getDoc(doc(db, 'karmicReports', targetUserId));
      
      if (!karmicReportDoc.exists()) {
        throw new Error('No karmic report found. Please complete the Life Predictor assessment first.');
      }

      const karmicData = karmicReportDoc.data();
      
      // Extract birth data
      const birthData = karmicData.birthData || {};
      const birthPlace = karmicData.birthPlace || 'Unknown';
      const lifeArea = karmicData.lifeArea || 'General';
      const challenge = karmicData.challenge || 'Unknown';
      
      // Extract API results
      const vedastroData = karmicData.vedicApi || {};
      const numerologyData = karmicData.rapidApi || {};

      // Create a comprehensive prompt for GPT-4
      const prompt = `You are an expert astrologer and numerologist. Generate a comprehensive life prediction report based on the following data:

BIRTH DETAILS:
- Date of Birth: ${birthData.dob}
- Time of Birth: ${birthData.tob}
- Place of Birth: ${birthPlace}
- Timezone: ${birthData.timezone}
- Area of Life Focus: ${lifeArea}
- Current Challenge: ${challenge}

VEDIC ASTROLOGY DATA:
${JSON.stringify(vedastroData, null, 2)}

NUMEROLOGY DATA:
${JSON.stringify(numerologyData, null, 2)}

Please provide a detailed life prediction report in the following JSON format:
{
  "overview": "A comprehensive 2-3 paragraph overview of the person's life path and destiny",
  "personality": {
    "strengths": ["strength1", "strength2", "strength3"],
    "challenges": ["challenge1", "challenge2", "challenge3"],
    "traits": "Detailed personality analysis based on planetary positions and numbers"
  },
  "lifeJourney": {
    "past": "Analysis of past life karma and early life influences",
    "present": "Current life phase and immediate opportunities",
    "future": "Future trajectory and potential outcomes"
  },
  "career": {
    "suitable_fields": ["field1", "field2", "field3"],
    "peak_periods": "Best periods for career growth",
    "advice": "Specific career guidance"
  },
  "relationships": {
    "compatibility": "Relationship patterns and ideal partner traits",
    "marriage_timing": "Favorable periods for marriage/commitment",
    "advice": "Relationship guidance"
  },
  "health": {
    "areas_of_attention": ["area1", "area2"],
    "favorable_periods": "Best periods for health",
    "recommendations": "Health maintenance advice"
  },
  "spirituality": {
    "path": "Spiritual inclinations and path",
    "practices": ["practice1", "practice2"],
    "growth_areas": "Areas for spiritual development"
  },
  "lucky_elements": {
    "numbers": [1, 2, 3],
    "colors": ["color1", "color2"],
    "days": ["day1", "day2"],
    "gemstones": ["stone1", "stone2"]
  },
  "yearly_predictions": {
    "2025": "Prediction for 2025",
    "2026": "Prediction for 2026",
    "2027": "Prediction for 2027"
  },
  "advice": "Overall life advice and guidance for fulfilling destiny"
}

Be specific, insightful, and provide actionable guidance. Base your predictions on the actual planetary positions and numerological calculations provided.`;

      // Call OpenAI API
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert astrologer and numerologist with deep knowledge of both Vedic and Western systems. Provide accurate, insightful, and helpful life predictions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate prediction');
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      // Store raw response
      setRawResponse(generatedContent);
      
      // Parse the JSON response
      try {
        const parsedReport = JSON.parse(generatedContent) as LifePredictionReport;
        setReport(parsedReport);
      } catch (parseError) {
        console.error('Error parsing GPT response:', parseError);
        setError('Failed to parse the prediction report. The raw response is available below.');
      }

    } catch (err) {
      console.error('Error generating life prediction:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderReport = () => {
    if (!report) return null;

    return (
      <div className="life-prediction-report">
        <div className="mb-5">
          <h2 className="text-primary mb-3">Life Prediction Overview</h2>
          <p className="lead">{report.overview}</p>
        </div>

        <div className="row g-4">
          {/* Personality Analysis */}
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Personality Analysis</h4>
              </div>
              <div className="card-body">
                <h6 className="text-success">Strengths:</h6>
                <ul>
                  {report.personality.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
                <h6 className="text-warning">Challenges:</h6>
                <ul>
                  {report.personality.challenges.map((challenge, idx) => (
                    <li key={idx}>{challenge}</li>
                  ))}
                </ul>
                <p className="mt-3">{report.personality.traits}</p>
              </div>
            </div>
          </div>

          {/* Life Journey */}
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-info text-white">
                <h4 className="mb-0">Life Journey</h4>
              </div>
              <div className="card-body">
                <h6>Past:</h6>
                <p>{report.lifeJourney.past}</p>
                <h6>Present:</h6>
                <p>{report.lifeJourney.present}</p>
                <h6>Future:</h6>
                <p>{report.lifeJourney.future}</p>
              </div>
            </div>
          </div>

          {/* Career */}
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-success text-white">
                <h4 className="mb-0">Career & Success</h4>
              </div>
              <div className="card-body">
                <h6>Suitable Fields:</h6>
                <ul>
                  {report.career.suitable_fields.map((field, idx) => (
                    <li key={idx}>{field}</li>
                  ))}
                </ul>
                <h6>Peak Periods:</h6>
                <p>{report.career.peak_periods}</p>
                <h6>Advice:</h6>
                <p>{report.career.advice}</p>
              </div>
            </div>
          </div>

          {/* Relationships */}
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-danger text-white">
                <h4 className="mb-0">Relationships & Love</h4>
              </div>
              <div className="card-body">
                <h6>Compatibility:</h6>
                <p>{report.relationships.compatibility}</p>
                <h6>Marriage Timing:</h6>
                <p>{report.relationships.marriage_timing}</p>
                <h6>Advice:</h6>
                <p>{report.relationships.advice}</p>
              </div>
            </div>
          </div>

          {/* Health */}
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-warning text-dark">
                <h4 className="mb-0">Health & Wellness</h4>
              </div>
              <div className="card-body">
                <h6>Areas of Attention:</h6>
                <ul>
                  {report.health.areas_of_attention.map((area, idx) => (
                    <li key={idx}>{area}</li>
                  ))}
                </ul>
                <h6>Favorable Periods:</h6>
                <p>{report.health.favorable_periods}</p>
                <h6>Recommendations:</h6>
                <p>{report.health.recommendations}</p>
              </div>
            </div>
          </div>

          {/* Spirituality */}
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-purple text-white">
                <h4 className="mb-0">Spiritual Growth</h4>
              </div>
              <div className="card-body">
                <h6>Path:</h6>
                <p>{report.spirituality.path}</p>
                <h6>Recommended Practices:</h6>
                <ul>
                  {report.spirituality.practices.map((practice, idx) => (
                    <li key={idx}>{practice}</li>
                  ))}
                </ul>
                <h6>Growth Areas:</h6>
                <p>{report.spirituality.growth_areas}</p>
              </div>
            </div>
          </div>

          {/* Lucky Elements */}
          <div className="col-md-12">
            <div className="card shadow-sm">
              <div className="card-header bg-dark text-white">
                <h4 className="mb-0">Lucky Elements</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <h6>Lucky Numbers:</h6>
                    <p>{report.lucky_elements.numbers.join(', ')}</p>
                  </div>
                  <div className="col-md-3">
                    <h6>Lucky Colors:</h6>
                    <p>{report.lucky_elements.colors.join(', ')}</p>
                  </div>
                  <div className="col-md-3">
                    <h6>Lucky Days:</h6>
                    <p>{report.lucky_elements.days.join(', ')}</p>
                  </div>
                  <div className="col-md-3">
                    <h6>Lucky Gemstones:</h6>
                    <p>{report.lucky_elements.gemstones.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Yearly Predictions */}
          <div className="col-md-12">
            <div className="card shadow-sm">
              <div className="card-header bg-secondary text-white">
                <h4 className="mb-0">Yearly Predictions</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  {Object.entries(report.yearly_predictions).map(([year, prediction]) => (
                    <div key={year} className="col-md-4 mb-3">
                      <h6>{year}:</h6>
                      <p>{prediction}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Overall Advice */}
          <div className="col-md-12">
            <div className="card shadow-sm border-primary">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Divine Guidance</h4>
              </div>
              <div className="card-body">
                <p className="lead mb-0">{report.advice}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">AI-Powered Life Prediction</h1>
        <p className="lead text-muted">
          Generate a comprehensive life prediction using GPT-4 based on your Vedic astrology and numerology data
        </p>
      </div>

      {!report && !rawResponse && (
        <div className="text-center">
          <button
            className="btn btn-primary btn-lg px-5 py-3"
            onClick={generateLifePrediction}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Generating Your Life Prediction...
              </>
            ) : (
              <>
                <i className="bi bi-stars me-2"></i>
                Generate Life Prediction
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-4" role="alert">
          <h5 className="alert-heading">Error</h5>
          <p>{error}</p>
        </div>
      )}

      {report && renderReport()}

      {!report && rawResponse && (
        <div className="mt-5">
          <h3>Raw AI Response:</h3>
          <div className="bg-light p-4 rounded">
            <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
              {rawResponse}
            </pre>
          </div>
        </div>
      )}

      {(report || rawResponse) && (
        <div className="text-center mt-5">
          <button
            className="btn btn-secondary me-3"
            onClick={() => {
              setReport(null);
              setRawResponse('');
              setError(null);
            }}
          >
            Clear Report
          </button>
          <button
            className="btn btn-primary"
            onClick={generateLifePrediction}
            disabled={loading}
          >
            Regenerate Report
          </button>
        </div>
      )}

      <style>{`
        .bg-purple {
          background-color: #6f42c1 !important;
        }
      `}</style>
    </div>
  );
};

export default LifePredictionGenerator; 