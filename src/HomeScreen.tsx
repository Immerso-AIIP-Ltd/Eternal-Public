"use client"
import { useRef, useState, useEffect } from "react"
import { Sparkles, TrendingUp, Eye, Zap, Gem, Heart, Activity } from "lucide-react"
import EternalLogo from './20250709_1555_Eternal_App_Logo_remix_01jzqbd8vdfewajx10wga0fnfd-removebg-preview (1).png';

export default function SpiritualHomepage() {
  // --- Original analytics/report/dashboard logic ---
  const [currentSection, setCurrentSection] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const reportSectionRef = useRef<HTMLDivElement>(null)

  const handleScrollToInsights = () => {
    if (reportSectionRef.current) {
      reportSectionRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const spiritualAnalytics = [
    {
      energeticFrequency: 847,
      frequencyTrend: "+12%",
      auralSpectrum: "#7c3aed",
      auralClassification: "Violet Transcendence",
      karmicAlignment: "Harmonically Balanced",
      celestialInfluence: "Venus-Jupiter Conjunction",
      soulResonance: 94.7,
      consciousnessLevel: "Elevated Awareness",
      spiritualQuotient: "Your energetic signature indicates profound spiritual maturation",
      recommendedPractice: "Advanced Chakra Harmonization",
      gemstoneResonance: "Amethyst & Clear Quartz",
      meditativeFrequency: "528 Hz - Love Frequency",
    },
    {
      energeticFrequency: 923,
      frequencyTrend: "+18%",
      auralSpectrum: "#8b5cf6",
      auralClassification: "Cosmic Indigo",
      karmicAlignment: "Ascending Trajectory",
      celestialInfluence: "Mercury-Neptune Trine",
      soulResonance: 97.2,
      consciousnessLevel: "Transcendent State",
      spiritualQuotient: "Your vibrational signature reflects advanced spiritual evolution",
      recommendedPractice: "Third Eye Activation Protocol",
      gemstoneResonance: "Lapis Lazuli & Moonstone",
      meditativeFrequency: "741 Hz - Intuition Enhancement",
    },
    {
      energeticFrequency: 1024,
      frequencyTrend: "+24%",
      auralSpectrum: "#a084e8",
      auralClassification: "Divine Luminescence",
      karmicAlignment: "Mastery Achieved",
      celestialInfluence: "Full Spectrum Alignment",
      soulResonance: 99.8,
      consciousnessLevel: "Unity Consciousness",
      spiritualQuotient: "Your energetic blueprint demonstrates exceptional spiritual mastery",
      recommendedPractice: "Crown Chakra Integration",
      gemstoneResonance: "Diamond & Selenite",
      meditativeFrequency: "963 Hz - Divine Connection",
    },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)

      const scrollPercent = currentScrollY / (document.documentElement.scrollHeight - window.innerHeight)
      const section = Math.floor(scrollPercent * 3)
      setCurrentSection(Math.min(section, 2))
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const currentAnalytics = spiritualAnalytics[currentSection]
  const reportsOpacity = Math.min(1, Math.max(0, (scrollY - 200) / 400))

  return (
    <div className="spiritual-homepage">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <img src={EternalLogo} alt="Eternal Logo" className="logo-img" />
            <span className="logo-text">Eternal AI</span>
          </div>
          <nav className="nav">
            <a href="/dashboard" className="nav-link">
              Dashboard
            </a>
            <a href="/reports" className="nav-link">
              Reports
            </a>
            <a href="/insights" className="nav-link">
              Insights
            </a>
            <a href="/guidance" className="nav-link">
              Guidance
            </a>
            <a href="/profile" className="nav-link">
              Profile
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          {/* Left: Text */}
          <div className="hero-text">
            <div className="hero-subtitle">Spiritual Intelligence Platform</div>
            <h1 className="hero-title">
              Welcome back,
              <br />
              <span className="hero-name">Alexandra</span>
            </h1>
            <div className="hero-description">
              <p>Every moment is a new opportunity for spiritual growth.</p>
              <p>Your journey of self-discovery continues today.</p>
              <p>The universe has infinite wisdom waiting for you.</p>
            </div>
            <button onClick={handleScrollToInsights} className="hero-button">
              Explore Insights
            </button>
          </div>

          {/* Right: Face Image */}
          <div className="hero-image-container">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20250709_1048_Profile%20Silhouette%20Study_remix_01jzpsvfp9f418b731g3fk48bg-QEThIAFtwEtaa3bmINBBXhSl8kyTzV.png"
              alt="Spiritual Consciousness"
              className="hero-image"
            />
            {/* Subtle sparkles */}
            <Sparkles className="sparkle sparkle-1" />
            <Sparkles className="sparkle sparkle-2" />
          </div>
        </div>
      </section>

      {/* Analytics/Report/Dashboard Section */}
      <section ref={reportSectionRef} className="analytics-section" style={{ opacity: reportsOpacity }}>
        <div className="analytics-container">
          {/* Section Header */}
          <div className="section-header">
            <h2 className="section-title">
              Spiritual Intelligence
              <span className="section-subtitle">Assessment Report</span>
            </h2>
            <p className="section-description">
              Comprehensive analysis of your energetic signature and consciousness evolution
            </p>
          </div>

          {/* Primary Metrics Grid */}
          <div className="metrics-grid">
            {/* Energetic Frequency */}
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-info">
                  <h3 className="metric-label">Energetic Frequency</h3>
                  <div className="metric-value-container">
                    <span className="metric-value">{currentAnalytics.energeticFrequency}</span>
                    <span className="metric-trend">{currentAnalytics.frequencyTrend}</span>
                  </div>
                </div>
                <div className="metric-icon-container">
                  <TrendingUp className="metric-icon" />
                </div>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(currentAnalytics.energeticFrequency / 1024) * 100}%` }}
                />
              </div>
              <p className="metric-description">Optimal range for manifestation protocols</p>
            </div>

            {/* Aural Spectrum Analysis */}
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-info">
                  <h3 className="metric-label">Aural Spectrum</h3>
                  <div className="aural-classification">{currentAnalytics.auralClassification}</div>
                </div>
                <div className="metric-icon-container">
                  <Eye className="metric-icon" />
                </div>
              </div>
              <div className="aural-display">
                <div
                  className="aural-color"
                  style={{
                    backgroundColor: currentAnalytics.auralSpectrum,
                    boxShadow: `0 0 30px ${currentAnalytics.auralSpectrum}40`,
                  }}
                />
                <div className="aural-info">
                  <div className="aural-label">Dominant Wavelength</div>
                  <div className="aural-value">{currentAnalytics.auralSpectrum}</div>
                </div>
              </div>
              <p className="metric-description">Indicates elevated consciousness state</p>
            </div>

            {/* Soul Resonance */}
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-info">
                  <h3 className="metric-label">Soul Resonance</h3>
                  <div className="metric-value">{currentAnalytics.soulResonance}%</div>
                </div>
                <div className="metric-icon-container">
                  <Activity className="metric-icon" />
                </div>
              </div>
              <div className="resonance-bars">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="resonance-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="metric-description">Harmonic alignment achieved</p>
            </div>
          </div>

          {/* Detailed Analysis Section */}
          <div className="consciousness-card">
            <div className="consciousness-header">
              <Sparkles className="consciousness-icon" />
              <h3 className="consciousness-title">Consciousness Assessment</h3>
            </div>
            <div className="consciousness-quote">"{currentAnalytics.spiritualQuotient}"</div>
            <div className="consciousness-details">
              <div className="consciousness-detail">
                <div className="detail-label">Karmic Alignment</div>
                <div className="detail-value">{currentAnalytics.karmicAlignment}</div>
              </div>
              <div className="consciousness-detail">
                <div className="detail-label">Consciousness Level</div>
                <div className="detail-value">{currentAnalytics.consciousnessLevel}</div>
              </div>
            </div>
          </div>

          {/* Recommendations Grid */}
          <div className="recommendations-grid">
            <div className="recommendation-card">
              <div className="recommendation-icon-container">
                <Gem className="recommendation-icon" />
              </div>
              <h3 className="recommendation-label">Gemstone Resonance</h3>
              <p className="recommendation-value">{currentAnalytics.gemstoneResonance}</p>
              <p className="recommendation-description">Crystalline frequency amplification</p>
            </div>

            <div className="recommendation-card">
              <div className="recommendation-icon-container">
                <Zap className="recommendation-icon" />
              </div>
              <h3 className="recommendation-label">Recommended Practice</h3>
              <p className="recommendation-value">{currentAnalytics.recommendedPractice}</p>
              <p className="recommendation-description">Optimized for current energetic state</p>
            </div>

            <div className="recommendation-card">
              <div className="recommendation-icon-container">
                <Heart className="recommendation-icon" />
              </div>
              <h3 className="recommendation-label">Meditative Frequency</h3>
              <p className="recommendation-value">{currentAnalytics.meditativeFrequency}</p>
              <p className="recommendation-description">Binaural entrainment protocol</p>
            </div>
          </div>

          {/* Progress Analytics */}
          <div className="progress-analytics">
            <h3 className="progress-title">Spiritual Development Metrics</h3>
            <div className="progress-stats">
              <div className="progress-stat">
                <div className="stat-value">847</div>
                <div className="stat-label">Days Active</div>
              </div>
              <div className="progress-stat">
                <div className="stat-value">127</div>
                <div className="stat-label">Reports Generated</div>
              </div>
              <div className="progress-stat">
                <div className="stat-value">2,847</div>
                <div className="stat-label">Insights Catalogued</div>
              </div>
              <div className="progress-stat">
                <div className="stat-value">15,420</div>
                <div className="stat-label">Meditation Minutes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .spiritual-homepage {
          min-height: 100vh;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1a202c;
        }

        /* Header */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 30;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-img {
          width: 64px;
          height: 64px;
          object-fit: contain;
          margin-right: 20px;
        }

        .logo-text {
          font-size: 20px;
          font-weight: 700;
          color: #1a202c;
          letter-spacing: -0.025em;
        }

        .nav {
          display: flex;
          gap: 32px;
        }

        .nav-link {
          color: #4a5568;
          text-decoration: none;
          font-weight: 500;
          font-size: 15px;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: #667eea;
        }

        /* Hero Section */
        .hero-section {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 120px 40px 80px;
          background: white;
        }

        .hero-content {
          display: flex;
          align-items: center;
          gap: 80px;
          max-width: 1200px;
          width: 100%;
        }

        .hero-text {
          flex: 1;
          max-width: 600px;
        }

        .hero-subtitle {
          font-size: 28px;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 32px;
          font-weight: 500;
        }

        .hero-title {
          font-size: 80px;
          font-weight: 800;
          color: #1a202c;
          line-height: 1.1;
          margin-bottom: 40px;
          letter-spacing: -0.025em;
        }

        .hero-name {
          font-size: 84px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 32px;
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 48px;
          font-weight: 400;
        }

        .hero-description p {
          margin-bottom: 8px;
        }

        .hero-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 24px 56px;
          border-radius: 50px;
          font-size: 28px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .hero-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .hero-image-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .hero-image {
          width: 420px;
          height: 420px;
          object-fit: cover;
          border-radius: 50%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 8px solid rgba(255, 255, 255, 0.8);
          filter: drop-shadow(0 8px 32px rgba(102, 126, 234, 0.15));
        }

        .sparkle {
          position: absolute;
          color: #e2e8f0;
          opacity: 0.6;
          animation: pulse 2s infinite;
        }

        .sparkle-1 {
          top: 32px;
          left: 32px;
          width: 40px;
          height: 40px;
        }

        .sparkle-2 {
          bottom: 32px;
          right: 32px;
          width: 32px;
          height: 32px;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        /* Analytics Section */
        .analytics-section {
          min-height: 100vh;
          padding: 80px 0;
          background: #f8fafc;
          transition: opacity 0.5s ease;
        }

        .analytics-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .section-title {
          font-size: 48px;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .section-subtitle {
          display: block;
          font-size: 36px;
          color: #667eea;
          font-weight: 400;
        }

        .section-description {
          font-size: 18px;
          color: #4a5568;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 32px;
          margin-bottom: 64px;
        }

        .metric-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }

        .metric-card:hover {
          transform: translateY(-8px) scale(1.02);
        }

        .metric-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .metric-label {
          font-size: 13px;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .metric-value-container {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }

        .metric-value {
          font-size: 32px;
          font-weight: 300;
          color: #1a202c;
        }

        .metric-trend {
          font-size: 14px;
          color: #48bb78;
          font-weight: 600;
        }

        .metric-icon-container {
          padding: 12px;
          background: #edf2f7;
          border-radius: 12px;
        }

        .metric-icon {
          width: 24px;
          height: 24px;
          color: #667eea;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #edf2f7;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
          transition: width 2s ease-out;
        }

        .metric-description {
          font-size: 14px;
          color: #718096;
          line-height: 1.5;
        }

        .aural-classification {
          font-size: 18px;
          font-weight: 500;
          color: #1a202c;
          margin-top: 4px;
        }

        .aural-display {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .aural-color {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          animation: aural-glow 3s infinite;
        }

        @keyframes aural-glow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .aural-info {
          flex: 1;
        }

        .aural-label {
          font-size: 13px;
          color: #718096;
          margin-bottom: 4px;
        }

        .aural-value {
          font-size: 14px;
          font-family: 'Monaco', 'Menlo', monospace;
          color: #4a5568;
        }

        .resonance-bars {
          display: flex;
          align-items: end;
          gap: 4px;
          height: 48px;
          margin-bottom: 16px;
        }

        .resonance-bar {
          width: 4px;
          height: 48px;
          background: linear-gradient(to top, #667eea, #764ba2);
          border-radius: 2px;
          animation: resonance-pulse 2s infinite ease-in-out;
        }

        @keyframes resonance-pulse {
          0%, 80%, 100% {
            transform: scaleY(0.3);
            opacity: 0.4;
          }
          40% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        /* Consciousness Card */
        .consciousness-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 48px;
          color: white;
          text-align: center;
          margin-bottom: 64px;
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.2);
        }

        .consciousness-header {
          margin-bottom: 32px;
        }

        .consciousness-icon {
          width: 32px;
          height: 32px;
          margin: 0 auto 16px;
          opacity: 0.9;
        }

        .consciousness-title {
          font-size: 28px;
          font-weight: 400;
          margin-bottom: 16px;
        }

        .consciousness-quote {
          font-size: 24px;
          font-weight: 300;
          line-height: 1.5;
          max-width: 800px;
          margin: 0 auto 48px;
          font-style: italic;
        }

        .consciousness-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 32px;
        }

        .consciousness-detail {
          text-align: center;
        }

        .detail-label {
          font-size: 13px;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .detail-value {
          font-size: 18px;
          font-weight: 500;
        }

        /* Recommendations Grid */
        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
          margin-bottom: 64px;
        }

        .recommendation-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }

        .recommendation-card:hover {
          transform: translateY(-5px) scale(1.02);
        }

        .recommendation-icon-container {
          padding: 16px;
          background: #edf2f7;
          border-radius: 12px;
          width: fit-content;
          margin: 0 auto 24px;
        }

        .recommendation-icon {
          width: 32px;
          height: 32px;
          color: #667eea;
        }

        .recommendation-label {
          font-size: 13px;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .recommendation-value {
          font-size: 18px;
          font-weight: 500;
          color: #1a202c;
          margin-bottom: 8px;
        }

        .recommendation-description {
          font-size: 14px;
          color: #718096;
          line-height: 1.5;
        }

        /* Progress Analytics */
        .progress-analytics {
          background: white;
          border-radius: 16px;
          padding: 48px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }

        .progress-title {
          font-size: 24px;
          font-weight: 400;
          color: #1a202c;
          text-align: center;
          margin-bottom: 32px;
        }

        .progress-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }

        .progress-stat {
          text-align: center;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 300;
          color: #667eea;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 13px;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column;
            gap: 40px;
            text-align: center;
          }

          .hero-title {
            font-size: 40px;
          }

          .hero-image {
            width: 300px;
            height: 300px;
          }

          .section-title {
            font-size: 36px;
          }

          .section-subtitle {
            font-size: 28px;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .recommendations-grid {
            grid-template-columns: 1fr;
          }

          .consciousness-card {
            padding: 32px;
          }

          .consciousness-quote {
            font-size: 20px;
          }

          .nav {
            display: none;
          }

          .header-content {
            padding: 16px 20px;
          }

          .analytics-container {
            padding: 0 20px;
          }
        }
      `}</style>
    </div>
  )
}
