import React, { useState } from 'react';
import image from './onboardhome.jpg';
import { useNavigate } from 'react-router-dom'; 
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { useAuth } from './context/AuthContext';

const OnboardingOne: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const { currentUser } = useAuth();

  const options = [
    { 
      id: 'aura-perception', 
      label: 'Aura Perception', 
      color: '#ffd700', 
      desc: 'Discover the colors and energies that surround your spirit through energy field analysis',
      path: '/chat?path=aura'
    },
    { 
      id: 'vibrational-frequency', 
      label: 'Vibrational Frequency', 
      color: '#e63946', 
      desc: 'Measure your current energy vibration and spiritual frequency level',
      path: '/chat?path=vibrational'
    },
    { 
      id: 'karmic-awareness', 
      label: 'Life Prediction', 
      color: '#bfc9ca', 
      desc: 'Explore potential pathways and upcoming opportunities in your personal journey through intuitive guidance',
      path: '/chat?path=karmic'
    }
  ];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const saveOnboardingAnswer = async (step: string, value: string) => {
    if (currentUser) {
      await setDoc(doc(db, 'userOnboarding', currentUser.uid), {
        [step]: value
      }, { merge: true });
    }
  };

  const handleNext = async () => {
    if (selectedOption) {
      await saveOnboardingAnswer('soulPath', selectedOption);
      const selectedPath = options.find(opt => opt.id === selectedOption);
      if (selectedPath) {
        navigate(selectedPath.path);
      }
    }
  };

  // SVG Icons for each option
  const renderIcon = (optionId: string, color: string) => {
    const iconProps = {
      width: "32",
      height: "32",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: color,
      strokeWidth: "2"
    };

    switch(optionId) {
      case 'aura-perception':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        );
      case 'vibrational-frequency':
        return (
          <svg {...iconProps}>
            <path d="M2 10h4l2-8 4 16 2-8h4"/>
          </svg>
        );
      case 'karmic-awareness':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 12h8"/>
            <path d="M12 8v8"/>
            <path d="M16.24 7.76l-8.48 8.48"/>
            <path d="M7.76 7.76l8.48 8.48"/>
          </svg>
        );
      default:
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10"/>
          </svg>
        );
    }
  };

  return (
    <>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <style>{`
        .journey-container {
          background: #ffffff;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .sparkle {
          position: absolute;
          color: #8b5cf6;
          font-size: 1.5rem;
          animation: sparkle 3s ease-in-out infinite;
        }
        
        .sparkle-1 {
          top: 10%;
          right: 15%;
          animation-delay: 0s;
        }
        
        .sparkle-2 {
          top: 30%;
          right: 5%;
          animation-delay: 1s;
        }
        
        .sparkle-3 {
          bottom: 40%;
          right: 20%;
          animation-delay: 2s;
        }
        
        .sparkle-4 {
          bottom: 20%;
          right: 8%;
          animation-delay: 1.5s;
        }
        
        .sparkle-5 {
          bottom: 15%;
          left: 50%;
          animation-delay: 0.5s;
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        .chakra-image {
          width: 707px;
          height: 950px;
          max-width: 100%;
          max-height: 90vh;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .chakra-image img {
          width: 100%;
          height: auto;
          max-width: 100%;
          max-height: 100%;
          border-radius: 16px;
          object-fit: cover;
        }
        
        .selection-box {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          position: relative;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .step-indicator {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          color: #6b7280;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .step-icon {
          color: #8b5cf6;
          font-size: 1rem;
        }
        
        .main-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        
        .subtitle {
          color: #6b7280;
          font-size: 0.95rem;
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .options-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        
        .option-card {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .option-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .option-card.selected {
          border-color: #8b5cf6;
          background: #f3f4f6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        .option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.1);
          flex-shrink: 0;
        }
        
        .option-content {
          flex: 1;
        }
        
        .option-label {
          font-weight: 600;
          color: #374151;
          font-size: 1.1rem;
          margin: 0 0 0.5rem 0;
        }
        
        .option-desc {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.4;
        }
        
        .action-buttons {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
        }
        
        .btn-next {
          background: linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%);
          border: none;
          color: white;
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          box-shadow: 0 4px 15px rgba(106, 27, 154, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .btn-next:hover {
          background: linear-gradient(135deg, #7b1fa2 0%, #512da8 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(106, 27, 154, 0.4);
          color: white;
          text-decoration: none;
        }
        
        .btn-next:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .journey-container {
            padding: 1rem;
          }
          
          .option-card {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem 1rem;
          }
          
          .option-icon {
            width: 40px;
            height: 40px;
          }
          
          .selection-box {
            padding: 2rem 1.5rem;
          }
          
          .main-title {
            font-size: 1.5rem;
          }
        }
        
        @media (max-width: 991px) {
          .chakra-image {
            width: 400px;
            height: 540px;
            max-width: 100%;
            max-height: 60vh;
          }
        }
        
        @media (max-width: 576px) {
          .selection-box {
            padding: 1.5rem 1rem;
          }
          
          .main-title {
            font-size: 1.25rem;
          }
          
          .sparkle {
            font-size: 1.2rem;
          }
          .chakra-image {
            width: 100vw;
            height: auto;
            max-width: 100vw;
            max-height: 50vh;
            padding: 8px;
          }
          .chakra-image img {
            border-radius: 10px;
          }
        }
      `}</style>

      <div className="journey-container">
        {/* Animated Sparkles */}
        <div className="sparkle sparkle-1">✦</div>
        <div className="sparkle sparkle-2">✦</div>
        <div className="sparkle sparkle-3">✦</div>
        <div className="sparkle sparkle-4">✦</div>
        <div className="sparkle sparkle-5">✦</div>

        <div className="container-fluid h-100">
          <div className="row align-items-center">
            {/* Left Section - Image */}
            <div className="col-lg-6 d-flex justify-content-center align-items-center p-4">
              <div className="chakra-image">
                <img src={image} alt="Spiritual Journey" style={{width: '100%', height: '100%', objectFit: 'cover',borderRadius: '16px'}} />
              </div>
            </div>
            {/* Right Section - Selection Box */}
            <div className="col-lg-6 d-flex justify-content-center align-items-center p-4">
              <div className="selection-box" style={{maxWidth: 800, width: '100%'}}>
                {/* Step Indicator */}
                <div className="step-indicator">
                  <span className="step-icon">✦</span>
                  <span>{currentStep}/{totalSteps}</span>
                </div>
                
                {/* Decode Your Spiritual Path Section */}
                <div className="aura-section" style={{marginBottom: '2rem', textAlign: 'center'}}>
                  <h2 style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '1.5rem',
                    color: '#7c3aed',
                    letterSpacing: '1px',
                    marginBottom: '0.5rem',
                    textShadow: '0 0 8px #e0b3ff, 0 0 16px #fffbe6'
                  }}>Choose Your Spiritual Path</h2>
                  <p style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    color: '#6b7280',
                    fontSize: '1.1rem',
                    marginBottom: '1rem',
                    lineHeight: 1.5
                  }}>
                    Select the spiritual assessment that resonates most with your current journey. Each path offers unique insights into your energetic signature.
                  </p>
                  <div style={{display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '0.5rem'}}>
                    <span style={{width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle, #ff2d55 60%, #ffb3b3 100%)', boxShadow: '0 0 16px #ff2d55aa', display: 'inline-block'}} />
                    <span style={{width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle, #ff9500 60%, #ffe0b3 100%)', boxShadow: '0 0 16px #ff9500aa', display: 'inline-block'}} />
                    <span style={{width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle, #ffcc00 60%, #fffbe6 100%)', boxShadow: '0 0 16px #ffcc00aa', display: 'inline-block'}} />
                    <span style={{width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle, #4cd964 60%, #b3ffd9 100%)', boxShadow: '0 0 16px #4cd964aa', display: 'inline-block'}} />
                    <span style={{width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle, #5ac8fa 60%, #b3e6ff 100%)', boxShadow: '0 0 16px #5ac8faaa', display: 'inline-block'}} />
                    <span style={{width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle, #007aff 60%, #b3c6ff 100%)', boxShadow: '0 0 16px #007affaa', display: 'inline-block'}} />
                    <span style={{width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle, #5856d6 60%, #e0b3ff 100%)', boxShadow: '0 0 16px #5856d6aa', display: 'inline-block'}} />
                  </div>
                </div>
                
                {/* Main Content */}
                <h2 className="main-title">Which Path Calls to Your Soul?</h2>
                <p className="subtitle">Choose your spiritual assessment to begin your journey of discovery.</p>
                
                {/* Options Grid */}
                <div className="options-grid">
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className={`option-card ${selectedOption === option.id ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(option.id)}
                    >
                      <div className="option-icon">
                        {renderIcon(option.id, option.color)}
                      </div>
                      <div className="option-content">
                        <h3 className="option-label">{option.label}</h3>
                        <p className="option-desc">{option.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Action Buttons */}
                <div className="action-buttons">
                  <button 
                    className="btn-next" 
                    onClick={handleNext}
                    disabled={!selectedOption}
                  >
                    Begin Journey
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingOne;