import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import 'bootstrap/dist/css/bootstrap.min.css';

interface VibrationalReportData {
  frequency: number;
  level: string;
  percentage: number;
  analysis: string;
  recommendations: string[];
  affirmation: string;
}

const VibrationalReport = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<VibrationalReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [gaugeValue, setGaugeValue] = useState(0);

  useEffect(() => {
    const fetchReport = async () => {
      if (currentUser) {
        try {
          const reportRef = doc(db, 'vibrationalReports', currentUser.uid);
          const reportSnap = await getDoc(reportRef);
          
          if (reportSnap.exists()) {
            setReportData(reportSnap.data() as VibrationalReportData);
          }
        } catch (error) {
          console.error('Error fetching vibrational report:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReport();
  }, [currentUser]);

  useEffect(() => {
    if (reportData) {
      const targetValue = Math.min(reportData.frequency, 800);
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepValue = targetValue / steps;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const animate = () => {
        if (currentStep <= steps) {
          const currentValue = Math.min(currentStep * stepValue, targetValue);
          setGaugeValue(currentValue);
          currentStep++;
          if (currentStep <= steps) {
            setTimeout(animate, stepDuration);
          }
        }
      };
      
      setTimeout(animate, 500); // Start animation after 500ms
    }
  }, [reportData]);

  const navigateToPath = (path: string) => {
    navigate(`/chat?path=${path}`);
  };

  const getFrequencyColor = (frequency: number) => {
    if (frequency >= 600) return '#8b5cf6'; // Purple - Enlightened
    if (frequency >= 500) return '#10b981'; // Green - High vibration
    if (frequency >= 400) return '#f59e0b'; // Yellow - Positive
    if (frequency >= 300) return '#f97316'; // Orange - Neutral
    return '#ef4444'; // Red - Lower vibration
  };

  const getFrequencyDescription = (frequency: number) => {
    if (frequency >= 600) return 'Enlightened Consciousness';
    if (frequency >= 500) return 'High Vibrational State';
    if (frequency >= 400) return 'Positive Energy Flow';
    if (frequency >= 300) return 'Balanced Vibration';
    return 'Transformative Phase';
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Loading your vibrational report...</h4>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h4>No Vibrational Report Found</h4>
          <p>Please complete the Vibrational Frequency assessment first.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigateToPath('vibrational')}
          >
            Take Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: 0 }}>
      <style>{`
  .interactive-card {
    transition: transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s, border-color 0.18s;
    will-change: transform, box-shadow, border-color;
    cursor: pointer;
  }
  .interactive-card:hover, .interactive-card:focus, .interactive-card:active {
    transform: scale(1.035);
    box-shadow: 0 8px 32px 0 rgba(75,31,167,0.13), 0 1.5px 8px 0 rgba(160,132,232,0.10);
    border-color: #4b1fa7 !important;
    z-index: 2;
  }
`}</style>
      <div className="container-fluid" style={{ maxWidth: '1200px' }}>
        {/* Header Section with Gauge */}
        <div className="row justify-content-center py-5">
          <div className="col-12 text-center mb-4">
            <div className="text-uppercase fw-bold mb-2" style={{ color: '#a084e8', fontSize: 15, letterSpacing: 1 }}>
              Connect to a Knowledge Base
            </div>
            <h1 className="fw-bold mb-4" style={{ fontSize: 42, color: '#222' }}>
              Your Vibrational Frequency Report
            </h1>
          </div>
          
          {/* Gauge Section */}
          <div className="col-lg-6 d-flex justify-content-center mb-5">
            <div className="bg-white rounded-4 shadow-lg p-5" style={{ background: 'linear-gradient(135deg, #4b1fa7 0%, #8b5cf6 100%)', minWidth: 400 }}>
              <div className="text-center mb-4">
                <h2 className="text-white fw-bold mb-3" style={{ fontSize: 32, letterSpacing: 0.5 }}>
                  Vibrational Frequency
                </h2>
              </div>
              
              {/* Animated Gauge */}
              <div className="bg-white rounded-4 shadow p-4 mb-4">
                <div className="position-relative d-flex flex-column align-items-center">
                  <svg width="280" height="160" viewBox="0 0 280 160">
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="50%" stopColor="#a084e8" />
                        <stop offset="100%" stopColor="#4b1fa7" />
                      </linearGradient>
                      <linearGradient id="gaugeBg" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#e5e7eb" />
                        <stop offset="100%" stopColor="#f3f4f6" />
                      </linearGradient>
                    </defs>
                    {/* Background Arc */}
                    <path
                      d="M 40 140 A 100 100 0 0 1 240 140"
                      stroke="url(#gaugeBg)"
                      strokeWidth="20"
                      fill="none"
                    />
                    {/* Value Arc (animated) */}
                    <path
                      d="M 40 140 A 100 100 0 0 1 240 140"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="20"
                      fill="none"
                      strokeDasharray={`${(gaugeValue / 800) * 314}, 314`}
                      strokeLinecap="round"
                      style={{ 
                        transition: 'stroke-dasharray 0.3s ease-out',
                        filter: 'drop-shadow(0 2px 8px rgba(75, 31, 167, 0.3))'
                      }}
                    />
                    {/* Center Text */}
                    <text x="140" y="110" fontSize="40" textAnchor="middle" fill="#222" fontWeight="bold">
                      {Math.round(gaugeValue)}
                    </text>
                    <text x="140" y="135" fontSize="18" textAnchor="middle" fill="#666">
                      Hz
                    </text>
                  </svg>
                  <div className="mt-3 text-center">
                    <div className="fw-bold mb-2" style={{ fontSize: 24, color: '#4b1fa7' }}>
                      {reportData.level}
                    </div>
                    <div className="text-muted" style={{ fontSize: 16 }}>
                      {getFrequencyDescription(reportData.frequency)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Soul Percentage */}
              <div className="text-center">
                <div className="text-white" style={{ fontSize: 18, opacity: 0.9 }}>
                  Your Soul Percentage
                </div>
                <div className="text-white fw-bold" style={{ fontSize: 36 }}>
                  {reportData.percentage}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Analysis Section */}
            <div className="text-center mb-5">
              <p className="mb-4" style={{ color: '#444', fontSize: 20, maxWidth: 800, margin: '0 auto', lineHeight: 1.6 }}>
                {reportData.analysis}
              </p>
            </div>

            {/* Stats Row */}
            <div className="row mb-5 g-4">
              <div className="col-md-4">
                <div className="text-center p-4 rounded-4 h-100 interactive-card" style={{ background: 'linear-gradient(135deg, #f8f7fa 0%, #ffffff 100%)', border: '2px solid #a084e8' }}>
                  <div className="fw-bold mb-2" style={{ fontSize: 32, color: '#4b1fa7' }}>
                    {reportData.percentage}%
                  </div>
                  <div className="text-muted" style={{ fontSize: 16 }}>
                    Overall Percentage
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center p-4 rounded-4 h-100 interactive-card" style={{ background: 'linear-gradient(135deg, #f8f7fa 0%, #ffffff 100%)', border: '2px solid #a084e8' }}>
                  <div className="fw-bold mb-2" style={{ fontSize: 32, color: '#4b1fa7' }}>
                    {reportData.frequency} Hz
                  </div>
                  <div className="text-muted" style={{ fontSize: 16 }}>
                    Body Frequency
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center p-4 rounded-4 h-100 interactive-card" style={{ background: 'linear-gradient(135deg, #f8f7fa 0%, #ffffff 100%)', border: '2px solid #a084e8' }}>
                  <div className="fw-bold mb-2" style={{ fontSize: 32, color: '#4b1fa7' }}>
                    {reportData.level}
                  </div>
                  <div className="text-muted" style={{ fontSize: 16 }}>
                    Soul Level
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-5">
              <h3 className="fw-bold mb-4 text-center" style={{ color: '#4b1fa7', fontSize: 32 }}>
                Recommendations
              </h3>
              <div className="row g-4">
                {reportData.recommendations.map((rec, index) => (
                  <div key={index} className="col-md-6">
                    <div className="d-flex align-items-start p-4 rounded-4 h-100 interactive-card" style={{ background: 'linear-gradient(135deg, #f8f7fa 0%, #ffffff 100%)', border: '1px solid #e5e7eb' }}>
                      <span className="me-3 d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" 
                            style={{ 
                              width: 40, 
                              height: 40, 
                              background: 'linear-gradient(135deg, #fbbf24 0%, #a084e8 100%)', 
                              color: '#fff', 
                              fontWeight: 700, 
                              fontSize: 18 
                            }}>
                        {index + 1}
                      </span>
                      <span style={{ fontSize: 18, lineHeight: 1.5 }}>
                        {rec}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Affirmation */}
            <div className="mb-5">
              <h3 className="fw-bold mb-4 text-center" style={{ color: '#4b1fa7', fontSize: 32 }}>
                Your Personal Affirmation
              </h3>
              <div className="text-center">
                <blockquote className="blockquote p-4 rounded-4 mx-auto interactive-card" 
                           style={{ 
                             maxWidth: 800,
                             fontSize: 22, 
                             color: '#333', 
                             background: 'linear-gradient(135deg, #f8f7fa 0%, #ffffff 100%)', 
                             border: '3px solid #a084e8',
                             lineHeight: 1.6
                           }}>
                  <i className="fas fa-quote-left me-2" style={{ color: '#a084e8', fontSize: 24 }}></i>
                  {reportData.affirmation}
                  <i className="fas fa-quote-right ms-2" style={{ color: '#a084e8', fontSize: 24 }}></i>
                </blockquote>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="text-center pb-5">
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <button className="btn btn-lg px-5 py-3" 
                        style={{ 
                          background: 'linear-gradient(135deg, #4b1fa7 0%, #8b5cf6 100%)', 
                          border: 'none', 
                          color: 'white',
                          fontWeight: 600,
                          fontSize: 18,
                          borderRadius: 12
                        }} 
                        onClick={() => window.print()}>
                  Download Report
                </button>
                <button className="btn btn-lg px-5 py-3" 
                        style={{ 
                          borderColor: '#4b1fa7', 
                          color: '#4b1fa7', 
                          fontWeight: 600,
                          fontSize: 18,
                          borderRadius: 12,
                          border: '2px solid #4b1fa7'
                        }} 
                        onClick={() => navigate('/onboarding-one')}>
                  Explore Other Paths
                </button>
                <button className="btn btn-lg px-5 py-3" 
                        style={{ 
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                          border: 'none', 
                          color: 'white',
                          fontWeight: 600,
                          fontSize: 18,
                          borderRadius: 12
                        }} 
                        onClick={() => navigate('/report-chat')}>
                  <i className="bi bi-chat-dots me-2"></i>
                  Ask AI About Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VibrationalReport;