import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import 'bootstrap/dist/css/bootstrap.min.css';

interface KarmicReportData {
  birthPlace: string;
  lifeArea: string;
  challenge: string;
  jyotishReading: string;
  chartImages: {
    rasiChart: string;
    navamshaChart: string;
  };
  birthData: {
    location: string;
    dob: string;
    tob: string;
    timezone: string;
  };
}

const KarmicReport = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<KarmicReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (currentUser) {
        try {
          const reportRef = doc(db, 'karmicReports', currentUser.uid);
          const reportSnap = await getDoc(reportRef);
          
          if (reportSnap.exists()) {
            setReportData(reportSnap.data() as KarmicReportData);
          }
        } catch (error) {
          console.error('Error fetching karmic report:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReport();
  }, [currentUser]);

  const navigateToPath = (path: string) => {
    navigate(`/chat?path=${path}`);
  };

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-dark">Consulting the cosmic energies...</h4>
          <p className="text-muted">Your Jyotish reading is being prepared</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <div className="text-center">
          <h4 className="text-dark">No Karmic Report Found</h4>
          <p className="text-muted">Please complete the Karmic Awareness assessment first.</p>
          <button 
            className="btn btn-primary btn-lg rounded-pill px-4"
            onClick={() => navigateToPath('karmic')}
          >
            Take Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
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
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header Section */}
            <div className="text-center mb-5">
              <div className="d-inline-block px-4 py-2 rounded-pill mb-3" style={{ background: 'linear-gradient(90deg, #a084e8 0%, #f3e8ff 100%)', color: '#4b1fa7', fontWeight: 600, fontSize: 18, boxShadow: '0 2px 12px rgba(160,132,232,0.10)' }}>
                Hello!
              </div>
              <h1 className="fw-bold mb-3" style={{ fontSize: 48, color: '#222', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Your <span style={{ color: '#4b1fa7' }}>Life</span> Prediction
              </h1>
            </div>

            {/* Birth Details Cards */}
            <div className="row g-4 mb-5">
              <div className="col-md-3">
                <div className="card interactive-card h-100 border-0 shadow-lg rounded-4" style={{ background: 'linear-gradient(135deg, #f8f7fa 0%, #ffffff 100%)', border: '2px solid #a084e8' }}>
                  <div className="card-body text-center py-4">
                    <div className="mb-2"><i className="bi bi-calendar-event" style={{ color: '#4b1fa7', fontSize: 28 }}></i></div>
                    <div className="fw-bold text-dark mb-1">Birth Date</div>
                    <div className="text-muted small">{formatDate(reportData.birthData.dob)}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card interactive-card h-100 border-0 shadow-lg rounded-4" style={{ background: 'linear-gradient(135deg, #f8f7fa 0%, #ffffff 100%)', border: '2px solid #a084e8' }}>
                  <div className="card-body text-center py-4">
                    <div className="mb-2"><i className="bi bi-clock-history" style={{ color: '#4b1fa7', fontSize: 28 }}></i></div>
                    <div className="fw-bold text-dark mb-1">Birth Time</div>
                    <div className="text-muted small">{formatTime(reportData.birthData.tob)}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card interactive-card h-100 border-0 shadow-lg rounded-4" style={{ background: 'linear-gradient(135deg, #f8f7fa 0%, #ffffff 100%)', border: '2px solid #a084e8' }}>
                  <div className="card-body text-center py-4">
                    <div className="mb-2"><i className="bi bi-geo-alt" style={{ color: '#4b1fa7', fontSize: 28 }}></i></div>
                    <div className="fw-bold text-dark mb-1">Birth Place</div>
                    <div className="text-muted small">{reportData.birthPlace}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card interactive-card h-100 border-0 shadow-lg rounded-4" style={{ background: 'linear-gradient(135deg, #f8f7fa 0%, #ffffff 100%)', border: '2px solid #a084e8' }}>
                  <div className="card-body text-center py-4">
                    <div className="mb-2"><i className="bi bi-bullseye" style={{ color: '#4b1fa7', fontSize: 28 }}></i></div>
                    <div className="fw-bold text-dark mb-1">Focus Area</div>
                    <div className="text-muted small">{reportData.lifeArea}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Images */}
            {reportData.chartImages && (
              <div className="row mb-5 g-4">
                <div className="col-lg-6">
                  <div className="card interactive-card border-0 shadow-lg h-100 rounded-4" style={{ border: '2px solid #a084e8' }}>
                    <div className="card-header bg-transparent border-0 pt-4 pb-2">
                      <h5 className="mb-0 d-flex align-items-center text-dark fw-bold">
                        <div className="bg-primary rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <i className="bi bi-diagram-3 text-white small"></i>
                        </div>
                        Rasi Chart (D1) - Birth Chart
                      </h5>
                    </div>
                    <div className="card-body text-center px-4 pb-4">
                      <div className="position-relative">
                        <img 
                          src={reportData.chartImages.rasiChart} 
                          alt="Rasi Chart"
                          className="img-fluid rounded-4 border"
                          style={{ maxHeight: '300px', border: '2px solid #a084e8' }}
                        />
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className="badge rounded-pill px-3 py-2" style={{ background: 'linear-gradient(90deg, #a084e8 0%, #4b1fa7 100%)', color: '#fff', fontWeight: 600 }}>D1</span>
                        </div>
                      </div>
                      <p className="text-muted mt-3 mb-0 small">
                        Shows planetary positions at time of birth
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card interactive-card border-0 shadow-lg h-100 rounded-4" style={{ border: '2px solid #a084e8' }}>
                    <div className="card-header bg-transparent border-0 pt-4 pb-2">
                      <h5 className="mb-0 d-flex align-items-center text-dark fw-bold">
                        <div className="bg-success rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                          <i className="bi bi-diagram-2 text-white small"></i>
                        </div>
                        Navamsha Chart (D9) - Soul Chart
                      </h5>
                    </div>
                    <div className="card-body text-center px-4 pb-4">
                      <div className="position-relative">
                        <img 
                          src={reportData.chartImages.navamshaChart} 
                          alt="Navamsha Chart"
                          className="img-fluid rounded-4 border"
                          style={{ maxHeight: '300px', border: '2px solid #a084e8' }}
                        />
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className="badge rounded-pill px-3 py-2" style={{ background: 'linear-gradient(90deg, #4b1fa7 0%, #a084e8 100%)', color: '#fff', fontWeight: 600 }}>D9</span>
                        </div>
                      </div>
                      <p className="text-muted mt-3 mb-0 small">
                        Reveals deeper spiritual nature and marriage
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Jyotish Reading */}
            <div className="card interactive-card border-0 shadow-lg mb-5 rounded-4" style={{ background: 'linear-gradient(135deg, #f8f7fa 0%, #ffffff 100%)', border: '2px solid #a084e8', padding: '2.5rem 2rem' }}>
              <div className="card-header bg-transparent border-0 pt-4 pb-2 text-center">
                <h2 className="mb-0 fw-bold" style={{
                  fontSize: 38,
                  background: 'linear-gradient(90deg, #4b1fa7 0%, #a084e8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.5px',
                  marginBottom: 24
                }}>
                  <i className="bi bi-stars me-2" style={{ color: '#ffd700', fontSize: 32, filter: 'drop-shadow(0 2px 8px #fffbe6)' }}></i>
                  Your Personalized Jyotish Reading
                </h2>
              </div>
              <div className="card-body px-4 pb-4">
                {/* Overview Section */}
                <div className="mb-5 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #fff 100%)', boxShadow: '0 2px 12px rgba(160,132,232,0.06)' }}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-eye text-primary" style={{ fontSize: 22 }}></i>
                    </div>
                    <h4 className="fw-bold text-dark mb-0" style={{ fontSize: 22 }}>Overview of Your Vedic Birth Chart</h4>
                  </div>
                  <p className="text-muted mb-0" style={{ lineHeight: '1.8', fontSize: '1.15rem' }}>
                    Greetings! Your birth chart, cast in the mystical science of Jyotish or Vedic Astrology, offers profound insights into your karmic blueprint. Born under the Pisces ascendant (Lagna), your life is influenced deeply by Jupiter (Guru), the planet of wisdom and expansion. This positioning gives you a compassionate and introspective nature, coupled with a deep inclination towards spirituality.
                  </p>
                </div>

                {/* Key Planetary Influences */}
                <div className="mb-5 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #fff 100%)', boxShadow: '0 2px 12px rgba(160,132,232,0.06)' }}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-globe text-success" style={{ fontSize: 22 }}></i>
                    </div>
                    <h4 className="fw-bold text-dark mb-0" style={{ fontSize: 22 }}>Key Planetary Influences</h4>
                  </div>
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="card bg-light border-0">
                        <div className="card-body p-3">
                          <h6 className="fw-bold text-primary mb-2">Lagna and Lagna Lord</h6>
                          <p className="mb-0 small text-muted">As a Pisces ascendant, your life's path is significantly shaped by Jupiter. Currently positioned in your 7th house in Virgo, Jupiter's placement suggests a strong focus on partnerships and intellectual pursuits. The aspect of Jupiter on your ascendant infuses you with moral integrity and a philosophical outlook towards life.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="card bg-light border-0">
                        <div className="card-body p-3">
                          <h6 className="fw-bold text-primary mb-2">Strongest Planets</h6>
                          <p className="mb-0 small text-muted">Your chart shows a strong influence from Saturn and Moon, positioned together in the 5th house in Cancer. This conjunction indicates a deep emotional world and a serious approach towards life's pleasures and creativity. The influence of Saturn here could sometimes bring feelings of limitation or delay in matters of the heart and education.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="card bg-light border-0">
                        <div className="card-body p-3">
                          <h6 className="fw-bold text-primary mb-2">Significant Yogas</h6>
                          <ul className="mb-0 small text-muted">
                            <li><strong>Gajakesari Yoga:</strong> Formed by Jupiter and Moon, this yoga blesses you with intelligence, wealth, and a noble disposition, enhancing your life significantly.</li>
                            <li><strong>Adhi Yoga:</strong> Influenced by benefics in 6th, 7th, and 8th positions from the Moon, suggesting protection and success through life's adversities.</li>
                          </ul>
                          <p className="mt-2 mb-0 small text-muted">These combinations shape your personality to be generous, thoughtful, and resilient, with an innate capacity to overcome challenges gracefully.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Karmic Challenges */}
                <div className="mb-5 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #fff 100%)', boxShadow: '0 2px 12px rgba(160,132,232,0.06)' }}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-warning bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-lightning text-warning" style={{ fontSize: 22 }}></i>
                    </div>
                    <h4 className="fw-bold text-dark mb-0" style={{ fontSize: 22 }}>Current Karmic Challenges</h4>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card bg-light border-0">
                        <div className="card-body p-3">
                          <h6 className="fw-bold text-warning mb-2">Karmic Patterns and Lessons</h6>
                          <p className="mb-0 small text-muted">With Saturn in the 5th house, there's an indication of karmic lessons related to discipline, responsibility, and emotional maturity. Ketu in the 8th house in Libra points towards deep spiritual transformations often triggered by crisis or intense emotional experiences. This placement urges you to let go of material attachments and seek deeper truths.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card bg-light border-0">
                        <div className="card-body p-3">
                          <h6 className="fw-bold text-warning mb-2">Areas for Spiritual Growth</h6>
                          <ul className="mb-0 small text-muted">
                            <li>Your placements suggest a need to balance your emotional and spiritual worlds. Embracing practices that ground you and connect you with your inner wisdom (like meditation or journaling) will be beneficial.</li>
                            <li>The presence of Ketu in the 8th house calls for exploration into metaphysical realms or psychology, providing insights into the hidden aspects of life and self.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Cosmic Phase */}
                <div className="mb-5 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #fff 100%)', boxShadow: '0 2px 12px rgba(160,132,232,0.06)' }}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-info bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-clock text-info" style={{ fontSize: 22 }}></i>
                    </div>
                    <h4 className="fw-bold text-dark mb-0" style={{ fontSize: 22 }}>Current Cosmic Phase</h4>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="card bg-light border-0">
                        <div className="card-body p-3">
                          <h6 className="fw-bold text-info mb-2">Planetary Periods (Dasha)</h6>
                          <p className="mb-0 small text-muted">You are currently under the influence of the Sun Mahadasha and Saturn Antardasha. Sun, positioned in the 11th house, generally promises gains and fulfillment of desires. However, Saturn's influence could moderate these outcomes, introducing delays or challenges especially related to health and studies.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light border-0">
                        <div className="card-body p-3">
                          <h6 className="fw-bold text-info mb-2">Significant Transits</h6>
                          <p className="mb-0 small text-muted">Jupiter's current transit through your 7th house can be a supportive period for educational growth but requires effort to overcome lethargy or lack of focus brought by Saturn's influence.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card bg-light border-0">
                        <div className="card-body p-3">
                          <h6 className="fw-bold text-info mb-2">Energetic Themes</h6>
                          <p className="mb-0 small text-muted">This phase of your life is about balancing personal ambitions with your duties and responsibilities. Learning to manage your time and energy effectively will be crucial.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guidance for Health and Studies */}
                <div className="mb-5 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #fff 100%)', boxShadow: '0 2px 12px rgba(160,132,232,0.06)' }}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-danger bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-heart-pulse text-danger" style={{ fontSize: 22 }}></i>
                    </div>
                    <h4 className="fw-bold text-dark mb-0" style={{ fontSize: 22 }}>Guidance for Health and Studies</h4>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card bg-light border-0">
                        <div className="card-body p-3">
                          <h6 className="fw-bold text-danger mb-2">Health</h6>
                          <p className="mb-0 small text-muted">Saturn's influence on your 5th house, which also impacts the mind, suggests that stress or mental strain could be affecting your physical well-being. Regular relaxation and mindfulness practices will be vital in maintaining your health.</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card bg-light border-0">
                        <div className="card-body p-3">
                          <h6 className="fw-bold text-danger mb-2">Studies</h6>
                          <p className="mb-0 small text-muted">The challenge in studies can be attributed to Saturn's aspect on your 5th house of intellect and education. Creating a structured schedule, setting realistic goals, and perhaps seeking a mentor or a guide in Jupiter's form can help alleviate these issues.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mystical Recommendations */}
                <div className="mb-0 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #fff 100%)', boxShadow: '0 2px 12px rgba(160,132,232,0.06)' }}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-purple bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: 'rgba(102, 16, 242, 0.1)' }}>
                      <i className="bi bi-magic text-purple" style={{ fontSize: 22, color: '#6610f2' }}></i>
                    </div>
                    <h4 className="fw-bold text-dark mb-0" style={{ fontSize: 22 }}>Mystical Recommendations</h4>
                  </div>
                  <div className="card bg-gradient" style={{ background: 'linear-gradient(135deg, rgba(102, 16, 242, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
                    <div className="card-body p-3">
                      <ul className="mb-0 small text-dark">
                        <li><strong>Chant the Jupiter Mantra:</strong> "Om Brim Brihaspataye Namah" to enhance concentration and wisdom.</li>
                        <li><strong>Saturn Remedies:</strong> Engage in service to others or offer donations to the needy on Saturdays to appease Saturn's harsher effects.</li>
                      </ul>
                      <p className="mt-3 mb-0 small text-muted fst-italic">Your journey is molded by the cosmic dance of the planets, each placement and aspect weaving the fabric of your destiny. Embrace the lessons they bring, for each challenge is an opportunity to grow deeper in wisdom and strength. Namaste!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Responses Summary */}
            <div className="row mb-5">
              <div className="col-md-4">
                <div className="card interactive-card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                  <div className="card-header bg-transparent border-0 pt-3 pb-2">
                    <h6 className="mb-0 d-flex align-items-center text-dark fw-bold">
                      <div className="bg-info rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                        <i className="bi bi-geo-alt text-white small"></i>
                      </div>
                      Birth Place Confirmed
                    </h6>
                  </div>
                  <div className="card-body pt-0">
                    <p className="mb-0 fw-semibold text-dark">{reportData.birthPlace}</p>
                    <small className="text-muted">Location used for chart calculation</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card interactive-card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                  <div className="card-header bg-transparent border-0 pt-3 pb-2">
                    <h6 className="mb-0 d-flex align-items-center text-dark fw-bold">
                      <div className="bg-warning rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                        <i className="bi bi-heart text-white small"></i>
                      </div>
                      Area of Focus
                    </h6>
                  </div>
                  <div className="card-body pt-0">
                    <p className="mb-0 fw-semibold text-dark">{reportData.lifeArea}</p>
                    <small className="text-muted">Your current area of curiosity</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card interactive-card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                  <div className="card-header bg-transparent border-0 pt-3 pb-2">
                    <h6 className="mb-0 d-flex align-items-center text-dark fw-bold">
                      <div className="bg-danger rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                        <i className="bi bi-exclamation-triangle text-white small"></i>
                      </div>
                      Current Challenge
                    </h6>
                  </div>
                  <div className="card-body pt-0">
                    <p className="mb-0 fw-semibold text-dark">{reportData.challenge}</p>
                    <small className="text-muted">Karmic pattern for growth</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Cross-Navigation */}
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div className="card interactive-card h-100 border-0 shadow-lg" style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '24px'
                }}>
                  <div className="card-body text-center py-5">
                    <div className="mb-4">
                      <div className="bg-white bg-opacity-20 rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                        <div style={{ fontSize: '2.5rem' }}>⚡</div>
                      </div>
                    </div>
                    <h4 className="text-white mb-3 fw-bold">Check Your Vibration</h4>
                    <p className="text-white opacity-75 mb-4">Discover your current vibrational frequency and energy level</p>
                    <button 
                      className="btn btn-light btn-lg rounded-pill px-4 fw-medium"
                      onClick={() => navigateToPath('vibrational')}
                    >
                      Measure Frequency
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card interactive-card h-100 border-0 shadow-lg" style={{ 
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  borderRadius: '24px'
                }}>
                  <div className="card-body text-center py-5">
                    <div className="mb-4">
                      <div className="bg-white bg-opacity-20 rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}>
                        ✨
                      </div>
                    </div>
                    <h4 className="text-white mb-3 fw-bold">Explore Your Aura</h4>
                    <p className="text-white opacity-75 mb-4">Discover the colors and energies that surround your spirit</p>
                    <button 
                      className="btn btn-light btn-lg rounded-pill px-4 fw-medium"
                      onClick={() => navigateToPath('aura')}
                    >
                      Reveal My Aura
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cosmic Insight Box */}
            <div className="card interactive-card border-0 shadow-lg mb-5" style={{
              background: 'linear-gradient(135deg, rgba(111,66,193,0.1) 0%, rgba(139,92,246,0.1) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(111,66,193,0.2)',
              borderRadius: '24px'
            }}>
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-stars text-primary" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
                <h3 className="mb-4 text-dark fw-bold">Cosmic Wisdom</h3>
                <blockquote className="blockquote">
                  <p className="mb-0 fs-5 fst-italic text-dark">
                    "The stars impel, they do not compel. Your free will shapes your destiny, 
                    while the cosmic energies provide the backdrop for your soul's evolution."
                  </p>
                </blockquote>
                <footer className="blockquote-footer mt-3 text-muted">
                  <cite title="Source Title">Ancient Vedic Wisdom</cite>
                </footer>
              </div>
            </div>

            {/* Action Buttons */}
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
                  <i className="bi bi-download me-2"></i>
                  Download Reading
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
                  <i className="bi bi-arrow-left me-2"></i>
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
                <button className="btn btn-lg px-5 py-3" 
                        style={{ 
                          background: 'linear-gradient(135deg, #10b981 0%, #4b1fa7 100%)', 
                          border: 'none', 
                          color: 'white',
                          fontWeight: 600,
                          fontSize: 18,
                          borderRadius: 12
                        }} 
                        onClick={() => window.location.href = `mailto:?subject=My Jyotish Reading&body=Check out my personalized Jyotish reading from Eternal AI!`}>
                  <i className="bi bi-share me-2"></i>
                  Share Reading
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KarmicReport;