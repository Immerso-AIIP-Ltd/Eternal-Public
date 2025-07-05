import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const LandingPage: React.FC = () => {
  const sparkles = [
    { top: '15%', left: '8%', size: '12px', delay: '0s' },
    { top: '25%', left: '85%', size: '16px', delay: '1s' },
    { top: '45%', left: '12%', size: '10px', delay: '2s' },
    { top: '65%', left: '75%', size: '14px', delay: '0.5s' },
    { top: '80%', left: '20%', size: '8px', delay: '1.5s' },
    { top: '35%', right: '10%', size: '12px', delay: '2.5s' },
    { top: '55%', left: '5%', size: '16px', delay: '3s' },
    { top: '75%', right: '15%', size: '10px', delay: '0.8s' }
  ];

  return (
    <div className="eternal-ai-container">
      <style>{`
        .eternal-ai-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #e8d5ff 0%, #f0e6ff 25%, #fff0f8 50%, #ffe6f0 75%, #ffd9e6 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 0;
        }

        .sparkle {
          position: absolute;
          width: 20px;
          height: 20px;
          opacity: 0.7;
          animation: sparkle 3s ease-in-out infinite;
        }

        .sparkle::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #9d4edd, transparent);
          border-radius: 1px;
        }

        .sparkle::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(90deg);
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #9d4edd, transparent);
          border-radius: 1px;
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .hero-section {
          text-align: center;
          z-index: 10;
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .brand-text {
          color: #00bcd4;
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          letter-spacing: 0.5px;
        }

        .hero-title {
          color: #4a1a4a;
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 2rem;
          text-shadow: 0 2px 4px rgba(74, 26, 74, 0.1);
        }

        .hero-description {
          color: #6b6b6b;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 3rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
        }

        .btn-demo {
          background: white;
          color: #4a1a4a;
          border: 2px solid #e0e0e0;
          padding: 12px 30px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .btn-demo:hover {
          background: #f8f9fa;
          border-color: #4a1a4a;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          color: #4a1a4a;
          text-decoration: none;
        }

        .btn-signin {
          background: linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(106, 27, 154, 0.3);
        }

        .btn-signin:hover {
          background: linear-gradient(135deg, #7b1fa2 0%, #512da8 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(106, 27, 154, 0.4);
          color: white;
          text-decoration: none;
        }

        .rocket-icon {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-description {
            font-size: 1rem;
            padding: 0 10px;
          }
          
          .cta-buttons {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          
          .btn-demo,
          .btn-signin {
            width: 100%;
            max-width: 280px;
            margin: 0 auto;
            justify-content: center;
          }
          
          .sparkle {
            display: none;
          }
        }

        @media (max-width: 576px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .brand-text {
            font-size: 1rem;
          }
          
          .hero-section {
            padding: 20px 15px;
          }
        }

        @media (min-width: 1200px) {
          .hero-title {
            font-size: 4rem;
          }
        }
      `}</style>

      {/* Animated Sparkles */}
      {sparkles.map((sparkle, index) => (
        <div
          key={index}
          className="sparkle"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            right: sparkle.right,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: sparkle.delay
          }}
        />
      ))}

      {/* Main Content */}
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="hero-section">
              <div className="brand-text">
                Eternal AI
              </div>
              
              <h1 className="hero-title">
              Eternal AI is your personal companion for inner growth<br />
              and exploration.
              </h1>
              
              <p className="hero-description">
              Eternal AI empowers you to reflect, grow, and connect deeply with your spiritual self. Through thoughtful prompts, intelligent guidance, and a serene interface, it helps you navigate your inner journey. Whether you're journaling, meditating, or seeking clarity, Eternal is here to walk with you—every step, every insight, every breakthrough.
              </p>
              
              <div className="cta-buttons">
                <a href="#" className="btn-demo">
                  <svg className="rocket-icon" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L22 12L13.09 15.74L12 22L10.91 15.74L2 12L10.91 8.26L12 2Z"/>
                  </svg>
                  Start Demo
                </a>
                
                <a href="/login" className="btn-signin">
                  Sign in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;