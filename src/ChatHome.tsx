import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/config';
import { getVedastroDataAndImage, generateJyotishReading } from './services/vedastro';
import { 
  generateAuraReport, 
  generateVibrationalReport, 
  validateUserResponseWithGPT,
  validateChatHomeResponse,
  generateValidationFeedback 
} from './services/gpt';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { format } from 'date-fns';

type VedastroResult = {
  astrologyData: any;
  chartImages: any;
};

// Question sets for each path
const vibrationalQuestions = [
  {
    section: 'Mood & Mindset',
    questions: [
      {
        text: 'How do you feel emotionally most of the time?',
        options: ['Joyful', 'Calm', 'Neutral', 'Stressed', 'Angry', 'Sad']
      },
      {
        text: 'What thoughts usually pop into your mind?',
        options: ['Positive', 'Mixed', 'Doubtful', 'Negative']
      },
      {
        text: "Energy check! On a scale of 1-10, how's your energy today?",
        options: Array.from({ length: 10 }, (_, i) => (i + 1).toString()),
        isSlider: true
      }
    ],
    encouragement: "Awesome! You've done the first step. Just two more vibe zones to check."
  },
  {
    section: 'Body & Spirit',
    questions: [
      {
        text: 'Any physical tension, pain, or fatigue?',
        options: ['Yes', 'No'],
        followUp: 'Where?'
      },
      {
        text: 'Do you do anything like meditation, prayer, or just sit in silence?',
        options: ['Often', 'Sometimes', 'Rarely', 'Never']
      },
      {
        text: 'Do you feel connected to a purpose or inner voice?',
        options: ['Yes fully', 'Sometimes', 'Not really']
      }
    ],
    encouragement: "Nice! You're 2/3 done! Let's wrap up with a few quick vibe signals..."
  },
  {
    section: 'Environment & Intuition',
    questions: [
      {
        text: 'Do the people around you lift you up or bring you down?',
        options: ['Uplift me', 'Neutral', 'Drain me']
      },
      {
        text: 'How often do you spend time in nature or peaceful places?',
        options: ['Daily', 'Weekly', 'Rarely', 'Never']
      },
      {
        text: 'Do you get gut feelings or dreams that guide you?',
        options: ['Yes a lot', 'Sometimes', 'Not really']
      },
      {
        text: 'Want to try a sound or crystal frequency test later?',
        options: ['Yes please', 'Maybe', 'Not now']
      }
    ],
    encouragement: null
  }
];

const karmicQuestions = [
  {
    text: "Thanks for clicking! To make your reading even more accurate, could you please confirm the city and country of your birth?",
    key: 'birthPlace',
    placeholder: "e.g., New York, USA or Mumbai, India"
  },
  {
    text: "What's one area of your life you're most curious about right now? (e.g., career, relationships, health, spiritual growth)",
    key: 'lifeArea',
    placeholder: "e.g., career growth, finding love, health challenges"
  },
  {
    text: "Is there any specific challenge or recurring theme you've noticed in your life that you'd like some insight into?",
    key: 'challenge',
    placeholder: "e.g., repeated relationship patterns, financial blocks"
  }
];

const auraQuestions = [
  {
    text: "How would you describe your current emotional energy?",
    options: ["calm and peaceful", "passionate and energetic", "creative and adventurous", "thoughtful and introspective"]
  },
  {
    text: "When facing challenges, what is your usual approach?",
    options: ["facing them head-on with confidence", "looking for creative solutions", "reflecting deeply before acting", "seeking harmony and balance"]
  },
  {
    text: "Which environment makes you feel most recharged?",
    options: ["being in nature or quiet places", "social gatherings and lively events", "engaging in artistic or creative activities", "meditative or spiritual settings"]
  },
  {
    text: "Which word resonates with you most right now?",
    options: ["strength", "joy", "wisdom", "compassion"]
  }
];

// Helper functions
const formatDateForAPI = (dateString: string | undefined): string => {
  if (!dateString) return '01/01/2000';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const formatTimeForAPI = (timeString: string | undefined, timeFormat: string | undefined): string => {
  if (!timeString) return '00:00';
  const [time, period] = timeString.includes(' ') ? timeString.split(' ') : [timeString, timeFormat];
  let [hours, minutes] = time.split(':');
  if (period === 'PM' && hours !== '12') {
    hours = (parseInt(hours) + 12).toString();
  } else if (period === 'AM' && hours === '12') {
    hours = '00';
  }
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

// Enhanced validation state interface
interface ValidationState {
  isValidating: boolean;
  error: ValidationFeedback | null;
  attempts: number;
  maxAttempts: number;
}

interface ValidationFeedback {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  encouragement?: string;
  icon?: string;
  showTips?: boolean;
  allowProceed?: boolean;
  reason?: string;
  confidence?: number;
}

const ChatHome: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Get path from URL params
  const urlParams = new URLSearchParams(location.search);
  const pathType = urlParams.get('path') as 'vibrational' | 'karmic' | 'aura' | null;
  
  // State management
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [generatingReport, setGeneratingReport] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);

  // Enhanced validation state
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    error: null,
    attempts: 0,
    maxAttempts: 2
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Helper function to get current question
  const getCurrentQuestion = () => {
    if (pathType === 'vibrational') {
      const section = vibrationalQuestions[currentSection];
      return section?.questions[currentStep]?.text || '';
    } else if (pathType === 'karmic' && currentStep < karmicQuestions.length) {
      return karmicQuestions[currentStep].text;
    } else if (pathType === 'aura' && currentStep < auraQuestions.length) {
      return auraQuestions[currentStep].text;
    }
    return '';
  };

  // Helper function to determine question type
  const getQuestionType = () => {
    if (pathType === 'vibrational') return 'vibrational';
    if (pathType === 'aura') return 'aura';
    if (pathType === 'karmic') return 'spiritual';
    return 'general';
  };

  // Input validation helper for real-time feedback
  const validateInputLength = (input: string) => {
    if (input.length === 0) return null;
    if (input.length < 3) return "A bit more detail would help us understand your energy better...";
    if (input.length > 500) return "That's wonderfully detailed! You might want to summarize your key points.";
    return null;
  };

  // Initialize chat based on path
  useEffect(() => {
    if (!pathType || !currentUser) return;
    
    const initializeChat = async () => {
      // Fetch user profile
      const profileRef = doc(db, 'YourSoulAnswers', currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        setProfile(profileSnap.data());
      }
      
      // Initialize based on path type
      switch (pathType) {
        case 'vibrational':
          setMessages([
            { role: 'assistant', content: 'Vibrational Frequency Assessment' },
            { role: 'assistant', content: "Hey there! Ready to discover your vibrational vibe level? Just 2 minutes and I'll generate your custom report.\nLet's begin!" },
            { role: 'assistant', content: 'Section 1: Mood & Mindset (Q1-Q3)\nLet\'s check your inner world first.' },
            { role: 'assistant', content: vibrationalQuestions[0].questions[0].text }
          ]);
          break;
          
        case 'karmic':
          setMessages([
            { role: 'assistant', content: 'Karmic Awareness Reading' },
            { role: 'assistant', content: 'Welcome to your Karmic Awareness journey! I\'ll ask you 3 specific questions to create your personalized Jyotish reading.' },
            { role: 'assistant', content: karmicQuestions[0].text }
          ]);
          break;
          
        case 'aura':
          setMessages([
            { role: 'assistant', content: 'Aura Perception Analysis' },
            { role: 'assistant', content: 'Welcome to your Aura reading! I\'ll guide you through 4 questions to analyze your energy field and reveal your dominant aura colors.' },
            { role: 'assistant', content: auraQuestions[0].text }
          ]);
          break;
      }
    };
    
    initializeChat();
  }, [pathType, currentUser]);

  // Enhanced handle message sending with comprehensive validation
  const handleSendMessage = async () => {
    if (!message.trim() || !pathType || !currentUser) return;
    
    // Always validate responses for all paths
    if (!validationState.isValidating) {
      setValidationState(prev => ({ ...prev, isValidating: true, error: null }));
      
      try {
        const currentQuestion = getCurrentQuestion();
        const chatContext = {
          pathType,
          currentStep,
          currentSection,
          questionNumber: currentStep + 1
        };
        
        // Validate the response using GPT
        const validation = await validateChatHomeResponse(currentQuestion, message.trim(), chatContext) as any;
        
        setValidationState(prev => ({ ...prev, isValidating: false }));
        
        if (!validation.isValid) {
          // Generate user-friendly feedback
          const feedback = generateValidationFeedback(validation, pathType) as ValidationFeedback;
          setValidationState(prev => ({ 
            ...prev, 
            error: feedback, 
            attempts: prev.attempts + 1 
          }));
          
          // After max attempts, be more lenient
          if (validationState.attempts >= validationState.maxAttempts - 1) {
            setValidationState(prev => ({
              ...prev,
              error: {
                ...feedback,
                type: 'info',
                title: 'We appreciate your effort',
                message: "We appreciate your effort. You can continue with your response or try refining it once more.",
                allowProceed: true
              }
            }));
          }
          
          return; // Don't proceed with invalid response unless allowProceed is true
        }
        
        // Reset validation state on successful validation
        setValidationState(prev => ({
          ...prev,
          isValidating: false,
          error: null,
          attempts: 0,
          maxAttempts: 2
        }));
        
      } catch (error) {
        console.error('Validation error:', error);
        setValidationState(prev => ({ 
          ...prev, 
          isValidating: false,
          error: {
            type: 'warning',
            title: 'Validation Temporarily Unavailable',
            message: 'Unable to validate response right now. Please ensure your answer is meaningful and continue.',
            allowProceed: true
          }
        }));
      }
    }
    
    // Process the valid response
    await processValidResponse(message.trim());
  };

  // Process valid response and continue with the flow
  const processValidResponse = async (validAnswer: string) => {
    const userMsg = { role: 'user' as const, content: validAnswer };
    setMessages(prev => [...prev, userMsg]);
    setValidationState(prev => ({ ...prev, attempts: 0 }));
    
    if (pathType === 'vibrational') {
      await handleVibrationalFlow(validAnswer);
    } else if (pathType === 'karmic') {
      await handleKarmicFlow(validAnswer);
    } else if (pathType === 'aura') {
      await handleAuraFlow(validAnswer);
    }
    
    setMessage('');
  };

  // Vibrational flow handler
  const handleVibrationalFlow = async (answer: string) => {
    const section = vibrationalQuestions[currentSection];
    const question = section.questions[currentStep];
    
    // Store answer
    const newAnswers = { ...answers, [`${currentSection}_${currentStep}`]: answer };
    setAnswers(newAnswers);
    
    // Move to next question
    if (currentStep < section.questions.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: section.questions[currentStep + 1].text }]);
      }, 600);
    } else if (section.encouragement && currentSection < vibrationalQuestions.length - 1) {
      // Move to next section
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: section.encouragement! }]);
        setTimeout(() => {
          setCurrentSection(currentSection + 1);
          setCurrentStep(0);
          const nextSection = vibrationalQuestions[currentSection + 1];
          setMessages(prev => [...prev, 
            { role: 'assistant', content: `Section ${currentSection + 2}: ${nextSection.section}\n${getSectionDescription(currentSection + 1)}` },
            { role: 'assistant', content: nextSection.questions[0].text }
          ]);
        }, 1200);
      }, 600);
    } else {
      // Complete assessment
      await completeVibrationalAssessment(newAnswers);
    }
  };

  const getSectionDescription = (sectionIndex: number) => {
    const descriptions = [
      "Let's check your inner world first.",
      "Let's feel into your body and soul...",
      "Time to check the vibes around you..."
    ];
    return descriptions[sectionIndex] || "";
  };

  const completeVibrationalAssessment = async (finalAnswers: any) => {
    setGeneratingReport(true);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'All done! Based on your answers, I\'m tuning into your current vibrational frequency... One sec!' 
    }]);

    try {
      // Store answers in Firebase
      await setDoc(doc(db, 'vibrationalAnswers', currentUser.uid), {
        answers: finalAnswers,
        timestamp: serverTimestamp()
      });

      // Generate report using GPT-4.1
      const reportData = await generateVibrationalReport(finalAnswers);
      
      // Store report in Firebase
      await setDoc(doc(db, 'vibrationalReports', currentUser.uid), {
        ...reportData,
        generatedAt: serverTimestamp()
      });

      navigate('/vibrational-report');
    } catch (error) {
      console.error('Error generating vibrational report:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error generating your report. Please try again.' 
      }]);
      setGeneratingReport(false);
    }
  };

  // Karmic flow handler with validation
  const handleKarmicFlow = async (answer: string) => {
    const currentQuestion = karmicQuestions[currentStep];
    const newAnswers = { ...answers, [currentQuestion.key]: answer };
    setAnswers(newAnswers);

    if (currentStep < karmicQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: karmicQuestions[currentStep + 1].text 
        }]);
      }, 600);
    } else {
      await completeKarmicAssessment(newAnswers);
    }
  };

  const completeKarmicAssessment = async (finalAnswers: any) => {
    setGeneratingReport(true);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'Thank you for your responses! I\'m now consulting the cosmic energies and generating your personalized Jyotish reading. This may take a moment...' 
    }]);

    try {
      // Prepare birth data
      const birthData = {
        location: finalAnswers.birthPlace || profile.location || 'Delhi, India',
        dob: formatDateForAPI(profile.dateOfBirth),
        tob: formatTimeForAPI(profile.timeOfBirth, profile.timeFormat),
        timezone: '+05:30'
      };

      const astrologyResult = await getVedastroDataAndImage(birthData) as VedastroResult | string;

      if (typeof astrologyResult === 'string') {
        throw new Error('Failed to fetch astrology data');
      }

      await setDoc(doc(db, 'vedastroData', currentUser.uid), {
        astrologyData: astrologyResult.astrologyData,
        chartImages: astrologyResult.chartImages,
        birthData,
        timestamp: serverTimestamp()
      });

      // Generate Jyotish reading with GPT-4.1
      const jyotishReading = await generateJyotishReading({
        astrologyData: astrologyResult.astrologyData,
        userResponses: finalAnswers,
        birthData: birthData
      });

      // Store complete karmic report
      await setDoc(doc(db, 'karmicReports', currentUser.uid), {
        ...finalAnswers,
        birthData,
        astrologyData: astrologyResult.astrologyData,
        chartImages: astrologyResult.chartImages,
        jyotishReading,
        generatedAt: serverTimestamp()
      });

      navigate('/karmic-report');
    } catch (error) {
      console.error('Error generating karmic report:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but there was an error generating your reading. Please try again or contact support.' 
      }]);
      setGeneratingReport(false);
    }
  };

  // Aura flow handler
  const handleAuraFlow = async (answer: string) => {
    const newAnswers = { ...answers, [`question_${currentStep + 1}`]: answer };
    setAnswers(newAnswers);

    if (currentStep < auraQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: auraQuestions[currentStep + 1].text 
        }]);
      }, 600);
    } else {
      await completeAuraAssessment(newAnswers);
    }
  };

  const completeAuraAssessment = async (finalAnswers: any) => {
    setGeneratingReport(true);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'Perfect! I\'m now analyzing your energy field and revealing your aura colors. This will just take a moment...' 
    }]);

    try {
      // Store answers in Firebase
      await setDoc(doc(db, 'auraAnswers', currentUser.uid), {
        answers: finalAnswers,
        timestamp: serverTimestamp()
      });

      // Generate aura report using GPT-4.1
      const auraReport = await generateAuraReport(finalAnswers);
      
      // Store report in Firebase
      await setDoc(doc(db, 'auraReports', currentUser.uid), {
        ...auraReport,
        generatedAt: serverTimestamp()
      });

      navigate('/aura-report');
    } catch (error) {
      console.error('Error generating aura report:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error generating your aura report. Please try again.' 
      }]);
      setGeneratingReport(false);
    }
  };

  // Handle follow-up for vibrational path
  // Removed handleFollowUp function

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

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Enhanced validation feedback UI component
  const renderValidationFeedback = () => {
    if (!validationState.error) return null;

    const error = validationState.error;

    return (
      <div className="validation-feedback mb-3" style={{ maxWidth: '100%', margin: '0 auto' }}>
        <div 
          className={`alert alert-${error.type === 'error' ? 'danger' : error.type === 'info' ? 'info' : 'warning'} border-0 shadow-sm`}
          style={{ 
            background: error.type === 'error' ? 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' :
                       error.type === 'info' ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' :
                       'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
            borderRadius: '12px',
            animation: 'slideInFromTop 0.3s ease-out'
          }}
        >
          <div className="d-flex align-items-start">
            {/* Icon */}
            <div className="me-3">
              {error.icon ? (
                <span style={{ fontSize: '1.5rem' }}>{error.icon}</span>
              ) : (
                <i className={`bi ${
                  error.type === 'error' ? 'bi-x-circle-fill text-danger' :
                  error.type === 'info' ? 'bi-info-circle-fill text-info' :
                  'bi-exclamation-triangle-fill text-warning'
                }`} style={{ fontSize: '1.5rem' }}></i>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-grow-1">
              <div className="fw-bold mb-1">{error.title}</div>
              <div className="mb-2">{error.message}</div>
              
              {/* Encouragement */}
              {error.encouragement && (
                <div className="p-2 rounded mb-2" 
                     style={{ 
                       background: 'rgba(106, 27, 154, 0.1)', 
                       color: '#6a1b9a',
                       fontSize: '0.9rem',
                       fontStyle: 'italic'
                     }}>
                  💫 {error.encouragement}
                </div>
              )}
              
              {/* Tips for better responses */}
              {error.showTips && (
                <details className="mt-2">
                  <summary className="text-muted small fw-bold" style={{ cursor: 'pointer' }}>
                    💡 Tips for meaningful responses
                  </summary>
                  <ul className="small text-muted mt-2 mb-0">
                    <li>Share your genuine thoughts and feelings</li>
                    <li>Describe your personal experiences</li>
                    <li>Be authentic - there are no wrong spiritual answers</li>
                    <li>Use at least a few words to express yourself</li>
                  </ul>
                </details>
              )}
              
              {/* Action buttons */}
              <div className="mt-3 d-flex gap-2">
                {error.allowProceed && (
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      setValidationState(prev => ({ ...prev, error: null }));
                      processValidResponse(message.trim());
                    }}
                  >
                    Continue with this response
                  </button>
                )}
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => setValidationState(prev => ({ ...prev, error: null }))}
                >
                  Let me try again
                </button>
              </div>
            </div>
            
            {/* Close button */}
            <button 
              className="btn-close ms-2" 
              onClick={() => setValidationState(prev => ({ 
                ...prev, 
                error: null, 
                attempts: 0 
              }))}
            ></button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced validation loading indicator
  const renderValidationLoading = () => {
    if (!validationState.isValidating) return null;

    const loadingMessages = {
      vibrational: '🔮 Analyzing your vibrational response...',
      aura: '✨ Reading your energy signature...',
      karmic: '🌙 Consulting cosmic wisdom...',
      general: '💫 Validating your spiritual response...'
    };

    return (
      <div className="text-center mb-3" style={{ maxWidth: '100%', margin: '0 auto' }}>
        <div className="d-flex align-items-center justify-content-center p-3 bg-light rounded-3">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
            <span className="visually-hidden">Validating...</span>
          </div>
          <span className="text-muted">
            {loadingMessages[pathType || 'general']}
          </span>
        </div>
      </div>
    );
  };

  // Enhanced input bar with comprehensive validation feedback
  const renderInputBar = () => {
    const lengthHint = validateInputLength(message);
    const showInputValidation = true; // Always show validation for all paths
    
    return (
      <div className="mt-auto">
        {/* Real-time length feedback */}
        {lengthHint && (
          <div className="text-center mb-2">
            <small className="text-muted" style={{ fontSize: '0.85rem' }}>
              {lengthHint}
            </small>
          </div>
        )}
        
        <div 
          className={`d-flex align-items-center bg-white rounded-pill shadow-sm px-3 py-2 ${
            validationState.error ? 'border-warning' : ''
          }`}
          style={{ 
            border: validationState.error ? '1.5px solid #ffb74d' : 'none',
            boxShadow: validationState.error ? 
              '0 2px 8px rgba(255, 183, 77, 0.3)' : 
              '0 2px 8px rgba(80, 0, 120, 0.06)',
            transition: 'all 0.2s',
            maxWidth: '100%'
          }}
        >
          <button className="btn btn-link text-muted me-2 p-0" title="Attach file">
            <i className="bi bi-paperclip"></i>
          </button>
          
          <input
            type="text"
            className="form-control border-0 px-2 spiritual-input"
            placeholder={
              validationState.error ? "Let's try a more detailed response..." :
              "Share your authentic thoughts and feelings..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={validationState.isValidating}
            style={{ 
              background: 'transparent', 
              boxShadow: 'none',
              opacity: validationState.isValidating ? 0.7 : 1
            }}
          />
          
          <button className="btn btn-link text-muted mx-2 p-0" title="Record audio">
            <i className="bi bi-mic-fill"></i>
          </button>
          
          <button
            className="btn rounded-circle d-flex align-items-center justify-content-center"
            style={{ 
              width: '38px', 
              height: '38px',
              opacity: validationState.isValidating ? 0.7 : 1,
              background: 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 2px 8px rgba(80, 0, 120, 0.10)'
            }}
            onClick={handleSendMessage}
            disabled={!message.trim() || validationState.isValidating}
            title="Send"
          >
            {validationState.isValidating ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Validating...</span>
              </div>
            ) : (
              <i className="bi bi-arrow-up"></i>
            )}
          </button>
        </div>
        
        {/* Character/word count for longer responses */}
        {message.length > 20 && (
          <div className="text-center mt-1">
            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
              {message.length} characters • {message.split(' ').filter(w => w.length > 0).length} words
            </small>
          </div>
        )}
        
        {/* Attempt counter */}
        {validationState.attempts > 0 && (
          <div className="text-center mt-1">
            <small className="text-muted">
              Attempt {validationState.attempts + 1} of {validationState.maxAttempts}
            </small>
          </div>
        )}
      </div>
    );
  };

  if (!pathType) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f7f7fa' }}>
        <div className="text-center">
          <h3>Invalid Path</h3>
          <p>Please select a valid spiritual assessment path.</p>
          <button className="btn btn-primary" onClick={() => navigate('/onboarding-one')}>
            Choose Path
          </button>
        </div>
      </div>
    );
  }

    return (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#f7f7fa' }}>
      {/* Enhanced CSS with validation styles */}
      <style>{`
        @keyframes moveBar {
          0% { margin-left: -30%; }
          100% { margin-left: 100%; }
        }
        
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .validation-feedback {
          animation: slideInFromTop 0.3s ease-out;
        }
        
        .spiritual-input:focus {
          border-color: #6a1b9a !important;
          box-shadow: 0 0 0 0.2rem rgba(106, 27, 154, 0.25) !important;
        }
        
        .btn-outline-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(106, 27, 154, 0.3);
        }
        
        body.dark-mode {
          background: #232346 !important;
          color: #e0e0e0 !important;
        }
        
        body.dark-mode .sidebar {
          background: #232346 !important;
          color: #f3f3fa !important;
          border-right: 1.5px solid #34345a;
          box-shadow: 2px 0 16px 0 rgba(20,20,40,0.12);
        }
        
        body.dark-mode .bg-white, body.dark-mode .navbar, body.dark-mode .form-control {
          background: #26263a !important;
          color: #e0e0e0 !important;
          border: none !important;
        }
        
        body.dark-mode .form-control::placeholder {
          color: #b0b0d0 !important;
        }
        
        body.dark-mode .rounded-4.shadow-sm.p-4.mb-4.overflow-auto {
          background: #26263a !important;
          box-shadow: 0 2px 16px 0 rgba(20,20,40,0.10);
        }
        
        body.dark-mode .btn.btn-primary.rounded-circle {
          background: #7c3aed !important;
          border: none !important;
          color: #fff !important;
          box-shadow: 0 2px 8px 0 rgba(124,58,237,0.10);
        }
        
        /* Responsive sidebar behavior */
        @media (min-width: 768px) {
          .sidebar {
            position: fixed !important;
            left: 0 !important;
            height: 100vh !important;
            transform: none !important;
            z-index: 1000 !important;
          }
          
          .sidebar-backdrop {
            display: none !important;
          }
          
          .main-chat-area {
            margin-left: 270px !important;
            width: calc(100% - 270px) !important;
            max-width: none !important;
          }
          
          .chat-container {
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 20px !important;
          }
        }
        
        @media (max-width: 767px) {
          .sidebar {
            position: fixed !important;
            left: -290px !important;
          }
          
          .sidebar.open {
            left: 0 !important;
          }
          
          .main-chat-area {
            margin-left: 0 !important;
            width: 100% !important;
          }
          
          .chat-container {
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 15px !important;
          }
        }
      `}</style>

      {/* Left Sidebar - Desktop: always visible, Mobile: toggleable */}
      <nav className={`sidebar d-flex flex-column p-3 position-fixed h-100 d-md-block${sidebarOpen ? ' open' : ''}`} 
           style={{ 
             width: '270px', 
             background: '#fff', 
             borderRadius: '18px', 
             boxShadow: '0 4px 32px rgba(60,0,80,0.08)', 
             zIndex: 1050, 
             left: sidebarOpen ? 0 : '-290px', 
             transition: 'left 0.3s, box-shadow 0.3s', 
             border: 'none'
           }}>
        
        {/* User profile at top */}
        <div className="d-flex align-items-center mb-4 p-2" 
             style={{ background: 'linear-gradient(90deg, #ede7f6 0%, #f3e8ff 100%)', borderRadius: '12px' }}>
          <img 
            src={profile.profileImage || '/default-avatar.png'} 
            alt={profile.name || 'User'} 
            className="rounded-circle me-2" 
            style={{ border: '2px solid #a084e8', width: 38, height: 38, objectFit: 'cover', boxShadow: '0 2px 8px #e0d7fa' }} 
          />
          <div>
            <div className="fw-semibold" style={{ color: '#4b1fa7', fontSize: 15 }}>
              {profile.name || 'User'}
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>Online</div>
          </div>
        </div>
        
        {/* Branding */}
        <div className="mb-4 text-center">
          <span className="fw-bold" 
                style={{ 
                  fontSize: 22, 
                  background: 'linear-gradient(90deg, #7c3aed 0%, #4b1fa7 100%)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent', 
                  letterSpacing: '1px', 
                  textShadow: '0 2px 8px #e0d7fa' 
                }}>
            Eternal AI
          </span>
        </div>
        
        <ul className="nav nav-pills flex-column mb-auto gap-1">
          <li className="nav-item mb-1">
            <button className="btn w-100 py-2 rounded-3 d-flex align-items-center justify-content-start" 
                    style={{ 
                      background: '#3d1975', 
                      color: '#fff', 
                      fontWeight: 500, 
                      boxShadow: '0 2px 8px rgba(61,25,117,0.08)', 
                      transition: 'background 0.2s' 
                    }}>
              <i className="bi bi-chat-dots me-2" style={{ fontSize: 18 }}></i> New Chat
            </button>
          </li>
          <li className="mb-1">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-0 pe-0" style={{ color: '#b0b0b0' }}>
                <i className="bi bi-search"></i>
              </span>
              <input type="text" className="form-control bg-transparent border-0" 
                     style={{ color: '#888', fontSize: 15 }} placeholder="Search Chats" />
            </div>
          </li>
          <li className="mb-1">
            <a href="#" className="nav-link d-flex align-items-center" 
               style={{ color: '#7c3aed', fontWeight: 500, borderRadius: 8, transition: 'background 0.2s' }}>
              <i className="bi bi-clock-history me-2"></i> History
            </a>
          </li>
          <li className="mb-1">
            <a href="#" className="nav-link d-flex align-items-center" 
               style={{ color: '#b0b0b0', fontWeight: 400, borderRadius: 8, transition: 'background 0.2s' }}>
              <i className="bi bi-gear me-2"></i> Settings
            </a>
          </li>
        </ul>
        
        <div className="card p-3 mb-3 border-0 mt-auto" 
             style={{ 
               background: 'linear-gradient(135deg, #4b1fa7 0%, #7c3aed 100%)', 
               borderRadius: '18px', 
               boxShadow: '0 2px 12px rgba(76,31,167,0.10)' 
             }}>
          <div className="d-flex align-items-center mb-2">
            <span className="p-2 rounded-circle d-flex align-items-center justify-content-center" 
                  style={{ background: 'rgba(255,255,255,0.12)', marginRight: '10px' }}>
              <i className="bi bi-star-fill" style={{ color: '#fff700', fontSize: 18 }}></i>
            </span>
            <h6 className="card-title mb-0 text-white" style={{ fontWeight: 600, fontSize: 16 }}>
              Upgrade to Pro
            </h6>
          </div>
          <p className="card-text text-white-50 small mb-2" style={{ color: '#e0e0e0' }}>
            Unlock powerful features with our pro upgrade today!
          </p>
          <button className="btn btn-light btn-sm rounded-pill fw-bold" 
                  style={{ color: '#4b1fa7', transition: 'background 0.2s' }}>
            Upgrade now <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </nav>

      {/* Sidebar mobile overlay backdrop */}
      {sidebarOpen && (
        <div className="sidebar-backdrop d-md-none" 
             onClick={() => setSidebarOpen(false)} 
             style={{ 
               position: 'fixed', 
               top: 0, 
               left: 0, 
               width: '100vw', 
               height: '100vh', 
               background: 'rgba(40,0,60,0.25)', 
               zIndex: 1049, 
               transition: 'background 0.3s' 
             }} />
      )}

      {/* Sidebar toggle for mobile */}
      <button className="btn btn-primary d-md-none position-fixed" 
              style={{ 
                top: 20, 
                left: 20, 
                zIndex: 1100, 
                borderRadius: '50%', 
                background: '#4a148c', 
                border: 'none', 
                boxShadow: '0 2px 8px rgba(60,0,80,0.12)' 
              }} 
              onClick={() => setSidebarOpen(!sidebarOpen)}>
        <i className="bi bi-list" style={{ fontSize: 22 }}></i>
      </button>

      {/* Main Chat Area */}
      <div className="flex-grow-1 d-flex flex-column main-chat-area" 
           style={{ 
             background: '#f7f7fa', 
             backgroundImage: 'radial-gradient(#e0e0e0 1px, transparent 1px)', 
             backgroundSize: '20px 20px', 
             transition: 'margin-left 0.3s' 
           }}>
        
        {/* Animated purple progress bar at top */}
        <div style={{ 
          height: 4, 
          width: '100%', 
          background: 'linear-gradient(90deg, #7c3aed 0%, #4b1fa7 100%)', 
          position: 'sticky', 
          top: 0, 
          zIndex: 100, 
          overflow: 'hidden', 
          borderRadius: 2 
        }}>
          <div className="progress-bar-animated" 
               style={{ 
                 height: '100%', 
                 width: '30%', 
                 background: 'rgba(255,255,255,0.18)', 
                 animation: 'moveBar 1.5s linear infinite' 
               }}></div>
        </div>

        <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm p-3 mb-4 rounded-bottom" 
                style={{ borderRadius: '0 0 15px 15px' }}>
          <div className="d-flex align-items-center justify-content-end w-100">
              <button 
                className="btn btn-primary btn-sm rounded-pill me-2"
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
              <button className="btn btn-light rounded-circle me-2 d-flex align-items-center justify-content-center" 
                      style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-search"></i>
              </button>
              <button className="btn btn-light rounded-circle me-2 d-flex align-items-center justify-content-center" 
                      style={{ width: '36px', height: '36px' }} 
                      onClick={() => setDarkMode(dm => !dm)}>
                <i className={`bi ${darkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
              </button>
              <button className="btn btn-light rounded-circle me-2 d-flex align-items-center justify-content-center" 
                      style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-bell-fill"></i>
              </button>
          </div>
        </header>

        <div className="chat-container py-4 flex-grow-1 d-flex flex-column justify-content-between">
          {pathType && (
            <div className="flex-grow-1 d-flex flex-column">
              <div className="bg-white rounded-4 shadow-sm p-4 mb-4 overflow-auto" 
                   style={{ minHeight: '400px', maxHeight: 'calc(100vh - 300px)' }}>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="me-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" 
                             style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)' }}>
                          <span style={{ color: 'white', fontSize: 16 }}>✨</span>
                        </div>
                      </div>
                    )}
                    <div className={`p-3 rounded-4 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-light'}`} 
                         style={{ maxWidth: '70%',
                        background: msg.role === 'user' 
                          ? 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)' 
                          : undefined,
                        color: msg.role === 'user' ? '#fff' : undefined
                      }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Validation Components */}
              {renderValidationLoading()}
              {renderValidationFeedback()}
              
              {/* Enhanced Input Bar */}
              {renderInputBar()}

              {/* Report Generation Loading */}
              {generatingReport && (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h5>Generating your personalized report...</h5>
                  <p className="text-muted">This may take a moment while we analyze your responses.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reports Modal */}
      {showReportsModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
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
                <div className="row g-3">
                  {/* Aura Report */}
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
                  
                  {/* Vibrational Report */}
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
                  
                  {/* Karmic Report */}
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
                </div>
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
    </div>
  );
};

export default ChatHome;