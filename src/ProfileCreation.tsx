import React, { useState } from 'react';
import { Calendar, Clock, User, Upload, Star } from 'lucide-react';
import background from './background.png'
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase/config';
 
const ProfileCreation = () => {
   const navigate = useNavigate();
  const [formData, setFormData] = useState({
    gender: 'Male',
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    timeFormat: 'AM'
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    profileImage: '',
  });
 
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
 
  const validate = () => {
    let valid = true;
    const newErrors: any = { name: '', dateOfBirth: '', timeOfBirth: '', profileImage: '' };
 
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
      valid = false;
    }
 
    // Date of Birth validation (yyyy-MM-dd)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Date of Birth must be in yyyy-MM-dd format.';
      valid = false;
    }
 
    // Time of Birth validation (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(formData.timeOfBirth)) {
      newErrors.timeOfBirth = 'Time must be in HH:MM format.';
      valid = false;
    } else {
      const [hh, mm] = formData.timeOfBirth.split(':').map(Number);
      if (
        isNaN(hh) || isNaN(mm) ||
        hh < 1 || hh > 12 ||
        mm < 0 || mm > 59
      ) {
        newErrors.timeOfBirth = 'Invalid time.';
        valid = false;
      }
    }
 
    // Profile image validation
    if (!profileImage) {
      newErrors.profileImage = 'Profile image is required.';
      valid = false;
    }
 
    setErrors(newErrors);
    return valid;
  };
 
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      if (file.size > 1048576) { // 1MB
        setErrors(prev => ({ ...prev, profileImage: 'Image is too large. Please select an image smaller than 1MB.' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && typeof e.target.result === 'string') {
          setProfileImage(e.target.result as string);
          setErrors(prev => ({ ...prev, profileImage: '' }));
        }
      };
      reader.readAsDataURL(file);
    }
  };
 
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("check")
    if (validate()) {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          await setDoc(doc(db, 'YourSoulAnswers', user.uid), {
            ...formData,
            profileImage,
          }, { merge: true });
          navigate('/onboarding-one');
        } catch (err: any) {
          if (err && err.code === 'invalid-argument' && err.message && err.message.includes('profileImage')) {
            setErrors(prev => ({ ...prev, profileImage: 'Image is too large to save. Please select an image smaller than 1MB.' }));
            return;
          }
        }
      }
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
 
  function formatDateForDisplay(dateStr: string) {
    // Expects yyyy-MM-dd, returns DD/MM/YYYY
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
 
  return (
    <div className="eternal-ai-fullscreen">
      <style>{`
        .eternal-ai-fullscreen {
          min-height: 100vh;
          // background: linear-gradient(135deg, #e8d5ff 0%, #f0e6ff 25%, #fff0f8 50%, #ffe6f0 75%, #ffd9e6 100%);
          background:#ffffff;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
 
        .left-section {
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 100vh;
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
 
        .rotate-image-bg {
          width: 800px;
          height: 800px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.15;
          animation: rotateAnimation 5s linear infinite;
          z-index: 0;
          pointer-events: none;
        }
 
        @keyframes rotateAnimation {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .form-control:focus {
          background-color: #212529 !important;
          border-color: #0d6efd !important;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25) !important;
          color: white !important;
        }
        .form-control::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        .btn:focus {
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25) !important;
        }
        @media (max-width: 991.98px) {
          .display-6 {
            font-size: 1.75rem !important;
          }
        }
        @media (max-width: 575.98px) {
          .display-6 {
            font-size: 1.5rem !important;
          }
        }
        .profile-form-gradient {
          // background: linear-gradient(135deg, rgb(106, 27, 154) 0%, rgb(74, 20, 140) 100%);
          border-radius: 16px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.04);
        }
        .gradient-text {
          background: linear-gradient(135deg, rgb(106, 27, 154) 0%, rgb(74, 20, 140) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
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
 
      <div className="container-fluid" style={{ zIndex: 1 }}>
        <div className="row min-vh-100 align-items-center">
          {/* Left Side - Zodiac Wheel */}
          <div className="col-12 col-lg-7 d-flex align-items-center justify-content-center p-4 position-relative" style={{overflow: 'hidden'}}>
            <div className="left-section">
              {/* <div className="text-center position-relative"> */}
                <img
                  src={background}
                  alt="Rotating Background"
                  className="rotate-image-bg"
                  style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, opacity: 0.15, pointerEvents: 'none', width: '800px', height: '800px'}}
                />
                {/* Centered Text Over Wheel */}
                <div
                  className="position-absolute top-50 start-50 translate-middle text-center"
                  style={{ width: '80%' }}
                >
                  <div className="mb-2">
                    <span className="text-white-50 small">ETERNAL AI</span>
                  </div>
                  <h1 className="display-6 fw-bold mb-3 gradient-text">
                    Begin Your Spiritual<br />Journey
                  </h1>
                  <p className="text-black-50 small px-3">
                    Lorem ipsum dolor sit amet consectetur. Arcu a sit commodo tempor nulla blandit.<br />
                    Posuere vel netus consectetur phasellus fermentum.
                  </p>
                </div>
              </div>
            </div>
          {/* </div> */}
 
          {/* Right Side - Profile Form */}
          <div className="col-12 col-lg-5 p-4">
            <div className="mx-auto profile-form-gradient p-4" style={{ maxWidth: '400px' }}>
              <div className="text-center mb-4">
                <h2 className="text-black h4 mb-2">Your gateway to cosmic discovery</h2>
                <p className="text-black-50 small mb-4">Upload your profile</p>
                {/* Profile Image Upload */}
                <div className="position-relative d-inline-block mb-4">
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center position-relative overflow-hidden"
                    style={{ width: '100px', height: '100px' }}
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      <User size={40} className="text-white-50" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                    style={{ cursor: 'pointer' }}
                  />
                  <div
                    className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <Upload size={16} className="text-white" />
                  </div>
                </div>
                {errors.profileImage && (
                  <div className="text-danger small mb-2">{errors.profileImage}</div>
                )}
              </div>
              {/* Form */}
              <div>
                {/* Gender Selection */}
                <div className="mb-4">
                  <label className="form-label text-black mb-3">Gender</label>
                  <div className="row g-2">
                    {[
                      { value: 'Male', icon: '♂', label: 'Male' },
                      { value: 'Female', icon: '♀', label: 'Female' },
                      { value: 'Other', icon: '⚧', label: 'Other' }
                    ].map((option) => (
                      <div key={option.value} className="col-4">
                        <button
                          type="button"
                          className={`btn w-100 py-3 border ${
                            formData.gender === option.value
                              ? 'border-primary bg-primary bg-opacity-10 text-primary'
                              : 'border-secondary bg-white text-black-50'
                          }`}
                          onClick={() => handleInputChange('gender', option.value)}
                        >
                          <div className="d-flex flex-column align-items-center">
                            <span style={{ fontSize: '20px' }}>{option.icon}</span>
                            <small className="mt-1">{option.label}</small>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Name Input */}
                <div className="mb-4">
                  <label className="form-label text-black">Your Name</label>
                  <input
                    type="text"
                    className={`form-control border-secondary text-black ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    style={{ padding: '12px 16px', background: '#fff' }}
                  />
                  {errors.name && (
                    <div className="text-danger small">{errors.name}</div>
                  )}
                </div>
                {/* Date of Birth */}
                <div className="mb-4">
                  <label className="form-label text-black">Date of Birth</label>
                  <div className="position-relative">
                    <input
                      type="date"
                      className={`form-control border-secondary text-black ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                      placeholder="DD/MM/YYYY"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      style={{ padding: '12px 16px', paddingRight: '40px', background: '#fff' }}
                    />
                    <Calendar
                      size={20}
                      className="position-absolute top-50 end-0 translate-middle-y me-3 text-black-50"
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <div className="text-danger small">{errors.dateOfBirth}</div>
                  )}
                </div>
                {/* Time of Birth */}
                <div className="mb-4">
                  <label className="form-label text-black">Time of Birth</label>
                  <div className="row g-2">
                    <div className="col-8">
                      <div className="position-relative">
                        <input
                          type="text"
                          className={`form-control border-secondary text-black-50 ${errors.timeOfBirth ? 'is-invalid' : ''}`}
                          placeholder="HH:MM"
                          value={formData.timeOfBirth}
                          onChange={(e) => handleInputChange('timeOfBirth', e.target.value)}
                          style={{ padding: '12px 16px', paddingRight: '40px', background: '#fff' }}
                        />
                        <Clock
                          size={20}
                          className="position-absolute top-50 end-0 translate-middle-y me-3 text-white-50"
                        />
                      </div>
                      {errors.timeOfBirth && (
                        <div className="text-danger small">{errors.timeOfBirth}</div>
                      )}
                    </div>
                    <div className="col-4">
                      <div className="btn-group w-100" role="group">
                        <button
                          type="button"
                          className={`btn ${
                            formData.timeFormat === 'AM'
                              ? 'btn-primary'
                              : 'btn-outline-secondary text-black-50'
                          }`}
                          onClick={() => handleInputChange('timeFormat', 'AM')}
                        >
                          AM
                        </button>
                        <button
                          type="button"
                          className={`btn ${
                            formData.timeFormat === 'PM'
                              ? 'btn-primary'
                              : 'btn-outline-secondary text-black-50'
                          }`}
                          onClick={() => handleInputChange('timeFormat', 'PM')}
                        >
                          PM
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn w-100 py-3 fw-semibold"
                  style={{
                   background: 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)',
                    border: 'none',
                    color: 'white'
                  }}
                  onClick={handleSubmit}
 
                >
                  Create Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
 
export default ProfileCreation;
 