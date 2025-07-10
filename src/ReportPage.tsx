import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from './context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { generateFullSoulReport } from './services/reportUtils';
import { generateReportWithVision, generateTextOnlyReport } from './services/gpt';
import { motion } from 'framer-motion';

type AIStats = {
  vibrational: { percent: number; hz: string; label: string } | null;
  body: { percent: number; value: string; label: string } | null;
  overall: number | null;
  soulScore: number | null;
  bodyFreq: number | null;
};

const AnimatedGauge = ({ value, max, label, description }: { value: number, max: number, label: string, description: string }) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const pointerRef = useRef<SVGCircleElement>(null);
  const radius = 90;
  const stroke = 16;
  const center = 100;
  const circumference = Math.PI * radius;
  const percent = Math.min(Math.max(value / max, 0), 1);
  const angle = percent * 180;
  const arc = (startAngle: number, endAngle: number) => {
    const start = {
      x: center + radius * Math.cos(Math.PI * (1 - startAngle / 180)),
      y: center + radius * Math.sin(Math.PI * (1 - startAngle / 180)),
    };
    const end = {
      x: center + radius * Math.cos(Math.PI * (1 - endAngle / 180)),
      y: center + radius * Math.sin(Math.PI * (1 - endAngle / 180)),
    };
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };
  return (
    <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 4px 24px #e1bee7aa', maxWidth: 340, margin: '0 auto' }}>
      <div style={{ color: '#fff', background: '#5f259f', borderRadius: '16px 16px 0 0', padding: '18px 0 8px 24px', fontWeight: 700, fontSize: 28, letterSpacing: 0.5, textAlign: 'left' }}>
        Vibrational<br />Frequency
      </div>
      <div style={{ background: '#fff', borderRadius: '0 0 16px 16px', padding: 0, marginTop: -8 }}>
        <svg width={200} height={120} viewBox="0 0 200 120">
          <path d={arc(0, 180)} stroke="#e0e0e0" strokeWidth={stroke} fill="none" />
          <path
            d={arc(0, angle)}
            stroke="#ffb300"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            style={{ transition: 'd 1.2s cubic-bezier(.6,1.5,.6,1)', filter: 'drop-shadow(0 2px 8px #ffb30055)' }}
          />
          <circle
            ref={pointerRef}
            cx={center + radius * Math.cos(Math.PI * (1 - angle / 180))}
            cy={center + radius * Math.sin(Math.PI * (1 - angle / 180))}
            r={stroke / 1.3}
            fill="#fff"
            stroke="#ffb300"
            strokeWidth={4}
            style={{ filter: 'drop-shadow(0 2px 8px #ffb30055)', transition: 'cx 1.2s, cy 1.2s' }}
          />
        </svg>
        <div style={{ textAlign: 'center', marginTop: -18 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#222' }}>{value} <span style={{ fontSize: 20, fontWeight: 600 }}>Hz</span></div>
          <div style={{ fontSize: 20, color: '#222', fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 16, color: '#888', marginTop: 4 }}>{description}</div>
        </div>
      </div>
    </div>
  );
};

const sectionNames = [
  'Vibrational Frequency',
  'Body Energy',
  'Your Soul Percentage',
  'Numerology Overview',
  'Eternal Archetype Profile',
  'Aura & Chakra Health',
  'Relationship Resonance Map',
  'Astrocartography Insights',
  'Karmic Load & Dharmic Alignment',
  'Integration & Biometric Sync',
  'Vibrational Analysis of Foods & Fabrics',
  'Soul Report Summary',
];

const ReportPage = () => {
  const { currentUser } = useAuth();
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [qaPairs, setQaPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState<any>(null);
  const [profile, setProfile] = useState<{ name?: string; profileImage?: string | null; quote?: string }>({});
  const [showVibrationalModal, setShowVibrationalModal] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const [aiStats, setAiStats] = useState<AIStats | null>(null);

  useEffect(() => {
    const fetchAnswers = async () => {
      if (!currentUser) return;
      const docRef = doc(db, 'userSoulPathAnswers', currentUser.uid);
      const docSnap = await getDoc(docRef);
      let pairs: any[] = [];
      if (docSnap.exists() && Array.isArray(docSnap.data().qaPairs)) {
        pairs = docSnap.data().qaPairs;
        setQaPairs(pairs);
      }
      // Build prompt from all Q&A and image analyses
      let userData = '';
      pairs.forEach((item, idx) => {
        if (item.question && item.answer) {
          userData += `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}\n`;
        }
        if (item.type === 'face') {
          userData += `Face Photo Analysis: ${item.analysis}\n`;
        }
        if (item.type === 'palm') {
          userData += `Palm Photo Analysis: ${item.analysis}\n`;
        }
      });
      const prompt = `Based on the following user answers and image analyses, generate a full Eternal Soul Report with these sections:\n- ${sectionNames.join('\n- ')}\n\nUser Data:\n${userData}\n\nAfter your detailed report, please add a summary block like this, with values calculated from your analysis:\n\nVibrational Frequency: 432 Hz (Peace)\nBody Score: 80 (Good)\nOverall Percentage: 80%\nYour Soul Score: 85%\nBody Frequency: 500 Hz`;
      // Use GPT to generate the report
      const aiContent = await generateReportWithVision({ soulPath: currentUser.uid, qaHistory: pairs });
      let reportText = '';
      if (typeof aiContent === 'string') {
        reportText = aiContent;
      } else if (aiContent && typeof aiContent === 'object' && 'text' in aiContent && typeof (aiContent as any).text === 'string') {
        reportText = (aiContent as any).text;
      } else {
        reportText = String(aiContent);
      }
      setAiReport(reportText);
      setLoading(false);
    };
    fetchAnswers();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'YourSoulAnswers', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setProfile(docSnap.data());
      };
      fetchProfile();
    }
  }, [currentUser]);

  useEffect(() => {
    if (aiReport) {
      setAiStats(extractStatsFromReport(aiReport));
    }
  }, [aiReport]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const analysisData = [
    { id: 'numerology', title: 'Numerology Overview', score: 95, description: 'Introduced himself, brand and was able to explain the purpose of the call' },
    { id: 'archtype', title: 'Eternal Archtype Profile', score: 95, description: 'Deep understanding of your core spiritual archetype and divine purpose' },
    { id: 'aura', title: 'Aura & Chakra Health', score: 85, description: 'Comprehensive analysis of your energy centers and auric field strength' },
    { id: 'relationship', title: 'Relationship Resonance Map', score: 95, description: 'Mapping of your soul connections and relationship patterns' },
    { id: 'astro', title: 'Astrocartography Insights', score: 95, description: 'Planetary influences on your life path and geographical alignments' },
    { id: 'karmic', title: 'Karmic Load & Dharmic Alignment', score: 95, description: 'Understanding of your karmic patterns and dharmic life purpose' },
    { id: 'biometric', title: 'Integration & Biometric Sync', score: 60, description: 'Synchronization of your physical and spiritual energy patterns' },
    { id: 'vibrational', title: 'Vibrational Analysis of Foods & Fabrics', score: 95, description: 'How different materials and foods affect your energetic vibration' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'warning';
    if (score >= 70) return 'info';
    return 'danger';
  };

  const CircularProgress = ({ value, max, label, color = 'warning' }: { value: number, max: number, label: string, color?: string }) => {
    const percentage = (value / max) * 100;
    const strokeDasharray = `${percentage * 2.83} 283`;
    
    return (
      <div className="d-flex flex-column align-items-center">
        <div className="position-relative" style={{ width: '120px', height: '120px' }}>
          <svg width="120" height="120" className="position-absolute">
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#e9ecef"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke={color === 'warning' ? '#ffc107' : '#6f42c1'}
              strokeWidth="8"
              strokeDasharray={strokeDasharray}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 0.3s ease' }}
            />
          </svg>
          <div className="position-absolute top-50 start-50 translate-middle text-center">
            <div className="h4 mb-0 fw-bold">{value}</div>
            <small className="text-muted">{label}</small>
          </div>
        </div>
      </div>
    );
  };

  // Debug: log the raw AI report and extracted sections
  useEffect(() => {
    if (aiReport) {
      console.log('Raw AI Report:', aiReport);
      const firstSection = extractSection(aiReport, 'From the Shadows of Perception to the Illumination of Expansion');
      console.log('Extracted First Section:', firstSection);
    }
  }, [aiReport]);

  if (loading) return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border text-primary mb-4" style={{ width: 64, height: 64 }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <div style={{ fontSize: 22, color: '#6a1b9a', fontWeight: 600 }}>Generating your soul report...</div>
      <div style={{ color: '#888', marginTop: 8 }}>Tuning into your unique energy signature...</div>
    </div>
  );

  // Parse AI report for sections
  const parseSection = (section: string) => {
    if (!aiReport) return '';
    const regex = new RegExp(`${section}:(.*?)(?=\n[A-Z][A-Z &]+:|$)`, 'is');
    const match = aiReport.match(regex);
    return match ? match[1].trim() : '';
  };
  const sectionContent: { [key: string]: string } = {};
  sectionNames.forEach(name => {
    sectionContent[name] = parseSection(name);
  });

  // Utility to extract sections from the AI report
  function extractSection(report: string, sectionTitle: string): string {
    if (!report) return '';
    const safeTitle = sectionTitle.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(
      `\\*\\*${safeTitle}\\*\\*\\s*\\n?([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`,
      'g'
    );
    const match = regex.exec(report);
    return match && match[1] ? match[1].trim() : '';
  }

  function extractStatsFromReport(report: string): AIStats {
    const vibrationalMatch = report.match(/Vibrational Frequency:\s*(\d+)%\s*([\d.]+)\s*Hz\s*\(([^)]+)\)/i);
    const bodyScoreMatch = report.match(/Body Score:\s*(\d+)%\s*([\d.]+)\s*\(([^)]+)\)/i);
    const overallMatch = report.match(/Overall Percentage:\s*([\d.]+)%/i);
    const soulScoreMatch = report.match(/Your Soul Score:\s*([\d.]+)%/i);
    const bodyFreqMatch = report.match(/Body Frequency:\s*([\d.]+)\s*Hz/i);

    return {
      vibrational: vibrationalMatch
        ? { percent: Number(vibrationalMatch[1]), hz: vibrationalMatch[2], label: vibrationalMatch[3] }
        : null,
      body: bodyScoreMatch
        ? { percent: Number(bodyScoreMatch[1]), value: bodyScoreMatch[2], label: bodyScoreMatch[3] }
        : null,
      overall: overallMatch ? Number(overallMatch[1]) : null,
      soulScore: soulScoreMatch ? Number(soulScoreMatch[1]) : null,
      bodyFreq: bodyFreqMatch ? Number(bodyFreqMatch[1]) : null
    };
  }

  // Section titles from the AI report
  const sectionTitles = [
    'Embark on the Illumination of the Senses',
    'Hear the Symphony of the Universe',
    'Aura: The Energy Field Expanded',
    'Chakras: The Whirling Vortexes of Energy',
    'Third Eye: The Seat of Intuition',
    'Vibrational Frequency: The Essence of Being',
    'Karmic Awareness: Aligning with the Cosmic Flow',
    'The Total Perceptual Expansion'
  ];

  const sections = typeof aiReport === 'string' ? sectionTitles.map(title => {
    let content = extractSection(aiReport, title);
    // Fallback for key sections if missing
    if ((title === "Insight's Eye – Third Eye Vision" || title === "Soul's Compass – Karmic Awareness") && !content) {
      content = 'No response generated for this section.';
    }
    return { title, content };
  }) : [];

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, type: 'spring', stiffness: 80 }
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="container py-5">
          {/* Hero Section */}
          <div className="row align-items-center position-relative mb-5">
            {/* Quote (left) */}
            <div className="col-md-3 d-none d-md-block">
              <div className="bg-white rounded shadow p-3">
                <i className="bi bi-quote text-primary fs-1"></i>
                <p className="mb-0 text-muted">Eternal AI is your personal companion for inner growth
                and exploration..</p>
              </div>
            </div>
            {/* Center (heading + profile) */}
            <div className="col-12 col-md-6 text-center position-relative">
              <div className="mb-2">
                <span className="badge bg-light text-dark px-3 py-2">Hello!</span>
              </div>
              <h1 className="display-4 fw-bold text-purple mb-0">Your<br/>SOUL Journey<br/>REPORT</h1>
              <div className="position-relative d-flex justify-content-center mt-3">
                <div className="bg-purple rounded-circle position-absolute top-50 start-50 translate-middle" style={{width: 300, height: 300, zIndex: 0, opacity: 0.2}}></div>
                <img src={profile.profileImage || '/default-avatar.png'} alt="Profile" className="rounded-circle border border-white shadow" style={{width: 180, height: 180, objectFit: 'cover', zIndex: 1}} />
              </div>
            </div>
            {/* 5 Stars (right) */}
            <div className="col-md-3 d-none d-md-block text-center">
              <div className="bg-white rounded shadow p-3">
                <div className="mb-2">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="bi bi-star-fill text-warning fs-4"></i>
                  ))}
                </div>
                <div className="fw-bold fs-4">5 Stars</div>
                <div className="text-muted">Excellent</div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              {/* Vibrational Frequency Card */}
              <div className="card shadow rounded-4">
                <div className="card-header bg-purple text-black rounded-top-4 fs-4 fw-bold">Vibrational Frequency</div>
                <div className="card-body text-center">
                  {/* SVG Gauge here */}
                  <svg viewBox="0 0 200 100" width="100%" height="100%">
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6a1b9a" />
                        <stop offset="100%" stopColor="#4a148c" />
                      </linearGradient>
                    </defs>
                    {/* Background Arc */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      stroke="#e0e0e0"
                      strokeWidth="20"
                      fill="none"
                    />
                    {/* Value Arc (change stroke-dasharray for percentage fill) */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="20"
                      fill="none"
                      strokeDasharray="150, 251.2"  // Adjust 150 for value %
                      strokeLinecap="round"
                    />
                    {/* Center Circle */}
                    <circle cx="100" cy="100" r="8" fill="#4a148c" />
                    {/* Optional Text */}
                    <text x="100" y="90" fontSize="16" textAnchor="middle" fill="#333">
                      {aiStats?.vibrational?.percent ?? 60}%
                    </text>
                  </svg>
                  <div className="display-5 fw-bold">
                    {aiStats?.vibrational?.hz ?? 432} <span className="fs-4">Hz</span>
                  </div>
                  <div className="fw-semibold text-secondary">
                    {aiStats?.vibrational?.label ?? 'Peace'}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              {/* Body Energy Card */}
              <div className="card shadow rounded-4">
                <div className="card-header bg-purple text-black rounded-top-4 fs-4 fw-bold">Body Energy</div>
                <div className="card-body text-center">
                  {/* ...gauge SVG... */}
                  <svg viewBox="0 0 200 100" width="100%" height="100%">
                    <defs>
                      <linearGradient id="bodyGaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6a1b9a" />
                        <stop offset="100%" stopColor="#4a148c" />
                      </linearGradient>
                    </defs>
                    {/* Background Arc */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      stroke="#e0e0e0"
                      strokeWidth="20"
                      fill="none"
                    />
                    {/* Value Arc (change stroke-dasharray for percentage fill) */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      stroke="url(#bodyGaugeGradient)"
                      strokeWidth="20"
                      fill="none"
                      strokeDasharray="120, 251.2"  // Adjust 120 for value %
                      strokeLinecap="round"
                    />
                    {/* Center Circle */}
                    <circle cx="100" cy="100" r="8" fill="#4a148c" />
                    {/* Optional Text */}
                    <text x="100" y="90" fontSize="16" textAnchor="middle" fill="#333">
                      {aiStats?.body?.percent ?? 80}%
                    </text>
                  </svg>
                  <div className="display-5 fw-bold">
                    {aiStats?.body?.value ?? 80}
                  </div>
                  <div className="fw-semibold text-secondary">
                    {aiStats?.body?.label ?? 'GOOD'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Row */}
          <div className="row text-center mb-4">
            <div className="col">
              <div className="fw-bold fs-3">
                {aiStats?.overall ?? 80}%
              </div>
              <div className="text-muted">Overall Percentage</div>
            </div>
            <div className="col">
              <div className="fw-bold fs-3">
                {aiStats?.soulScore ?? 85}%
              </div>
              <div className="text-muted">Your Soul Score</div>
            </div>
            <div className="col">
              <div className="fw-bold fs-3">
                {aiStats?.bodyFreq ?? 500} <span className="fs-5">Hz</span>
              </div>
              <div className="text-muted">Body Frequency</div>
            </div>
          </div>

          {/* Analysis Accordion */}
          <div className="row">
            {sectionTitles.map((title, idx) => {
              const content = extractSection(aiReport, title);
              return (
                <div className="col-12 mb-4" key={title}>
                  <div className="card shadow">
                    <div className="card-header fw-bold">{title}</div>
                    <div className="card-body">{content}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show Full Report Button and Modal */}
          <div className="text-center mt-4">
            <button className="btn btn-primary" onClick={() => setShowFullReport(true)}>
              Show Full AI Report
            </button>
          </div>
          {showFullReport && (
            <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Full AI-Generated Report</h5>
                    <button type="button" className="btn-close" onClick={() => setShowFullReport(false)}></button>
                  </div>
                  <div className="modal-body">
                    <pre style={{ whiteSpace: 'pre-wrap', background: '#f8f9fa', padding: 16, borderRadius: 8 }}>
                      {typeof aiReport === 'string' ? aiReport : ''}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <div>Vibrational Frequency: {aiStats?.vibrational?.hz} Hz ({aiStats?.vibrational?.label})</div>
            <div>Body Score: {aiStats?.body?.value} ({aiStats?.body?.label})</div>
            <div>Overall Percentage: {aiStats?.overall}%</div>
            <div>Your Soul Score: {aiStats?.soulScore}%</div>
            <div>Body Frequency: {aiStats?.bodyFreq} Hz</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;