import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap Icons CSS

interface AuraReportData {
  primaryColor: string;
  secondaryColors: string[];
  auraScore: number;
  personalityTraits: string;
  emotionalEnergy: string;
  strengths: string;
  areasForGrowth: string;
  affirmation: string;
  colorMeanings: {
    primary: string;
    secondary: string;
  };
}

const AuraReport = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<AuraReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [gaugeAnimated, setGaugeAnimated] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);


  useEffect(() => {
    const fetchReport = async () => {
      if (currentUser) {
        try {
          const reportRef = doc(db, 'auraReports', currentUser.uid);
          const reportSnap = await getDoc(reportRef);
          
          if (reportSnap.exists()) {
            setReportData(reportSnap.data() as AuraReportData);
            setGaugeAnimated(true); // Trigger gauge animation
          }
        } catch (error) {
          console.error('Error fetching aura report:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // If no current user, stop loading and show no report found
      }
    };

    fetchReport();
  }, [currentUser]);

  // Effect for animating the gauge score
  useEffect(() => {
    if (gaugeAnimated && reportData) {
      let start = 0;
      const end = reportData.auraScore;
      const duration = 1500; // milliseconds
      const increment = end / (duration / 16); // ~60 frames per second

      const animate = () => {
        start += increment;
        if (start < end) {
          setAnimatedScore(Math.ceil(start));
          requestAnimationFrame(animate);
        } else {
          setAnimatedScore(end);
        }
      };
      const timeoutId = setTimeout(() => { // Add a slight delay before animation starts
        requestAnimationFrame(animate);
      }, 500); // 500ms delay

      return () => clearTimeout(timeoutId); // Cleanup timeout
    }
  }, [gaugeAnimated, reportData]);


  const navigateToPath = (path: string) => {
    navigate(`/chat?path=${path}`);
  };

  const getColorHex = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      'Red': '#dc3545',
      'Orange': '#fd7e14',
      'Yellow': '#ffc107',
      'Green': '#198754',
      'Blue': '#0d6efd',
      'Indigo': '#6610f2',
      'Violet': '#6f42c1',
      'Purple': '#6f42c1',
      'White': '#f8f9fa',
      'Gold': '#ffd700',
      'Pink': '#e91e63',
      'Turquoise': '#17a2b8',
      'Silver': '#adb5bd' // Changed white to a subtle grey for better contrast
    };
    return colorMap[colorName] || '#6c757d'; // Default to a neutral grey
  };

  const renderAuraVisualization = () => {
    if (!reportData) return null;

    const primaryColor = getColorHex(reportData.primaryColor);
    const secondaryColor1 = reportData.secondaryColors[0] ? getColorHex(reportData.secondaryColors[0]) : primaryColor;
    const secondaryColor2 = reportData.secondaryColors[1] ? getColorHex(reportData.secondaryColors[1]) : secondaryColor1;

    return (
      <div className="position-relative d-flex justify-content-center mb-4">
        <svg width="300" height="300" viewBox="0 0 300 300">
          <defs>
            <radialGradient id="auraGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.95" /> {/* Slightly less opaque center */}
              <stop offset="30%" stopColor={secondaryColor1} stopOpacity="0.7" />
              <stop offset="60%" stopColor={secondaryColor2} stopOpacity="0.4" />
              <stop offset="90%" stopColor={primaryColor} stopOpacity="0.15" /> {/* More transparent edge */}
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0" /> {/* Fully transparent at very edge */}
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="5" result="coloredBlur"/> {/* Increased blur */}
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Animated waves from center - ONLY these are visible now */}
          <circle cx="150" cy="150" r="0" fill="none" stroke={primaryColor} strokeWidth="3" className="aura-wave-1" /> {/* Thicker waves */}
          <circle cx="150" cy="150" r="0" fill="none" stroke={secondaryColor1} strokeWidth="3" className="aura-wave-2" /> {/* Thicker waves */}
          <circle cx="150" cy="150" r="0" fill="none" stroke={secondaryColor2} strokeWidth="3" className="aura-wave-3" /> {/* Thicker waves */}
          
          {/* Main aura field */}
          <circle cx="150" cy="150" r="80" fill="url(#auraGradient)" filter="url(#glow)" />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center p-4 rounded shadow-sm bg-white">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-muted">Revealing your aura colors...</h4>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center p-5 rounded shadow-lg bg-white">
          <h4 className="mb-3 text-danger">No Aura Report Found</h4>
          <p className="lead text-muted">It seems you haven't completed the Aura Perception assessment yet.</p>
          <button 
            className="btn btn-primary btn-lg mt-3 shadow-sm"
            onClick={() => navigateToPath('aura')}
          >
            <i className="bi bi-pencil-square me-2"></i> Take Assessment Now
          </button>
        </div>
      </div>
    );
  }

  // Consistent page background
  const pageBackground = 'linear-gradient(135deg, #e0e7ff 0%, #c3daff 100%)'; // Light blue/purple gradient

  const gaugeRadius = 75; // Slightly increased radius for a slightly bigger gauge
  const gaugeCircumference = 2 * Math.PI * gaugeRadius; 
  // Animate from full circle (0%) to actual score (reportData.auraScore)
  const strokeDashoffsetValue = gaugeCircumference - (animatedScore / 100) * gaugeCircumference;


  return (
    <div className="min-vh-100 py-5" style={{ background: pageBackground }}>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header */}
            <div className="text-center mb-5">
              <h1 className="display-3 fw-bold mb-3" style={{ color: '#4a00e0' }}> {/* Deep purple for consistency */}
                Your Aura Reading
              </h1>
              <p className="lead text-dark opacity-75">Discover Your Unique Energetic Signature</p>
            </div>

            {/* Aura Visualization and Score */}
            <div className="row mb-5 g-4">
              <div className="col-lg-6 col-md-6 col-12">
                <div className="card shadow-lg h-100 card-hover-effect border-0 rounded-4">
                  <div className="card-header text-center py-4 rounded-top-4 card-header-custom" style={{ 
                    background: `linear-gradient(135deg, ${getColorHex(reportData.primaryColor)} 0%, ${getColorHex(reportData.primaryColor)}D0 100%)`, // Gradient based on primary color
                    color: 'white'
                  }}>
                    <h3 className="mb-0 fw-bold">Your Aura Field</h3>
                  </div>
                  <div className="card-body text-center py-4">
                    {renderAuraVisualization()}
                    <h4 className="mb-2 fw-semibold" style={{ color: getColorHex(reportData.primaryColor) }}>
                      Primary Aura: {reportData.primaryColor}
                    </h4>
                    <p className="text-muted mb-0 small">
                      Secondary Hues: {reportData.secondaryColors.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-6 col-md-6 col-12">
                <div className="card shadow-lg h-100 card-hover-effect border-0 rounded-4">
                  <div className="card-header bg-gradient text-white text-center py-4 rounded-top-4 card-header-custom" style={{
                    background: `linear-gradient(135deg, ${getColorHex(reportData.primaryColor)} 0%, ${getColorHex(reportData.secondaryColors[0] || reportData.primaryColor)} 100%)` // Gradient based on primary/secondary
                  }}>
                    <h3 className="mb-0 fw-bold">Aura Strength & Clarity</h3>
                  </div>
                  <div className="card-body d-flex align-items-center justify-content-center py-4">
                    <div className="text-center">
                      <div className="position-relative d-inline-block" style={{ width: '220px', height: '220px' }}> {/* Increased size */}
                        <svg width="100%" height="100%" viewBox="0 0 170 170"> {/* Adjusted viewBox */}
                          <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#7b68ee" /> {/* Medium purple */}
                              <stop offset="100%" stopColor="#5a4b9c" /> {/* Darker purple */}
                            </linearGradient>
                            <filter id="gaugeShadow">
                              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.2" />
                            </filter>
                          </defs>
                          <circle
                            cx="85" /* Adjusted center */
                            cy="85" /* Adjusted center */
                            r={gaugeRadius} /* Increased radius */
                            fill="none"
                            stroke="#e9ecef" // Lighter grey for the track
                            strokeWidth="15" // Thicker track
                          />
                          <circle
                            cx="85" /* Adjusted center */
                            cy="85" /* Adjusted center */
                            r={gaugeRadius} /* Increased radius */
                            fill="none"
                            stroke="url(#scoreGradient)" // Use gradient for active part
                            strokeWidth="15"
                            strokeDasharray={gaugeCircumference}
                            strokeDashoffset={strokeDashoffsetValue}
                            strokeLinecap="round"
                            transform="rotate(-90 85 85)" /* Adjusted center for rotation */
                            filter="url(#gaugeShadow)" // Apply shadow
                            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} // Animation
                          />
                          {/* Using foreignObject for richer text styling */}
                          {/* FIX: Centered the foreignObject (x and y calculation based on cx, cy, width, height) */}
                          <foreignObject x="50" y="65" width="70" height="40"> 
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                height: '100%', 
                                fontSize: '2.2rem', /* Slightly smaller font to fit better */
                                fontWeight: 'bold', 
                                color: '#343a40', // Darker text for better contrast
                                fontFamily: 'Arial, sans-serif'
                            }}>
                              {animatedScore}%
                            </div>
                          </foreignObject>
                        </svg>
                      </div>
                      <h4 className="mt-3 fw-semibold" style={{ color: '#4a00e0' }}> {/* Deep purple for consistency */}
                        Aura Clarity
                      </h4>
                      <p className="text-muted mb-0">Reflects the strength and vitality of your aura.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Meanings */}
            <div className="row mb-5 justify-content-center"> {/* Centering the single card */}
              <div className="col-lg-10 col-md-10 col-12"> {/* Increased width for more spread */}
                <div className="card shadow-lg border-0 rounded-4 card-hover-effect">
                  <div className="card-header bg-dark text-white py-3 rounded-top-4 card-header-custom">
                    <h3 className="mb-0 fw-bold">Your Aura Colors & Meanings</h3>
                  </div>
                  <div className="card-body py-4">
                    <div className="row">
                      <div className="col-md-6 mb-4 border-start border-3 ps-3" style={{borderColor: '#7b68ee'}}> {/* Medium purple */}
                        <div className="d-flex align-items-center mb-3">
                          <div 
                            className="rounded-circle me-3 flex-shrink-0"
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              backgroundColor: getColorHex(reportData.primaryColor),
                              border: '4px solid #f8f9fa',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                            }}
                          ></div>
                          <h5 className="mb-0 fw-bold">Primary Color: {reportData.primaryColor}</h5>
                        </div>
                        <p className="text-muted lead-sm">{reportData.colorMeanings.primary}</p>
                      </div>
                      <div className="col-md-6 mb-4 border-start border-3 ps-3" style={{borderColor: '#5a4b9c'}}> {/* Darker purple */}
                        <div className="d-flex align-items-center mb-3">
                          <div className="d-flex me-3 flex-shrink-0">
                            {reportData.secondaryColors.map((color, index) => (
                              <div 
                                key={index}
                                className="rounded-circle"
                                style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  backgroundColor: getColorHex(color),
                                  border: '3px solid #f8f9fa',
                                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                  marginLeft: index > 0 ? '-15px' : '0'
                                }}
                              ></div>
                            ))}
                          </div>
                          <h5 className="mb-0 fw-bold">Secondary Hues: {reportData.secondaryColors.join(', ')}</h5>
                        </div>
                        <p className="text-muted lead-sm">{reportData.colorMeanings.secondary}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personality Analysis */}
            <div className="row mb-5 g-4">
              <div className="col-lg-6 col-md-6 col-12">
                <div className="card shadow-lg h-100 border-0 rounded-4 card-hover-effect border-start border-5" style={{borderColor: '#7b68ee'}}> {/* Medium purple */}
                  <div className="card-header text-white py-3 rounded-top-4 card-header-custom" style={{ backgroundColor: '#7b68ee' }}> {/* Medium purple */}
                    <h4 className="mb-0 fw-bold">
                      <i className="bi bi-person-lines-fill me-2" style={{ fontSize: '2rem', textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}></i> {/* Accentuated Icon */}
                      Personality Traits
                    </h4>
                  </div>
                  <div className="card-body py-4">
                    <p className="lead-sm text-dark">
                      {reportData.personalityTraits}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-12">
                <div className="card shadow-lg h-100 border-0 rounded-4 card-hover-effect border-start border-5" style={{ 
                    borderColor: '#5a4b9c' // Darker purple
                  }}>
                  <div className="card-header text-white py-3 rounded-top-4 card-header-custom" style={{ 
                    backgroundColor: '#5a4b9c' // Darker purple
                  }}>
                    <h4 className="mb-0 fw-bold">
                      <i className="bi bi-emoji-heart-eyes-fill me-2" style={{ fontSize: '2rem', textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}></i> {/* Accentuated Icon */}
                      Emotional Energy
                    </h4>
                  </div>
                  <div className="card-body py-4">
                    <p className="lead-sm text-dark">
                      {reportData.emotionalEnergy}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths and Growth */}
            <div className="row mb-5 g-4">
              <div className="col-lg-6 col-md-6 col-12">
                <div className="card shadow-lg h-100 border-0 rounded-4 card-hover-effect border-start border-5 border-success">
                  <div className="card-header bg-success text-white py-3 rounded-top-4 card-header-custom">
                    <h4 className="mb-0 fw-bold">
                      <i className="bi bi-check-circle-fill me-2" style={{ fontSize: '2rem', textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}></i> {/* Accentuated Icon */}
                      Your Strengths
                    </h4>
                  </div>
                  <div className="card-body py-4">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-star-fill text-warning me-3 mt-1" style={{ fontSize: '1.8rem' }}></i>
                      <p className="lead-sm text-dark">
                        {reportData.strengths}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-12">
                <div className="card shadow-lg h-100 border-0 rounded-4 card-hover-effect border-start border-5 border-info">
                  <div className="card-header bg-info text-white py-3 rounded-top-4 card-header-custom">
                    <h4 className="mb-0 fw-bold">
                      <i className="bi bi-lightbulb-fill me-2" style={{ fontSize: '2rem', textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}></i> {/* Accentuated Icon */}
                      Areas for Growth
                    </h4>
                  </div>
                  <div className="card-body py-4">
                    <div className="d-flex align-items-start">
                      <i className="bi bi-arrow-up-circle-fill text-primary me-3 mt-1" style={{ fontSize: '1.8rem' }}></i>
                      <p className="lead-sm text-dark">
                        {reportData.areasForGrowth}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Affirmation */}
            <div className="row mb-5 justify-content-center"> {/* Centering the single card */}
              <div className="col-lg-10 col-md-10 col-12"> {/* Increased width for more spread */}
                <div className="card shadow-lg border-0 rounded-4" style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Consistent purple gradient
                  color: 'white'
                }}>
                  <div className="card-body text-center py-5">
                    <div className="mb-4">
                      <i className="bi bi-quote" style={{ fontSize: '4rem', opacity: 0.9, color: 'rgba(255,255,255,0.8)' }}></i>
                    </div>
                    <h3 className="mb-4 fw-bold">Your Aura Affirmation</h3>
                    <blockquote className="blockquote text-white">
                      <p className="mb-0 fs-4 fst-italic">"{reportData.affirmation}"</p>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>

            {/* Cross-Navigation */}
            <div className="row g-4 mb-5">
              <div className="col-lg-4 col-md-6 col-12">
                <div className="card h-100 border-0 shadow-lg rounded-4 card-hover-effect" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div className="card-body text-center py-4">
                    {/* Spectrum Animation added here, replacing the icon */}
                    <div className="spectrum-analyzer mb-3">
                        <div className="bar bar-1"></div>
                        <div className="bar bar-2"></div>
                        <div className="bar bar-3"></div>
                        <div className="bar bar-4"></div>
                        <div className="bar bar-5"></div>
                    </div>
                    <h4 className="text-white mb-3 fw-bold">Check Your Vibration</h4>
                    <p className="text-white-75 mb-4">Discover your current vibrational frequency and energy level.</p>
                    <button 
                      className="btn btn-light btn-lg rounded-pill shadow-sm px-4"
                      onClick={() => navigateToPath('vibrational')}
                    >
                      <i className="bi bi-caret-right-fill me-2"></i> Measure Frequency
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-4 col-md-6 col-12">
                <div className="card h-100 border-0 shadow-lg rounded-4 card-hover-effect" style={{ background: 'linear-gradient(135deg, #9c88ff 0%, #8c7ae6 100%)' }}>
                  <div className="card-body text-center py-4">
                    <div className="mb-3">
                      <i className="bi bi-stars text-white" style={{ fontSize: '3.5rem' }}></i>
                    </div>
                    <h4 className="text-white mb-3 fw-bold">Discover Your Karma</h4>
                    <p className="text-white-75 mb-4">Unveil your karmic patterns through Vedic astrology insights.</p>
                    <button 
                      className="btn btn-light btn-lg rounded-pill shadow-sm px-4"
                      onClick={() => navigateToPath('karmic')}
                    >
                      <i className="bi bi-book-fill me-2"></i> Get Karmic Reading
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 col-12">
                <div className="card h-100 border-0 shadow-lg rounded-4 card-hover-effect" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <div className="card-body text-center py-4">
                    <div className="mb-3">
                      <i className="bi bi-chat-dots text-white" style={{ fontSize: '3.5rem' }}></i>
                    </div>
                    <h4 className="text-white mb-3 fw-bold">Ask AI About Your Results</h4>
                    <p className="text-white-75 mb-4">Get personalized insights and answers about your spiritual reports.</p>
                    <button 
                      className="btn btn-light btn-lg rounded-pill shadow-sm px-4"
                      onClick={() => navigate('/report-chat')}
                    >
                      <i className="bi bi-robot me-2"></i> Chat with AI
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center mt-5">
              <button 
                className="btn btn-lg me-3 rounded-pill px-5 shadow-lg action-button-primary"
                style={{ 
                  backgroundColor: '#7b68ee', // Consistent medium purple
                  color: 'white',
                  border: 'none',
                }}
                onClick={() => window.print()}
              >
                <i className="bi bi-download me-2"></i> Download Report
              </button>
              <button 
                className="btn btn-outline-dark btn-lg rounded-pill px-5 shadow-sm action-button-secondary"
                onClick={() => navigate('/onboarding-one')}
              >
                <i className="bi bi-compass-fill me-2"></i> Explore Other Paths
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Custom CSS for lead-sm and card-hover-effect and new animations */}
      <style>{`
        .lead-sm {
          font-size: 1.05rem;
          line-height: 1.6;
        }
        .card-hover-effect {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          border: 1px solid transparent; /* Initial transparent border */
        }
        .card-hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.8rem 1.5rem rgba(0, 0, 0, 0.2) !important; /* More pronounced shadow */
          border-color: rgba(123, 104, 238, 0.5); /* A general purple accent for hover border */
        }
        .card-hover-effect:hover i[class^="bi-"] { /* Target icons within hovered cards */
          transform: scale(1.1); /* Slightly enlarge */
          transition: transform 0.3s ease;
        }
        .rounded-4 {
          border-radius: 1.5rem !important;
        }
        .rounded-top-4 {
          border-top-left-radius: 1.5rem !important;
          border-top-right-radius: 1.5rem !important;
        }
        /* Dashboard-like card headers */
        .card-header-custom {
            border-bottom: 3px solid rgba(0,0,0,0.15) !important; /* Stronger border */
            padding-top: 1.5rem !important;
            padding-bottom: 1.5rem !important;
            font-size: 1.3rem; /* Slightly larger font */
            box-shadow: inset 0 -2px 5px rgba(0,0,0,0.05); /* Subtle inner shadow */
            position: relative;
            z-index: 1; /* Ensure shadow is visible */
        }
        .card-header-custom h3, .card-header-custom h4 {
            margin-bottom: 0;
            font-weight: 600; /* Semi-bold */
        }

        /* Aura Wave Animation */
        @keyframes auraWave {
          0% {
            r: 0;
            opacity: 1;
          }
          100% {
            r: 150px; /* Max radius for the wave */
            opacity: 0;
          }
        }

        .aura-wave-1 {
          animation: auraWave 3s ease-out infinite;
        }
        .aura-wave-2 {
          animation: auraWave 3s ease-out infinite 1s; /* Staggered start */
        }
        .aura-wave-3 {
          animation: auraWave 3s ease-out infinite 2s; /* Staggered start */
        }

        /* Spectrum Analyzer Animation */
        .spectrum-analyzer {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          width: 100%;
          height: 50px; /* Height of the animation area */
          gap: 2px; /* Thinner space between bars */
          margin-bottom: 1rem;
        }

        .spectrum-analyzer .bar {
          width: 4px; /* Thinner width of each bar */
          background-color: rgba(255, 255, 255, 0.8); /* White bars */
          border-radius: 1px; /* Smaller border-radius for thinner bars */
          animation: spectrumBar 1.2s ease-in-out infinite alternate;
        }

        .spectrum-analyzer .bar-1 { height: 20px; animation-delay: 0s; }
        .spectrum-analyzer .bar-2 { height: 35px; animation-delay: 0.15s; }
        .spectrum-analyzer .bar-3 { height: 25px; animation-delay: 0.3s; }
        .spectrum-analyzer .bar-4 { height: 40px; animation-delay: 0.45s; }
        .spectrum-analyzer .bar-5 { height: 30px; animation-delay: 0.6s; }

        @keyframes spectrumBar {
          0% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
          100% { transform: scaleY(0.5); }
        }

        /* Action Buttons Hover Effect */
        .action-button-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0,0,0,0.2) !important;
            background-color: #6a5acd !important; /* Slightly darker purple on hover */
        }
        .action-button-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
            background-color: #f8f9fa !important; /* White background on hover for outline */
            color: #343a40 !important; /* Darker text */
        }
      `}</style>
    </div>
  );
};

export default AuraReport;