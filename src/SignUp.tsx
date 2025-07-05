import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import background from './background.png';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, db } from './firebase/config';
import { useNavigate } from 'react-router-dom';
import logo from './google-logo.png'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
 
 
 
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showRewritePassword, setShowRewritePassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rewritePassword: '',
    confirmPassword: '',
    fullName: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    rewritePassword: ''
  });
 
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({ email: '', password: '', rewritePassword: '' });
    setLoading(true);
 
    let hasError = false;
    const newErrors = { email: '', password: '', rewritePassword: '' };
 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      hasError = true;
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
      hasError = true;
    }
    if (formData.password !== formData.rewritePassword) {
      newErrors.rewritePassword = 'Passwords do not match';
      hasError = true;
    }
    if (hasError) {
      setFieldErrors(newErrors);
      setLoading(false);
      return;
    }
 
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: formData.fullName });
      // Store user in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: formData.email,
        fullName: formData.fullName,
        createdAt: serverTimestamp(),
      });
      setSuccess('Account created successfully!');
      // Check if user already has a report
      const reportDoc = await getDoc(doc(db, 'userResults', user.uid));
      setTimeout(() => {
        if (reportDoc.exists()) {
          navigate('/report');
        } else {
          navigate('/profile-creation');
        }
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
 
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setSuccess('Account created successfully!');
      // Check if user already has a report
      const reportDoc = await getDoc(doc(db, 'userResults', user.uid));
      setTimeout(() => {
        if (reportDoc.exists()) {
          navigate('/report');
        } else {
          navigate('/SignUp');
        }
      }, 1800);
    } catch (err: any) {
      console.error('Google login error:', err.message);
      setError('Google login error: ' + err.message);
    }
  };
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
  };
 
  return (
    <div className="eternal-ai-fullscreen">
      <style>{`
        .eternal-ai-fullscreen {
          min-height: 100vh;
          background: #ffffff;
          background: #ffffff;
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
 
        .rotating-svg {
          position: absolute;
          top: 50%;
          left: 25%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          opacity: 0.1;
          animation: rotate 30s linear infinite;
          z-index: 1;
        }
 
        @keyframes rotate {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
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
          background: #ffffff;
          //  background: linear-gradient(135deg, #e8d5ff 0%, #f0e6ff 25%, #fff0f8 50%, #ffe6f0 75%, #ffd9e6 100%);
        }
 
        .right-section {
          background: #ffffff;
          backdrop-filter: blur(10px);
          padding: 60px 120px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 100vh;
          border-left: 1px solid rgba(255, 255, 255, 0.2);
          max-width: 900px;
          width: 100%;
          margin: 0 auto;
        }
 
        .signup-section {
          padding: 40px 56px;
          border-radius: 16px;
          background: rgba(255,255,255,0.98);
          box-shadow: 0 2px 16px rgba(0,0,0,0.04);
          max-width: 800px;
          width: 100%;
          margin: 0 auto;
        }
 
        .brand-text {
          color: #00bcd4;
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 2rem;
          letter-spacing: 0.5px;
          text-align: center;
        }
 
        .hero-title {
          color: #4a1a4a;
          font-size: 3rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 2rem;
          text-shadow: 0 2px 4px rgba(74, 26, 74, 0.1);
        }
 
        .hero-description {
          color: #6b6b6b;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 3rem;
          max-width: 500px;
        }
 
        .btn-demo {
          background: linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          display: block;
          width: 100%;
          max-width: 260px;
          margin: 0 auto 1rem auto;
          box-shadow: 0 4px 15px rgba(106, 27, 154, 0.3);
        }
 
        .btn-demo:hover {
          background: linear-gradient(135deg, #7b1fa2 0%, #512da8 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(106, 27, 154, 0.4);
          color: white;
          text-decoration: none;
        }
 
        .signup-section h2 {
          color: #2c3e50;
          font-size: clamp(1.3rem, 4vw, 1.8rem);
          font-weight: 600;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
 
        .signup-section h3 {
          color: #2c3e50;
          font-size: clamp(1rem, 3vw, 1.2rem);
          font-weight: 500;
          margin-bottom: 2rem;
        }
 
        .form-group {
          margin-bottom: 1.2rem;
        }
 
        .form-label {
          color: #2c3e50;
          font-weight: 500;
          margin-bottom: 0.5rem;
          display: block;
        }
 
        .form-control {
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: clamp(1rem, 2.5vw, 1.1rem);
          transition: all 0.3s ease;
          background: white;
        }
 
        .form-control:focus {
          border-color: #6a1b9a;
          box-shadow: 0 0 0 0.2rem rgba(106, 27, 154, 0.25);
          background: white;
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
        }
 
        .btn-signup {
          background: linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: clamp(1rem, 2.5vw, 1.1rem);
          width: 100%;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }
 
        .btn-signup:hover {
          background: linear-gradient(135deg, #7b1fa2 0%, #512da8 100%);
          transform: translateY(-1px);
        }
 
        .divider {
          text-align: center;
          margin: 1.5rem 0;
          color: #6b6b6b;
          position: relative;
        }
 
        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e1e8ed;
          z-index: 1;
        }
 
        .divider span {
          background: rgba(255, 255, 255, 0.95);
          padding: 0 1rem;
          position: relative;
          z-index: 2;
        }
 
        .social-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
 
        .btn-google,
        .btn-guest {
          border: 2px solid #e1e8ed;
          background: white;
          color: #2c3e50;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 500;
          flex: 1;
          text-align: center;
          text-decoration: none;
          transition: all 0.3s ease;
        }
 
        .btn-google:hover,
        .btn-guest:hover {
          border-color: #6a1b9a;
          color: #6a1b9a;
          text-decoration: none;
        }
 
        .login-link {
          text-align: center;
          color: #6b6b6b;
        }
 
        .login-link a {
          color: #6a1b9a;
          text-decoration: none;
          font-weight: 500;
        }
 
        .login-link a:hover {
          text-decoration: underline;
        }
 
        /* Mobile Responsive */
        @media (max-width: 991px) {
          .rotating-svg {
            width: 400px;
            height: 400px;
            left: 50%;
            top: 20%;
          }
         
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
         
          .btn-demo {
            margin: 0 auto;
          }
         
          .right-section {
            background: rgba(255, 255, 255, 0.98);
            border-left: none;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
          }
          .signup-section {
            padding: 32px 10px;
            max-width: 100vw;
          }
        }
 
        @media (max-width: 768px) {
          .rotating-svg {
            width: 300px;
            height: 300px;
            opacity: 0.05;
          }
         
          .left-section,
          .right-section {
            padding: 24px 2vw;
          }
         
          .hero-title {
            font-size: 2rem;
          }
         
          .social-buttons {
            flex-direction: column;
          }
         
          .btn-google,
          .btn-guest {
            width: 100%;
            min-width: unset;
            font-size: 1rem;
          }
         
          .sparkle {
            display: none;
          }
          .right-section {
            padding: 30px 20px;
          }
          .signup-section {
            padding: 20px 2vw;
            max-width: 100vw;
          }
        }
 
        @media (max-width: 576px) {
          .hero-title {
            font-size: 1.8rem;
          }
         
          .left-section,
          .right-section {
            padding: 12px 0;
          }
          .right-section {
            padding: 20px 15px;
            max-width: 100vw;
          }
          .signup-section {
            padding: 10px 0;
            max-width: 100vw;
          }
          .main-content {
            flex-direction: column;
          }
        }
 
        @media (max-width: 1200px) {
          .right-section {
            padding: 40px 40px;
            max-width: 520px;
          }
          .signup-section {
            padding: 32px 16px;
            max-width: 420px;
          }
        }
 
        @media (max-width: 991px) {
          .right-section {
            padding: 32px 16px;
            max-width: 100vw;
          }
          .signup-section {
            padding: 24px 8px;
            max-width: 100vw;
          }
        }
 
        .rotate-image-bg {
          width: 500px;
          height: 500px;
          animation: rotateAnimation 5s linear infinite;
        }
 
        @keyframes rotateAnimation {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
 
        .form-control, .btn-signup, .btn-google, .btn-guest {
          width: 100%;
          min-height: 48px;
          font-size: clamp(1rem, 2.5vw, 1.1rem);
        }
 
        .btn-signup, .btn-google, .btn-guest {
          min-height: 48px;
          font-size: clamp(1rem, 2.5vw, 1.1rem);
        }
 
        .btn-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px; /* Space between icon and text */
        }
        .btn-google img, .btn-google svg {
          vertical-align: middle;
          height: 20px;
          width: 20px;
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
 
      {/* Rotating Background SVG */}
 
 
      {/* Main Content */}
      <div className="main-content">
        <div className="container-fluid h-100">
          <div className="row h-100">
            {/* Left Section */}
            <div className="col-lg-7 col-12 position-relative" style={{overflow: 'hidden'}}>
              <div className="left-section">
                {/* Rotating Background Image */}
                <img
                  src={background}
                  alt="Rotating Background"
                  className="rotate-image-bg"
                  style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, opacity: 0.15, pointerEvents: 'none', width: '800px', height: '800px',color:'linear-gradient(135deg, #e8d5ff 0%, #f0e6ff 25%, #fff0f8 50%, #ffe6f0 75%, #ffd9e6 100%)'}}
                />
                <div style={{position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh'}}>
                  <div className="brand-text">
                    ETERNAL AI
                  </div>
                  <h1 className="hero-title">
                  Discover Your Cosmic Path
                  </h1>
                  <p className="hero-description">
                  Connect with Eternal AI and explore your spiritual journey
 
 
                  </p>
                  {/* <button className="btn-demo">
                    Start Demo
                  </button> */}
                </div>
              </div>
            </div>
 
            {/* Right Section - Signup Form */}
            <div className="col-lg-5 col-12">
              <div className="right-section">
                <div className="signup-section">
                  <h2>
                    Hey There! 👋
                  </h2>
                  <h3>Sign Up Now</h3>
                 
                  <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-group">
                      <label className="form-label">Email address / Phone Number*</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder=""
                      />
                      {fieldErrors.email && <div style={{ color: 'red', fontSize: '0.95rem', marginTop: 4 }}>{fieldErrors.email}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password*</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? '👁️' : '🙈'}
                        </button>
                      </div>
                      {fieldErrors.password && <div style={{ color: 'red', fontSize: '0.95rem', marginTop: 4 }}>{fieldErrors.password}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Rewrite Password*</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showRewritePassword ? "text" : "password"}
                          className="form-control"
                          name="rewritePassword"
                          value={formData.rewritePassword}
                          onChange={handleInputChange}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowRewritePassword(!showRewritePassword)}
                        >
                          {showRewritePassword ? '👁️' : '🙈'}
                        </button>
                      </div>
                      {fieldErrors.rewritePassword && <div style={{ color: 'red', fontSize: '0.95rem', marginTop: 4 }}>{fieldErrors.rewritePassword}</div>}
                    </div>
                    <button
                      className="btn-signup"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                  </form>
                 
                  {success && <div className="alert alert-success mt-3">{success}</div>}
                  {error && <div className="alert alert-danger mt-3">{error}</div>}
 
                  <div className="divider">
                    <span>Or</span>
                  </div>
                 
                  <div className="social-buttons">
                    <a href="#" className="btn-google"   onClick={handleGoogleSignIn}>
                      <img src={logo} alt="Google Logo" style={{width: '20px', height: '20px', marginRight: '8px'}} />
                      Sign up with Google
                    </a>
                 
                  </div>
                 
                  <div className="login-link">
                    Already have an account, <a href="/login">Log-in</a>
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
 
export default LandingPage;
 