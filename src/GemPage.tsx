import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { number } from 'framer-motion';

const GemPage = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);

  const diamondPackages = [
    {
      id: 1,
      diamonds: 100,
      price: 3.99,
      label: 'First choice',
      labelColor: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
      gems: 2
    },
    {
      id: 2,
      diamonds: 300,
      price: 8.99,
      gems: 3
    },
    {
      id: 3,
      diamonds: 1000,
      price: 19.99,
      originalPrice: 39.98,
      discount: '50% OFF',
      label: 'Most Popular',
      labelColor: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
      gems: 5,
      isPopular: true
    },
    {
      id: 4,
      diamonds: 2000,
      price: 29.99,
      gems: 6
    }
  ];

  const handlePackageSelect = (packageId: number) => {
    // setSelectedPackage(packageId);
  };

  interface DiamondGemsProps {
    count: number;
  }

  const DiamondGems: React.FC<DiamondGemsProps> = ({ count }) => {
    return (
      <div className="d-flex justify-content-center align-items-center mb-3">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="diamond-gem mx-1" 
            // style={{
            //   width: '24px',
            //   height: '24px',
            //   background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
            //   clipPath: '💎',
            //   transform: `rotate(${index * 15}deg)`,
            //   boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            // }}
          />
        ))}
      </div>
    );
  };

  return (
    <div 
      className="min-vh-100 d-flex flex-column"
      style={{
        background: 'linear-gradient(180deg, #2d1b69 0%, #1a0f2e 100%)',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: 320, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between p-4 border-bottom border-secondary">
        <button 
          className="btn btn-link text-white p-0 border-0"
          style={{ fontSize: '24px', textDecoration: 'none' }}
        >
          ×
        </button>
        <h4 className="mb-0 fw-bold">Buy More Diamonds</h4>
        <div style={{ width: '24px' }}></div>
      </div>

      {/* Premium Banner */}
      <div className="p-4">
        <div 
          className="d-flex align-items-center p-3 rounded-4 position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #ff6b6b, #8b5cf6)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="me-3">
            <span style={{ fontSize: '32px' }}>😊</span>
            <div 
              className="position-absolute"
              style={{
                top: '-10px',
                left: '40px',
                width: '60px',
                height: '40px',
                background: 'linear-gradient(135deg, #ffd700, #ffb347)',
                borderRadius: '20px 20px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '20px' }}>👑</span>
            </div>
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <span className="fw-bold me-2">Premium</span>
              <span 
                className="badge px-2 py-1 rounded-pill"
                style={{
                  background: 'linear-gradient(135deg, #ffd700, #ffb347)',
                  color: '#000',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                PRO
              </span>
            </div>
            <div style={{ opacity: 0.9 }}>Upgrade to enable unlimited chat</div>
          </div>
          <div className="text-white">
            <span style={{ fontSize: '18px' }}>›</span>
          </div>
        </div>
      </div>

      {/* Diamonds Info */}
      <div className="px-4 mb-4">
        <h5 className="mb-3 fw-bold">Diamonds</h5>
        <div className="d-flex align-items-center mb-2">
          <span className="me-2" style={{ fontSize: '20px', color: '#8b5cf6' }}>💎</span>
          <span>Each message sent consumes 1 diamond</span>
        </div>
        <div className="d-flex align-items-center">
          <span className="me-2" style={{ fontSize: '20px', color: '#8b5cf6' }}>💎</span>
          <span>Use diamonds to Buy emoticon card</span>
        </div>
      </div>

      {/* Diamond Packages */}
      <div className="px-4 flex-grow-1">
        <div className="row g-3 justify-content-center">
          {diamondPackages.map((pkg) => (
            <div key={pkg.id} className="col-12 d-flex justify-content-center">
              <div
                className={`position-relative rounded-4 p-4 text-center h-100 cursor-pointer transition-all ${
                  selectedPackage === pkg.id ? 'border-2 border-primary' : ''
                }`}
                style={{
                  background: '#fff',
                  maxWidth: 260,
                  width: '100%',
                  color: '#111',
                  border: pkg.isPopular
                    ? '2px solid rgba(255, 107, 107, 0.5)'
                    : '1px solid #eee',
                  boxShadow: '0 4px 24px #e1bee733',
                  margin: '0 auto',
                  cursor: 'pointer',
                  minHeight: 320,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
                onClick={() => handlePackageSelect(pkg.id)}
              >
                {/* Label */}
                {pkg.label && (
                  <div 
                    className="position-absolute top-0 start-50 translate-middle-x px-3 py-1 rounded-pill text-white fw-bold"
                    style={{
                      background: pkg.labelColor,
                      fontSize: '12px',
                      marginTop: '-8px',
                      zIndex: 2
                    }}
                  >
                    {pkg.label}
                  </div>
                )}

                {/* Discount Badge */}
                {pkg.discount && (
                  <div 
                    className="position-absolute top-0 end-0 px-2 py-1 rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      background: 'linear-gradient(135deg, #ffd700, #ffb347)',
                      color: '#000',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      width: '50px',
                      height: '50px',
                      marginTop: '-10px',
                      marginRight: '-10px',
                      zIndex: 2
                    }}
                  >
                    {pkg.discount}
                  </div>
                )}

                {/* Title with gradient */}
                <div style={{
                  fontWeight: 700,
                  fontSize: 22,
                  marginBottom: 10,
                  background: 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: 0.5,
                  textAlign: 'center',
                  marginTop: 24
                }}>
                  {pkg.diamonds} Diamonds
                </div>

                {/* Diamond Gems */}
                <div style={{ marginTop: pkg.label ? '20px' : '10px' }}>
                💎
                  <DiamondGems count={pkg.gems} />
                </div>

                {/* Price */}
                <div className="fw-bold mb-2" style={{ fontSize: '24px', color: '#111' }}>
                  ${pkg.price}
                </div>
                {pkg.originalPrice && (
                  <div 
                    className="text-muted text-decoration-line-through mb-1"
                    style={{ fontSize: '14px' }}
                  >
                    ${pkg.originalPrice}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      <div className="p-4 mt-4">
        <button 
          className="btn w-100 py-3 rounded-pill fw-bold border-0"
          style={{
            background: 'linear-gradient(135deg, #ff6b6b, #8b5cf6)',
            color: 'white',
            fontSize: '18px',
            boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)'
          }}
        >
          Subscribe now
        </button>
        <div className="text-center mt-3">
          <small className="text-black">
            By click "Continue" means that you accept our
          </small>
        </div>
      </div>
      </div>
    </div>
  );
};

export default GemPage;