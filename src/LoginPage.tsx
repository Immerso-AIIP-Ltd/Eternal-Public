import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import background from './background.png'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase/config';
import { getDoc, doc } from "firebase/firestore";
import logo from './google-logo.png'
 
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const hasShownWelcome = useRef(false);
 
  const sparkles = [
    { top: '10%', left: '5%', size: '12px', delay: '0s' },
    { top: '20%', right: '8%', size: '16px', delay: '1s' },
    { top: '60%', left: '3%', size: '10px', delay: '2s' },
    { top: '80%', right: '12%', size: '14px', delay: '0.5s' },
    { top: '25%', left: '15%', size: '8px', delay: '1.5s' },
    { top: '45%', right: '5%', size: '12px', delay: '2.5s' },
    { top: '70%', left: '8%', size: '16px', delay: '3s' },
    { top: '35%', right: '15%', size: '10px', delay: '0.8s' }
  ];
 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear field errors when user starts typing
    if (fieldErrors[e.target.name as keyof typeof fieldErrors]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: ''
      });
    }
  };
 
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user) throw new Error('No user info received from Google');

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        setError('Account does not exist. Please sign up using Google on the Sign Up page.');
        setIsLoading(false);
        return;
      }

      setSuccess('You have logged in successfully!');
      const reportDocRef = doc(db, 'karmicReports', user.uid);
      const reportDocSnap = await getDoc(reportDocRef);

      setTimeout(() => {
        if (reportDocSnap.exists()) {
          navigate('/home');
        } else {
          navigate('/profile-creation');
        }
      }, 1500);
    } catch (err: any) {
      console.error('Google login error:', err.message);
      setError('Google login error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({ email: '', password: '' });
    setIsLoading(true);
 
    let hasError = false;
    const newErrors = { email: '', password: '' };
 
    const { email, password } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      hasError = true;
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      hasError = true;
    }
    if (hasError) {
      setFieldErrors(newErrors);
      setIsLoading(false);
      return;
    }
 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setSuccess('You have logged in successfully!');
      const reportDoc = await getDoc(doc(db, 'karmicReports', user.uid));
     
      setTimeout(() => {
        if (reportDoc.exists()) {
          navigate('/home');
        } else {
          navigate('/profile-creation');
        }
      }, 1500);
    } catch (err: any) {
      console.error('Login error:', err.message);
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div className="eternal-ai-fullscreen">
      <style>{`
        .eternal-ai-fullscreen {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #f3e8ff, #fdf2f8, #fef2f2);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
 
        .sparkle {
          position: absolute;
          width: 20px;
          height: 20px;
          opacity: 0.7;
          animation: sparkle 3s ease-in-out infinite;
          z-index: 1;
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
 
        .main-content {
          position: relative;
          z-index: 2;
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
        }
 
        .left-section {
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }
 
        .right-section {
          background: transparent;
          backdrop-filter: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 100vh;
          border-left: none;
          max-width: 600px;
          width: 100%;
        }
 
        .login-section {
          padding: 40px 32px;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          backdrop-filter: none;
          border: none;
          max-width: 480px;
          width: 100%;
          margin: 0 auto;
          position: relative;
        }
 
        .brand-text {
          color: #00bcd4;
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 2rem;
          letter-spacing: 1px;
          text-align: center;
        }
 
        .hero-title {
          color: #4a1a4a;
          font-size: 3.2rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          text-shadow: 0 2px 4px rgba(74, 26, 74, 0.1);
        }
 
        .hero-description {
          color: #6b6b6b;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 3rem;
          max-width: 500px;
        }
 
        .login-section h2 {
          color: #2c3e50;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 8px;
          text-align: center;
          justify-content: center;
        }
 
        .login-section h3 {
          color: #6b6b6b;
          font-size: 1.1rem;
          font-weight: 400;
          margin-bottom: 2rem;
          text-align: center;
        }
 
        .form-group {
          margin-bottom: 1.5rem;
        }
 
        .form-label {
          color: #2c3e50;
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: block;
          font-size: 0.95rem;
        }
 
        .form-control {
          border: 2px solid #e1e8ed;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
          width: 100%;
        }
 
        .form-control:focus {
          border-color: #6a1b9a;
          box-shadow: 0 0 0 0.2rem rgba(106, 27, 154, 0.15);
          background: white;
          outline: none;
        }
 
        .form-control.error {
          border-color: #e74c3c;
        }
 
        .password-input-wrapper {
          position: relative;
        }
 
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b6b6b;
          cursor: pointer;
          padding: 4px;
          font-size: 1.2rem;
        }
 
        .password-toggle:hover {
          color: #6a1b9a;
        }
 
        .btn-login {
          background: linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.1rem;
          width: 100%;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
 
        .btn-login:hover:not(:disabled) {
          background: linear-gradient(135deg, #7b1fa2 0%, #512da8 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(106, 27, 154, 0.3);
        }
 
        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
 
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s ease-in-out infinite;
          margin-right: 8px;
        }
 
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
 
        .divider {
          text-align: center;
          margin: 2rem 0;
          color: #6b6b6b;
          position: relative;
        }
 
        .divider span {
          background: rgba(255, 255, 255, 0.95);
          padding: 0 1rem;
          position: relative;
          z-index: 2;
          font-weight: 500;
        }
 
        .btn-google {
          border: 2px solid #e1e8ed;
          background: white;
          color: #2c3e50;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 500;
          width: 100%;
          text-align: center;
          text-decoration: none;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 1.5rem;
        }
 
        .btn-google:hover {
          border-color: #6a1b9a;
          color: #6a1b9a;
          text-decoration: none;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
 
        .signup-link {
          text-align: center;
          color: #6b6b6b;
          font-size: 0.95rem;
        }
 
        .signup-link a {
          color: #6a1b9a;
          text-decoration: none;
          font-weight: 600;
        }
 
        .signup-link a:hover {
          text-decoration: underline;
        }
 
        .error-message {
          color: #e74c3c;
          font-size: 0.85rem;
          margin-top: 0.5rem;
          font-weight: 500;
        }
 
        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-weight: 500;
          text-align: center;
        }
 
        .alert-success {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
        }
 
        .alert-error {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
 
        .rotate-image-bg {
          width: 600px;
          height: 600px;
          animation: rotateAnimation 20s linear infinite;
        }
 
        @keyframes rotateAnimation {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
 
        /* Mobile Responsive */
        @media (max-width: 1200px) {
          .right-section {
            padding: 40px 40px;
            max-width: 540px;
          }
          .login-section {
            padding: 32px 24px;
            max-width: 420px;
          }
        }
 
        @media (max-width: 991px) {
          .left-section,
          .right-section {
            padding: 40px 30px;
            min-height: auto;
          }
         
          .hero-title {
            font-size: 2.5rem;
            text-align: center;
          }
         
          .hero-description {
            text-align: center;
            margin: 0 auto 2rem auto;
          }
         
          .brand-text {
            text-align: center;
          }
         
          .right-section {
            background: rgba(255, 255, 255, 0.98);
            border-left: none;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 100%;
          }
 
          .login-section {
            padding: 32px 24px;
            max-width: 100%;
          }
 
          .rotate-image-bg {
            width: 500px;
            height: 500px;
          }
        }
 
        @media (max-width: 768px) {
          .left-section,
          .right-section {
            padding: 30px 20px;
          }
         
          .hero-title {
            font-size: 2.2rem;
          }
         
          .sparkle {
            display: none;
          }
 
          .login-section {
            padding: 24px 20px;
            border-radius: 16px;
          }
 
          .rotate-image-bg {
            width: 400px;
            height: 400px;
            opacity: 0.1;
          }
        }
 
        @media (max-width: 576px) {
          .hero-title {
            font-size: 1.8rem;
          }
         
          .left-section,
          .right-section {
            padding: 20px 15px;
          }
 
          .login-section {
            padding: 20px 16px;
            margin: 0 10px;
          }
 
          .rotate-image-bg {
            width: 300px;
            height: 300px;
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
      <div className="main-content">
        <div className="container-fluid h-100">
          <div className="row h-100">
            {/* Left Section */}
            <div className="col-lg-7 col-12 position-relative">
              <div className="left-section">
                {/* Rotating Background Image */}
                <img
                  src={background}
                  alt="Rotating Background"
                  className="rotate-image-bg"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 0,
                    opacity: 0.12,
                    pointerEvents: 'none'
                  }}
                />
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '60vh'
                }}>
                  <div className="brand-text">
                    ETERNAL AI
                  </div>
                  <h1 className="hero-title">
                    Discover Your Cosmic Path
                  </h1>
                  <p className="hero-description">
                    Connect with Eternal AI and explore your spiritual journey through personalized insights and cosmic guidance.
                  </p>
                </div>
              </div>
            </div>
 
            {/* Right Section - Login Form */}
            <div className="col-lg-5 col-12">
              <div className="right-section">
                <div className="login-section">
                  {/* Success/Error Messages */}
                  {success && (
                    <div className="alert alert-success">
                      {success}
                    </div>
                  )}
                  {error && (
                    <div className="alert alert-error">
                      {error}
                      {error.includes('Account does not exist') && (
                        <>
                          <br />
                          <a href="/signup" style={{ color: '#6a1b9a', textDecoration: 'underline' }}>Sign up with Google</a>
                        </>
                      )}
                    </div>
                  )}
 
                  <h2>
                    Welcome Back! 👋
                  </h2>
                  <h3>Sign in to your account</h3>
                 
                  <form onSubmit={handleLogin}>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className={`form-control ${fieldErrors.email ? 'error' : ''}`}
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        disabled={isLoading}
                      />
                      {fieldErrors.email && (
                        <div className="error-message">{fieldErrors.email}</div>
                      )}
                    </div>
                   
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`form-control ${fieldErrors.password ? 'error' : ''}`}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? '👁️' : '🙈'}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <div className="error-message">{fieldErrors.password}</div>
                      )}
                    </div>
                   
                    <button
                      type="submit"
                      className="btn-login"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="loading-spinner"></span>
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>
                 
                  <div className="divider">
                    <span>or continue with</span>
                  </div>
                 
                  <button
                    className="btn-google"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <img
                      src={logo}
                      alt="Google Logo"
                      style={{width: '20px', height: '20px'}}
                    />
                    Sign in with Google
                  </button>
                 
                  <div className="signup-link">
                    Don't have an account? <a href="/signup">Sign up here</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default LoginPage;
 