import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { generateReportWithVision, generateTextOnlyReport } from './services/gpt';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface ReportData {
  auraReport?: any;
  vibrationalReport?: any;
  karmicReport?: any;
  availableReports: string[];
}

const ReportChat: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!currentUser) return;

      try {
        const availableReports: string[] = [];
        const reports: any = {};

        // Fetch Aura Report
        try {
          const auraRef = doc(db, 'auraReports', currentUser.uid);
          const auraSnap = await getDoc(auraRef);
          if (auraSnap.exists()) {
            reports.auraReport = auraSnap.data();
            availableReports.push('Aura');
          }
        } catch (error) {
          console.error('Error fetching aura report:', error);
        }

        // Fetch Vibrational Report
        try {
          const vibrationalRef = doc(db, 'vibrationalReports', currentUser.uid);
          const vibrationalSnap = await getDoc(vibrationalRef);
          if (vibrationalSnap.exists()) {
            reports.vibrationalReport = vibrationalSnap.data();
            availableReports.push('Vibrational');
          }
        } catch (error) {
          console.error('Error fetching vibrational report:', error);
        }

        // Fetch Karmic Report
        try {
          const karmicRef = doc(db, 'karmicReports', currentUser.uid);
          const karmicSnap = await getDoc(karmicRef);
          if (karmicSnap.exists()) {
            reports.karmicReport = karmicSnap.data();
            availableReports.push('Karmic');
          }
        } catch (error) {
          console.error('Error fetching karmic report:', error);
        }

        setReportData({
          ...reports,
          availableReports
        });

        // Initialize chat with available reports
        if (availableReports.length > 0) {
          const welcomeMessage = `Welcome to your personalized AI consultation! 🌟

I have access to your ${availableReports.join(', ')} report${availableReports.length > 1 ? 's' : ''}. 

You can ask me anything about:
${availableReports.map(report => `• Your ${report} insights and meanings`).join('\n')}
• How different aspects of your reports relate to each other
• Practical advice based on your spiritual profile
• Deeper interpretations of specific findings

What would you like to know about your spiritual journey?`;

          setMessages([
            { role: 'assistant', content: welcomeMessage }
          ]);
        } else {
          setMessages([
            { role: 'assistant', content: "I don't see any completed reports yet. Please complete at least one spiritual assessment to start chatting about your results!" }
          ]);
        }

      } catch (error) {
        console.error('Error fetching reports:', error);
        setMessages([
          { role: 'assistant', content: 'Sorry, there was an error loading your reports. Please try again.' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [currentUser]);

  const handleSendMessage = async () => {
    if (!message.trim() || !reportData || reportData.availableReports.length === 0) return;

    const userMessage = { role: 'user' as const, content: message.trim() };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      // Prepare context for GPT
      const context = {
        availableReports: reportData.availableReports,
        auraReport: reportData.auraReport,
        vibrationalReport: reportData.vibrationalReport,
        karmicReport: reportData.karmicReport
      };

      // Call GPT service with report context
      const aiResponse = await generateTextOnlyReport(message.trim(), process.env.REACT_APP_OPENAI_API_KEY || ''); // Provide your OpenAI API key here
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse
      }]);

    } catch (error: any) {
      console.error('Error getting AI response:', error);
      console.error('Error details:', {
        message: message.trim(),
        context: reportData,
        error: error.message
      });
      
      // Provide a fallback response based on the question
      let fallbackResponse = "I'm sorry, I'm having trouble processing your question right now. Please try again in a moment.";
      
      if (error.message && error.message.includes('API key is not configured')) {
        fallbackResponse = "I'm currently in maintenance mode. Please try again later or contact support if this issue persists.";
      } else if (message.toLowerCase().includes('aura')) {
        fallbackResponse = "Based on your aura report, your energy field shows unique characteristics. Your primary color reflects your core personality, while secondary colors add depth to your spiritual signature. Continue to nurture your strengths and work on areas for growth to maintain a balanced aura.";
      } else if (message.toLowerCase().includes('vibration') || message.toLowerCase().includes('frequency')) {
        fallbackResponse = "Your vibrational frequency is a reflection of your current state of being. Higher frequencies indicate positive emotions and spiritual alignment, while lower frequencies may suggest areas for growth. Focus on practices that raise your vibration like meditation, positive thinking, and connecting with nature.";
      } else if (message.toLowerCase().includes('karma') || message.toLowerCase().includes('karmic')) {
        fallbackResponse = "Your karmic patterns reveal important lessons for your soul's evolution. The challenges you face are opportunities for growth and spiritual development. Embrace these lessons with patience and understanding as they guide you toward your higher purpose.";
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: fallbackResponse
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c3daff 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4>Loading your spiritual insights...</h4>
        </div>
      </div>
    );
  }

  if (!reportData || reportData.availableReports.length === 0) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c3daff 100%)' }}>
        <div className="text-center p-5 rounded shadow-lg bg-white">
          <h4 className="mb-3 text-primary">No Reports Available</h4>
          <p className="lead text-muted mb-4">Complete at least one spiritual assessment to start chatting about your results!</p>
          <button 
            className="btn btn-primary btn-lg rounded-pill px-4"
            onClick={() => navigate('/onboarding-one')}
          >
            <i className="bi bi-compass-fill me-2"></i> Take Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #c3daff 100%)' }}>
      <style>{`
        .chat-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .message-bubble {
          max-width: 80%;
          word-wrap: break-word;
        }
        
        .user-message {
          background: linear-gradient(135deg, #7c3aed 0%, #4b1fa7 100%);
          color: white;
          border-radius: 18px 18px 4px 18px;
        }
        
        .assistant-message {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 18px 18px 18px 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
          background: white;
          border-radius: 18px 18px 18px 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          max-width: 80px;
        }
        
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #7c3aed;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .input-container {
          background: white;
          border-radius: 25px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }
        
        .send-button {
          background: linear-gradient(135deg, #7c3aed 0%, #4b1fa7 100%);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.2s ease;
        }
        
        .send-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }
        
        .send-button:disabled {
          opacity: 0.6;
          transform: none;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .chat-container {
            padding: 1rem !important;
            border-radius: 12px;
          }
          .input-container {
            border-radius: 18px;
            padding: 0.75rem !important;
          }
          .message-bubble {
            font-size: 0.98rem;
            padding: 0.75rem !important;
            max-width: 95%;
          }
          .user-message, .assistant-message {
            font-size: 0.98rem;
          }
        }
        @media (max-width: 576px) {
          .chat-container {
            padding: 0.5rem !important;
            border-radius: 8px;
          }
          .input-container {
            border-radius: 12px;
            padding: 0.5rem !important;
          }
          .message-bubble {
            font-size: 0.93rem;
            padding: 0.5rem !important;
            max-width: 100%;
          }
          .user-message, .assistant-message {
            font-size: 0.93rem;
          }
          .container {
            padding-left: 0 !important;
            padding-right: 0 !important;
            width: 100% !important;
            max-width: 100vw !important;
          }
        }
        @media (max-width: 400px) {
          .chat-container {
            padding: 0.25rem !important;
          }
          .input-container {
            padding: 0.25rem !important;
          }
          .message-bubble {
            font-size: 0.88rem;
            padding: 0.25rem !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="w-100 position-fixed top-0 start-0" style={{ zIndex: 1000 }}>
        <div className="bg-white shadow-sm p-3">
          <div className="container d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button 
                className="btn btn-outline-primary rounded-circle me-3"
                onClick={() => navigate('/onboarding-one')}
                style={{ width: '40px', height: '40px' }}
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <div>
                <h5 className="mb-0 fw-bold" style={{ color: '#4b1fa7' }}>AI Spiritual Guide</h5>
                <small className="text-muted">
                  Available reports: {reportData?.availableReports.join(', ')}
                </small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button 
                className="btn btn-primary btn-sm rounded-pill"
                onClick={() => setShowReportsModal(true)}
                style={{ 
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4b1fa7 100%)',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.2)'
                }}
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                View Reports
              </button>
              <span className="badge bg-success rounded-pill">
                <i className="bi bi-circle-fill me-1"></i>Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Modal */}
      {showReportsModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold" style={{ color: '#4b1fa7' }}>
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Your Spiritual Reports
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowReportsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {reportData?.availableReports.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                    <h6 className="mt-3 text-muted">No reports available</h6>
                    <p className="text-muted">Complete at least one spiritual assessment to view your reports.</p>
                    <button 
                      className="btn btn-primary rounded-pill"
                      onClick={() => {
                        setShowReportsModal(false);
                        navigate('/onboarding-one');
                      }}
                    >
                      Take Assessment
                    </button>
                  </div>
                ) : (
                  <div className="row g-3">
                    {reportData?.auraReport && (
                      <div className="col-12">
                        <div 
                          className="card border-0 shadow-sm h-100 cursor-pointer"
                          style={{ 
                            borderRadius: '15px',
                            background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setShowReportsModal(false);
                            navigate('/aura-report');
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                          }}
                        >
                          <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-3">
                              <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                   style={{ 
                                     width: '50px', 
                                     height: '50px', 
                                     background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)' 
                                   }}>
                                <i className="bi bi-palette-fill text-white" style={{ fontSize: '1.5rem' }}></i>
                              </div>
                              <div>
                                <h6 className="mb-1 fw-bold" style={{ color: '#2e7d32' }}>Aura Report</h6>
                                <small className="text-muted">Energy field analysis & color insights</small>
                              </div>
                            </div>
                            <p className="text-muted small mb-0">
                              Discover your aura colors, energy patterns, and spiritual signature
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {reportData?.vibrationalReport && (
                      <div className="col-12">
                        <div 
                          className="card border-0 shadow-sm h-100 cursor-pointer"
                          style={{ 
                            borderRadius: '15px',
                            background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setShowReportsModal(false);
                            navigate('/vibrational-report');
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                          }}
                        >
                          <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-3">
                              <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                   style={{ 
                                     width: '50px', 
                                     height: '50px', 
                                     background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' 
                                   }}>
                                <i className="bi bi-activity text-white" style={{ fontSize: '1.5rem' }}></i>
                              </div>
                              <div>
                                <h6 className="mb-1 fw-bold" style={{ color: '#f57c00' }}>Vibrational Report</h6>
                                <small className="text-muted">Frequency analysis & energy level</small>
                              </div>
                            </div>
                            <p className="text-muted small mb-0">
                              Understand your current vibrational frequency and energy state
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {reportData?.karmicReport && (
                      <div className="col-12">
                        <div 
                          className="card border-0 shadow-sm h-100 cursor-pointer"
                          style={{ 
                            borderRadius: '15px',
                            background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setShowReportsModal(false);
                            navigate('/karmic-report');
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                          }}
                        >
                          <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-3">
                              <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                   style={{ 
                                     width: '50px', 
                                     height: '50px', 
                                     background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)' 
                                   }}>
                                <i className="bi bi-moon-stars-fill text-white" style={{ fontSize: '1.5rem' }}></i>
                              </div>
                              <div>
                                <h6 className="mb-1 fw-bold" style={{ color: '#7b1fa2' }}>Karmic Report</h6>
                                <small className="text-muted">Jyotish reading & life predictions</small>
                              </div>
                            </div>
                            <p className="text-muted small mb-0">
                              Explore your karmic patterns, life purpose, and cosmic guidance
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button 
                  type="button" 
                  className="btn btn-secondary rounded-pill"
                  onClick={() => setShowReportsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-grow-1 d-flex flex-column" style={{ marginTop: '80px', padding: '20px' }}>
        <div className="container h-100 d-flex flex-column">
          <div className="chat-container p-4 flex-grow-1 d-flex flex-column" style={{ minHeight: 'calc(100vh - 120px)' }}>
            <div className="d-flex flex-column h-100">
              {/* Messages */}
              <div className="flex-grow-1 overflow-auto mb-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="me-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" 
                             style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #7c3aed 0%, #4b1fa7 100%)' }}>
                          <span style={{ color: 'white', fontSize: '16px' }}>✨</span>
                        </div>
                      </div>
                    )}
                    <div className={`message-bubble p-3 ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="d-flex justify-content-start mb-3">
                    <div className="me-2">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" 
                           style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #7c3aed 0%, #4b1fa7 100%)' }}>
                        <span style={{ color: 'white', fontSize: '16px' }}>✨</span>
                      </div>
                    </div>
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            </div>
          </div>
          {/* Input Area - move this OUTSIDE the chat-container, but inside the main flex column */}
          <div className="input-container p-3">
            <div className="d-flex align-items-center gap-3">
              <input
                type="text"
                className="form-control border-0"
                placeholder="Ask about your spiritual insights..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping}
                style={{ background: 'transparent' }}
              />
              <button
                className="send-button"
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
              >
                <i className="bi bi-arrow-up"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportChat; 