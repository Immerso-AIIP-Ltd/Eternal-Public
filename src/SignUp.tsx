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
import logo from './google-logo.png';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// Remove or comment out the following lines if the files do not exist:
// import defaultProfilePic from './default-pfp.jpg';
// import Cropper from 'react-easy-crop';
import { useCallback } from 'react';
 
 
 
const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showRewritePassword, setShowRewritePassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rewritePassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    timeOfBirth: '',
    gender: '',
  });
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    rewritePassword: ''
  });
  const [isGoogleSignUp, setIsGoogleSignUp] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<any>(null);
 
 
  // Update handleInputChange to accept both input and select events
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
 
  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
 
  const getCroppedImg = async (imageSrc: string, crop: any) => {
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });
    const canvas = document.createElement('canvas');
    const diameter = Math.min(crop.width, crop.height);
    canvas.width = diameter;
    canvas.height = diameter;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.save();
    ctx.beginPath();
    ctx.arc(diameter / 2, diameter / 2, diameter / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      diameter,
      diameter,
      0,
      0,
      diameter,
      diameter
    );
    ctx.restore();
    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        }
      }, 'image/png');
    });
  };
 
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
      setShowCropper(true);
      setCroppedImage(null);
    }
  };
 
  const handleCropDone = async () => {
    if (profilePic && croppedAreaPixels) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const cropped = await getCroppedImg(event.target?.result as string, croppedAreaPixels);
        setCroppedImage(cropped);
        setShowCropper(false);
      };
      reader.readAsDataURL(profilePic);
    }
  };
 
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ email: '', password: '', rewritePassword: '' });
 
    let hasError = false;
    const newErrors = { email: '', password: '', rewritePassword: '' };
 
    if (!formData.firstName.trim()) {
      setError('First name is required.');
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required.');
      return;
    }
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
      return;
    }
    setStep(2);
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
 
    if (!formData.dateOfBirth) {
      setError('Date of birth is required.');
      setLoading(false);
      return;
    }
    if (!formData.timeOfBirth) {
      setError('Time of birth is required.');
      setLoading(false);
      return;
    }
    if (!formData.gender) {
      setError('Gender is required.');
      setLoading(false);
      return;
    }
 
    try {
      let user, uid;
      if (isGoogleSignUp && googleUser) {
        user = googleUser;
        uid = user.uid;
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        user = userCredential.user;
        uid = user.uid;
      }
      const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ').trim();
      let profilePicUrl = '';
      if (isGoogleSignUp && user.photoURL) {
        profilePicUrl = user.photoURL;
      } else if (profilePic) {
        let fileToUpload = profilePic;
        if (croppedImage) {
          const response = await fetch(croppedImage);
          const blob = await response.blob();
          fileToUpload = new File([blob], profilePic.name, { type: 'image/png' });
        }
        const storage = getStorage();
        const storageRef = ref(storage, `profile_pics/${uid}`);
        await uploadBytes(storageRef, fileToUpload);
        profilePicUrl = await getDownloadURL(storageRef);
      } else {
        // TODO: Add default profile picture and cropper functionality later if needed.
        profilePicUrl = ''; // No default profile pic if not using one
      }
      await setDoc(doc(db, 'users', uid), {
        email: formData.email,
        fullName: fullName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        timeOfBirth: formData.timeOfBirth,
        gender: formData.gender,
        profilePicUrl,
        createdAt: serverTimestamp(),
        isGoogleSignUp: !!isGoogleSignUp,
      }, { merge: true });
      setSuccess('Account created successfully!');
      setTimeout(() => {
        navigate('/onboarding-splash');
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
      setIsGoogleSignUp(true);
      setGoogleUser(user);
      setFormData((prev) => ({
        ...prev,
        firstName: user.displayName ? user.displayName.split(' ')[0] : '',
        lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
        email: user.email || '',
      }));
      setStep(2);
    } catch (err: any) {
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
          justify-content: center;
        }
 
        .left-section {
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 100vh;
          background: transparent;
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
          max-width: 850px;
          width: 100%;
          margin: 0 auto;
        }
 
        .signup-section {
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
          top: var(--signup-card-top, 0);
          left: var(--signup-card-left, -130px);
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
            padding: 24px 0;
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
            padding: 24px 8px;
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
            padding: 12px 0;
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
            padding: 10px 0;
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
          width: 600px;
          height: 600px;
          animation: rotateAnimation 20s linear infinite;
          opacity: 0.12;
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
                  style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, pointerEvents: 'none'}}
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
                </div>
              </div>
            </div>
 
            {/* Right Section - Signup Form */}
            <div className="col-lg-5 col-12">
              <div className="right-section">
                <div className="signup-section">
                  {step === 1 && (
                    <form onSubmit={handleNext} autoComplete="off">
                      <h2>👋 Sign Up</h2>
                      <div className="form-group">
                        <label className="form-label">First Name*</label>
                        <input type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name*</label>
                        <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email*</label>
                        <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required />
                        {fieldErrors.email && <div style={{ color: 'red', fontSize: '0.95rem', marginTop: 4 }}>{fieldErrors.email}</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Password*</label>
                        <div className="password-input-wrapper">
                          <input type={showPassword ? "text" : "password"} className="form-control" name="password" value={formData.password} onChange={handleInputChange} required />
                          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? '👁️' : '🙈'}
                          </button>
                        </div>
                        {fieldErrors.password && <div style={{ color: 'red', fontSize: '0.95rem', marginTop: 4 }}>{fieldErrors.password}</div>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirm Password*</label>
                        <div className="password-input-wrapper">
                          <input type={showRewritePassword ? "text" : "password"} className="form-control" name="rewritePassword" value={formData.rewritePassword} onChange={handleInputChange} required />
                          <button type="button" className="password-toggle" onClick={() => setShowRewritePassword(!showRewritePassword)}>
                            {showRewritePassword ? '👁️' : '🙈'}
                          </button>
                        </div>
                        {fieldErrors.rewritePassword && <div style={{ color: 'red', fontSize: '0.95rem', marginTop: 4 }}>{fieldErrors.rewritePassword}</div>}
                      </div>
                      {error && <div className="alert alert-danger mt-3">{error}</div>}
                      <button className="btn-signup" type="submit">Next</button>
                      <div style={{ textAlign: 'center', margin: '16px 0' }}>
                        <span style={{ color: '#888', fontSize: '0.95rem' }}>or</span>
                      </div>
                      <button type="button" className="btn-google" style={{ width: '100%', marginBottom: 8 }} onClick={handleGoogleSignIn}>
                        <img src={logo} alt="Google Logo" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }} />
                        Sign up with Google
                      </button>
                      <div style={{ textAlign: 'center', marginTop: 12 }}>
                        <a href="/login" style={{ fontSize: '0.95rem', color: '#6a1b9a', textDecoration: 'underline', cursor: 'pointer' }}>Go back to login</a>
                      </div>
                    </form>
                  )}
                  {step === 2 && (
                    <form onSubmit={handleSubmit} autoComplete="off">
                      <h2>👋 Sign Up</h2>
                      {/* Profile Picture Upload (optional, circular preview) */}
                      {!isGoogleSignUp && (
                        <div className="form-group" style={{ textAlign: 'center' }}>
                          <label className="form-label">Profile Picture (optional)</label>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', background: '#eee', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img
                                src={croppedImage || (profilePic ? URL.createObjectURL(profilePic) : '')}
                                alt="Profile Preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                              />
                            </div>
                            <input type="file" accept="image/*" className="form-control" onChange={handleProfilePicChange} style={{ maxWidth: 200 }} />
                          </div>
                          {showCropper && profilePic && (
                            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ background: '#fff', padding: 24, borderRadius: 12, position: 'relative', width: 350, height: 350 }}>
                                {/* TODO: Add Cropper component here */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                                  <button type="button" className="btn btn-secondary" onClick={() => setShowCropper(false)}>Cancel</button>
                                  <button type="button" className="btn-signup" onClick={handleCropDone}>Crop</button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="form-group">
                        <label className="form-label">Gender*</label>
                        <select className="form-control" name="gender" value={formData.gender} onChange={handleInputChange} required>
                          <option value="" disabled>Select your gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Date of Birth*</label>
                        <input type="date" className="form-control" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Time of Birth*</label>
                        <input type="time" className="form-control" name="timeOfBirth" value={formData.timeOfBirth} onChange={handleInputChange} required />
                      </div>
                      {error && <div className="alert alert-danger mt-3">{error}</div>}
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button type="button" className="btn-signup" style={{ flex: 1, background: '#e0e0e0', color: '#333', border: 'none' }} onClick={() => setStep(1)}>
                          Back
                        </button>
                        <button className="btn-signup" type="submit" style={{ flex: 1 }} disabled={loading}>{loading ? 'Creating Account...' : 'Sign Up'}</button>
                      </div>
                      <div style={{ textAlign: 'center', marginTop: 12 }}>
                        <a href="/login" style={{ fontSize: '0.95rem', color: '#6a1b9a', textDecoration: 'underline', cursor: 'pointer' }}>Go back to login</a>
                      </div>
                    </form>
                  )}
                  {success && <div className="alert alert-success mt-3">{success}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default SignUp;
 