import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { Bot, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getVedastroDataAndImage } from './services/vedastro';
import { numerologyApi } from './services/numerologyApi';
import EternalLogo from './20250709_1555_Eternal_App_Logo_remix_01jzqbd8vdfewajx10wga0fnfd-removebg-preview (1).png';
import { generateKarmicReport } from './services/gptReportGenerator';

type Stage = 'question1' | 'response1' | 'question2' | 'response2' | 'loading' | 'crafting';

const question1 =
  "Let me know more about you so I can provide more accurate predictions, let's start with your birth place. City and Country.";
const question2 =
  "What is the one area of your life you're most curious about right now? (e.g., career, relationships, health, spiritual growth)";

interface OnboardingLifePredictorProps {
  animateStaged?: boolean;
}

// Helper to split name into first, middle, last
function splitName(fullName: string): [string, string, string] {
  const parts = fullName.trim().split(' ');
  return [parts[0] || '', parts[1] || '', parts[2] || ''];
}

// Utility to remove undefined values from an object (shallow)
function removeUndefined(obj: any) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
}

const OnboardingLifePredictor: React.FC<OnboardingLifePredictorProps> = ({ animateStaged = true }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('question1');
  const [userResponse1, setUserResponse1] = useState('');
  const [userResponse2, setUserResponse2] = useState('');
  const [isEditing1, setIsEditing1] = useState(false);
  const [isEditing2, setIsEditing2] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showSubtleTyping, setShowSubtleTyping] = useState(false);
  const [bubbleDisappearing, setBubbleDisappearing] = useState(false);
  const [showBot1, setShowBot1] = useState(!animateStaged);
  const [showUser1, setShowUser1] = useState(!animateStaged);
  const [showBot2, setShowBot2] = useState(!animateStaged);
  const [showUser2, setShowUser2] = useState(!animateStaged);
  // Add a new state to control the transition between Q1 and Q2
  const [q1Complete, setQ1Complete] = useState(false);
  const [vedastroLoading, setVedastroLoading] = useState(false);
  const [vedastroError, setVedastroError] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Fetch user profile image on mount
  useEffect(() => {
    async function fetchProfileImage() {
      if (!currentUser?.uid) return;
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists() && userDoc.data().profileImage) {
        setProfileImage(userDoc.data().profileImage);
      } else {
        setProfileImage(null);
      }
    }
    fetchProfileImage();
  }, [currentUser]);

  // Add sparkles and shooting stars arrays at the top of the component
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
  const shootingStars = [
    { top: '10%', left: '-10%', delay: '0s', duration: '2.2s' },
    { top: '30%', left: '-15%', delay: '1.5s', duration: '2.5s' },
    { top: '60%', left: '-12%', delay: '2.8s', duration: '2.1s' },
  ];

  useEffect(() => {
    if (animateStaged) {
      setShowBot1(false); setShowUser1(false); setShowBot2(false); setShowUser2(false);
      setTimeout(() => setShowBot1(true), 400);
      setTimeout(() => setShowUser1(true), 1200);
      setTimeout(() => setShowBot2(true), 2200);
      setTimeout(() => setShowUser2(true), 3200);
    }
  }, [animateStaged]);

  useEffect(() => {
    setTimeout(() => {
      startTypingAnimation(question1);
    }, 1000);
    // eslint-disable-next-line
  }, []);

  const startTypingAnimation = (text: string) => {
    setTypedText('');
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setTypedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 40);
  };

  // Helper to get user profile (name, dob, tob, timezone)
  const getUserProfile = async () => {
    if (!currentUser?.uid) return null;
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!userDoc.exists()) return null;
    return userDoc.data();
  };

  // Add Google Maps Geocoding function
  const GOOGLE_MAPS_API_KEY = 'AIzaSyDYxkyXIMhbdlPLa7JUmoSKMSeGbQ0KsRs';
  async function geocodePlace(place: string) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK' && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    } else {
      throw new Error('Could not geocode location');
    }
  }

  // After Q1: Call Vedastro API and store result
  const handleResponse1Submit = async () => {
    const trimmedResponse = userResponse1.trim();
    console.log('handleResponse1Submit called, userResponse1:', trimmedResponse);
    if (!trimmedResponse) return;
    setIsEditing1(false);
    setBubbleDisappearing(true);
    setVedastroLoading(true);
    setVedastroError('');
    try {
      // Get user profile
      const userProfile = await getUserProfile();
      if (!userProfile) throw new Error('User profile not found');
      const fullName = [userProfile.firstName, userProfile.middleName, userProfile.lastName].filter(Boolean).join(' ');
      const dob = userProfile.dateOfBirth;
      const tob = userProfile.timeOfBirth || '12:00'; // fallback
      const timezone = userProfile.timezone || '+05:30'; // fallback
      // Check for missing required fields
      if (!dob) {
        setVedastroError('Your date of birth is missing from your profile. Please complete your profile before continuing.');
        setVedastroLoading(false);
        return;
      }
      if (!fullName) {
        setVedastroError('Your name is missing from your profile. Please complete your profile before continuing.');
        setVedastroLoading(false);
        return;
      }
      // Geocode birth place
      const { lat, lng } = await geocodePlace(trimmedResponse);
      console.log('Calling getVedastroDataAndImage with:', {
        location: trimmedResponse,
        dob,
        tob,
        timezone,
        name: fullName,
        lat,
        lng
      });
      // Call Vedastro API
      const vedastroData = await getVedastroDataAndImage({
        location: trimmedResponse,
        dob,
        tob,
        timezone,
        name: fullName,
        lat,
        lng
      });
      // Store in Firestore
      await setDoc(doc(db, 'lifePredictorOnboarding', currentUser.uid), {
        birthPlace: trimmedResponse,
        lat,
        lng,
        vedastroData,
        dob,
        tob,
        timezone,
        completedAt: new Date(),
        firstName: userProfile.firstName || '',
        middleName: userProfile.middleName && userProfile.middleName.trim() !== '' ? userProfile.middleName : ' ',
        lastName: userProfile.lastName || '',
      });
      setBubbleDisappearing(false);
      setQ1Complete(true);
      setStage('question2');
      startTypingAnimation(question2);
    } catch (err: any) {
      console.error('Error in handleResponse1Submit:', err);
      setVedastroError(err.message || 'Failed to fetch astrology data');
    } finally {
      setVedastroLoading(false);
    }
  };

  // Replace handleResponse2Submit with the new handleSubmit function
  const handleSubmit = async () => {
    if (!currentUser?.uid) {
      setVedastroError('Please log in to continue.');
      return;
    }

    if (!userResponse2.trim()) {
      setVedastroError('Please answer the second question before continuing.');
      return;
    }

    // Get onboarding data from Firestore
    const onboardingDocRef = doc(db, 'lifePredictorOnboarding', currentUser.uid);
    const onboardingDoc = await getDoc(onboardingDocRef);

    if (!onboardingDoc.exists()) {
      setVedastroError('Onboarding data not found. Please start over.');
          return;
        }

    const onboardingData = onboardingDoc.data();
    console.log('Onboarding data loaded:', onboardingData);

    // Validate birth data
    if (!onboardingData.dob || !onboardingData.tob) {
      setVedastroError('Your date or time of birth is missing. Please update your profile.');
      return;
    }

    try {
      setVedastroLoading(true);
      console.log('🚀 Starting API calls and report generation...');

      // Prepare user answers for storage
      const userAnswers = [
        onboardingData.birthPlace || 'Not provided',
        userResponse2
      ];

      // **STEP 1: Call both APIs simultaneously**
      console.log('📡 Calling Vedastro and Numerology APIs...');
      
      const [vedastroResults, numerologyResults] = await Promise.allSettled([
        // Vedastro API call
        getVedastroDataAndImage({
          location: onboardingData.birthPlace,
          dob: onboardingData.dob,
          tob: onboardingData.tob,
          timezone: onboardingData.timezone || '+00:00'
        }),
        // Numerology API call  
        (async () => {
          // Parse date
          let day, month, year;
          if (onboardingData.dob.includes('/')) {
            [day, month, year] = onboardingData.dob.split('/').map(Number);
          } else if (onboardingData.dob.includes('-')) {
            [year, month, day] = onboardingData.dob.split('-').map(Number);
          }
          const name = currentUser.displayName || 'User';
          // Compose numerology data using numerologyApi
          const [first, middle, last] = splitName(name);
          const safeFirst = first && first.trim() !== '' ? first : ' ';
          const safeMiddle = middle && middle.trim() !== '' ? middle : ' ';
          const safeLast = last && last.trim() !== '' ? last : ' ';
          const numerologyData = {
            lifePath: await numerologyApi.getLifePath(year, month, day),
            attitude: await numerologyApi.getAttitudeNumber(day, month),
            balance: await numerologyApi.getBalanceNumber(name.split(' ').map((n: string) => n[0]).join('')),
            challenge: await numerologyApi.getChallengeNumber(year, month, day),
            karmicDebt: await numerologyApi.getKarmicDebt(year, month, day),
            karmicLessons: await numerologyApi.getKarmicLessons(name),
            personality: await numerologyApi.getPersonalityNumber(safeFirst, safeMiddle, safeLast),
            destiny: await numerologyApi.getDestinyNumber(safeFirst, safeMiddle, safeLast),
            heartDesire: await numerologyApi.getHeartDesire(safeFirst, safeMiddle, safeLast),
            subconscious: await numerologyApi.getSubconsciousNumber(name),
            thought: await numerologyApi.getThoughtNumber(safeFirst, day),
            luckyNumbers: await numerologyApi.getLuckyNumbers(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, name),
            periodCycles: await numerologyApi.getPeriodCycles(year, month, day),
            luckyDays: await numerologyApi.getLuckyDaysCalendar(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`),
          };
          return removeUndefined(numerologyData);
        })()
      ]);

      // Process API results
      const vedastroData = vedastroResults.status === 'fulfilled' ? vedastroResults.value : null;
      const numerologyData = numerologyResults.status === 'fulfilled' ? numerologyResults.value : null;
      
      console.log('📊 API Results:', { 
        vedastro: vedastroData ? 'Success' : 'Failed',
        numerology: numerologyData ? 'Success' : 'Failed'
      });

      // **STEP 2: Prepare data for AI report generation**
      const reportGenerationData = {
          birthPlace: onboardingData.birthPlace,
          dob: onboardingData.dob,
          tob: onboardingData.tob,
          timezone: onboardingData.timezone,
        areaOfCuriosity: userResponse2,
        vedastroData: vedastroData,
        numerologyData: numerologyData,
        lat: onboardingData.lat,
        lng: onboardingData.lng
      };

      // **STEP 3: Generate AI report during crafting screen**
      console.log('🤖 Generating AI-powered karmic report...');
      setStage('crafting'); // Show crafting screen immediately
      
      // Generate the AI report in the background
      const aiReportResult = await generateKarmicReport(reportGenerationData);
      
      console.log('📝 AI Report Result:', { 
        success: aiReportResult.success,
        tokensUsed: aiReportResult.metadata?.tokensUsed 
      });

      // **STEP 4: Store everything in Firebase**
      console.log('💾 Storing data in Firebase...');

      // Store the complete karmic report with AI-generated content
        await setDoc(doc(db, 'karmicReports', currentUser.uid), {
        // Original data
          birthPlace: onboardingData.birthPlace,
          lifeArea: userResponse2,
        challenge: (numerologyData && 'challenge' in numerologyData && typeof numerologyData.challenge === 'object' && numerologyData.challenge && 'result' in numerologyData.challenge ? numerologyData.challenge.result : ''),
        jyotishReading: vedastroData && 'astrologyData' in vedastroData && vedastroData.astrologyData || '',
        chartImages: vedastroData && 'chartImages' in vedastroData && vedastroData.chartImages || {},
          birthData: {
            location: onboardingData.birthPlace,
            dob: onboardingData.dob || '',
            tob: onboardingData.tob || '',
            timezone: onboardingData.timezone || '',
          },
        vedicApi: vedastroData,
        rapidApi: numerologyData,
          lat: onboardingData.lat,
          lng: onboardingData.lng,
        
        // **NEW: AI-Generated Report**
        aiGeneratedkarmicreport: aiReportResult.report,
        aiReportMetadata: aiReportResult.metadata,
        aiReportSuccess: aiReportResult.success,
        
        // Timestamps
        createdAt: new Date(),
        lastUpdated: new Date()
      });

      // Also update the original reports collection for backwards compatibility
      await setDoc(doc(db, 'lifePredictorReports', currentUser.uid), {
        report: aiReportResult.report,
        timestamp: new Date(),
        userAnswers,
        aiGenerated: true,
        reportMetadata: aiReportResult.metadata
      });

      console.log('✅ All data stored successfully');

      // **STEP 5: Navigate to karmic report after a brief delay**
        setTimeout(() => {
        console.log('🧭 Navigating to karmic report...');
          navigate('/karmic-report');
      }, 3000); // 3 seconds to show the crafting animation

    } catch (err) {
      console.error('❌ Error during onboarding process:', err);
      setVedastroError('An error occurred while generating your karmic report. Please try again.');
        setVedastroLoading(false);
      setStage('question2'); // Return to question 2
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>, responseNumber: 1 | 2) => {
    console.log('Key pressed:', e.key, 'Response number:', responseNumber);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (responseNumber === 1) {
        handleResponse1Submit();
      } else {
        handleSubmit();
      }
    }
  };

  const LoadingScreen = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 flex items-center justify-center animate-fade-in">
      <div className="enhanced-loading-card">
        <div className="mystical-loading-spinner">
          <div className="spinner-ring primary"></div>
          <div className="spinner-ring secondary"></div>
          <div className="spinner-ring tertiary"></div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 text-center">
          The universe is aligning your cosmic energies... ✨
        </h2>
        <p className="text-purple-700 text-xl text-center font-medium">Generating your personalized life prediction...</p>
        <div className="loading-pulse-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );

  // Add a new crafting loading screen
  const EnhancedCraftingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col justify-center items-center text-white">
      <div className="text-center space-y-8">
        {/* Animated cosmic symbol */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto">
            <div className="absolute inset-0 border-4 border-purple-300 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-blue-300 rounded-full animate-spin animate-reverse"></div>
            <div className="absolute inset-4 border-4 border-indigo-300 rounded-full animate-pulse"></div>
            <div className="absolute inset-8 flex items-center justify-center">
              <span className="text-3xl">🔮</span>
        </div>
          </div>
        </div>

        {/* Progress text */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Crafting Your Cosmic Blueprint
        </h2>
          
          <div className="space-y-2 text-lg">
            <p className="animate-pulse">🌟 Aligning planetary positions...</p>
            <p className="animate-pulse delay-500">🔢 Calculating numerological patterns...</p>
            <p className="animate-pulse delay-1000">🤖 Generating personalized insights...</p>
            <p className="animate-pulse delay-1500">✨ Weaving your karmic story...</p>
          </div>

          <div className="text-purple-300 text-base mt-6">
            <p>This process may take a few moments as we create</p>
            <p>your unique astrological profile using AI technology</p>
          </div>
        </div>

        {/* Loading bar */}
        <div className="w-80 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  // Debug button to fetch and log the latest detailed Karmic Report
  const handleDebugLogReport = async () => {
    if (!currentUser?.uid) {
      console.log('No user logged in.');
      return;
    }
    try {
      const karmicReportDoc = await getDoc(doc(db, 'karmicReports', currentUser.uid));
      if (karmicReportDoc.exists()) {
        const data = karmicReportDoc.data();
        console.log('Karmic Report:', data);
        if (data.detailedReport) {
          console.log('Detailed Report:', data.detailedReport);
        }
      } else {
        console.log('No karmic report found for this user.');
      }
    } catch (err) {
      console.error('Error fetching karmic report:', err);
    }
  };

  if (stage === 'loading') {
    return <LoadingScreen />;
  }

  if (stage === 'crafting') {
    return <EnhancedCraftingScreen />;
  }

  console.log('Loaded OpenAI Key (OnboardingLifePredictor):', process.env.REACT_APP_OPENAI_API_KEY);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 relative overflow-hidden">
      {/* Sparkles */}
      {sparkles.map((sparkle, idx) => (
        <div
          key={idx}
          className="sparkle"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            right: sparkle.right,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: sparkle.delay,
            position: 'absolute',
          }}
        />
      ))}
      {/* Shooting Stars */}
      {shootingStars.map((star, idx) => (
        <div
          key={idx}
          className="shooting-star"
          style={{
            top: star.top,
            left: star.left,
            animationDelay: star.delay,
            animationDuration: star.duration,
            position: 'absolute',
          }}
        />
      ))}
      {/* Enhanced Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-element top-20 left-20">✦</div>
        <div className="floating-element top-40 right-32">✧</div>
        <div className="floating-element bottom-32 left-16">✦</div>
        <div className="floating-element bottom-20 right-20">✧</div>
        <div className="floating-element top-1/2 left-10">✦</div>
        <div className="floating-element top-1/3 right-10">✧</div>
        {/* Gradient orbs for depth */}
        <div className="gradient-orb top-1/4 left-1/4"></div>
        <div className="gradient-orb bottom-1/4 right-1/4"></div>
      </div>
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8 space-y-12">
        {/* Eternal AI Branding */}
        <div className="onboarding-logo">
          <img src={EternalLogo} alt="Eternal Logo" className="onboarding-logo-img" />
        </div>
        {/* Question 1 Stage */}
        <AnimatePresence>
          {!q1Complete && (
            <motion.div className={`w-full max-w-5xl space-y-10 ${bubbleDisappearing ? 'bubble-exit' : ''}`}>
              {showBot1 && (
                <div className="flex items-start space-x-6 animate-elegant-slide-left">
                  <div className="w-20 h-20 rounded-full border-4 border-white/30 shadow-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <Bot className="w-10 h-10 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 rounded-full"></div>
                  </div>
                  <div className="enhanced-chat-bubble-ai">
                    <p className="text-slate-800 text-2xl font-medium leading-relaxed">
                      {typedText}
                      <span className="animate-pulse text-purple-500">|</span>
                    </p>
                  </div>
                </div>
              )}
              {showUser1 && (
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -100 }}
                  transition={{ duration: 0.6 }}
                  className={`flex items-start space-x-6 justify-end animate-elegant-slide-right`}
                >
                  <div
                    className={`enhanced-chat-bubble-user cursor-text ${isEditing1 ? 'editing-active' : ''}`}
                    onClick={() => setIsEditing1(true)}
                  >
                    {isEditing1 ? (
                      <textarea
                        value={userResponse1}
                        onChange={e => {
                          setUserResponse1(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleKeyPress(e, 1)}
                        onBlur={handleResponse1Submit}
                        placeholder="Type your response here..."
                        className="w-full h-full bg-transparent text-slate-800 text-2xl font-medium resize-none outline-none placeholder-slate-500/70 p-0"
                        rows={1}
                        autoFocus
                        style={{overflow: 'hidden'}}
                      />
                    ) : (
                      <p className="text-slate-600 text-2xl font-medium whitespace-nowrap overflow-hidden text-ellipsis flex items-center h-full">
                        {userResponse1 || 'Click to type your response...'}
                        {!userResponse1 && <span className="edit-hint"></span>}
                      </p>
                    )}
                    {vedastroError && (
                      <div className="text-red-500 text-lg mt-2">{vedastroError}</div>
                    )}
                  </div>
                  {/* User Profile Picture - Now on the right */}
                  <div className="w-20 h-20 rounded-full border-4 border-white/30 shadow-xl flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500 text-white overflow-hidden">
                    <img
                      src={profileImage || 'https://ui-avatars.com/api/?name=User&background=random'}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
          {q1Complete && (
            <motion.div className={`w-full max-w-5xl space-y-10 ${bubbleDisappearing ? 'bubble-exit' : ''}`}>
              {showBot2 && (
                <div className="flex items-start space-x-6 animate-elegant-slide-left">
                  <div className="w-20 h-20 rounded-full border-4 border-white/30 shadow-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <Bot className="w-10 h-10 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 rounded-full"></div>
                  </div>
                  <div className="enhanced-chat-bubble-ai">
                    <p className="text-slate-800 text-2xl font-medium leading-relaxed">
                      {typedText}
                      <span className="animate-pulse text-purple-500">|</span>
                    </p>
                  </div>
                </div>
              )}
              {showUser2 && (
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  transition={{ duration: 0.6 }}
                  className={`flex items-start space-x-6 justify-end animate-elegant-slide-right`}
                >
                  <div
                    className={`enhanced-chat-bubble-user cursor-text ${isEditing2 ? 'editing-active' : ''}`}
                    onClick={() => setIsEditing2(true)}
                  >
                    {isEditing2 ? (
                      <textarea
                        value={userResponse2}
                        onChange={e => {
                          setUserResponse2(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleKeyPress(e, 2)}
                        onBlur={handleSubmit}
                        placeholder="Type your response here..."
                        className="w-full h-full bg-transparent text-slate-800 text-2xl font-medium resize-none outline-none placeholder-slate-500/70 p-0"
                        rows={1}
                        autoFocus
                        style={{overflow: 'hidden'}}
                      />
                    ) : (
                      <p className="text-slate-600 text-2xl font-medium whitespace-nowrap overflow-hidden text-ellipsis flex items-center h-full">
                        {userResponse2 || 'Click to type your response...'}
                        {!userResponse2 && <span className="edit-hint"></span>}
                      </p>
                    )}
                  </div>
                  {/* User Profile Picture - Now on the right */}
                  <div className="w-20 h-20 rounded-full border-4 border-white/30 shadow-xl flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500 text-white overflow-hidden">
                    <img
                      src={profileImage || 'https://ui-avatars.com/api/?name=User&background=random'}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`
        /* ...styles from your ImprovedEternalAIChatBars... */
        .enhanced-chat-bubble-ai, .enhanced-chat-bubble-user {
          background: rgba(255, 255, 255, 0.35) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          border: 1.5px solid rgba(255, 255, 255, 0.25) !important;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10) !important;
        }
        .enhanced-chat-bubble-user, .enhanced-chat-bubble-user.editing-active {
          border-radius: 35px 35px 12px 35px !important;
        }
        .enhanced-chat-bubble-ai {
          border-radius: 35px 35px 35px 12px !important;
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
        .shooting-star {
          position: absolute;
          width: 120px;
          height: 2px;
          background: linear-gradient(90deg, #fff 0%, #fff0 100%);
          opacity: 0.7;
          z-index: 1;
          pointer-events: none;
          border-radius: 2px;
          filter: blur(0.5px);
          animation: shooting 2.2s linear infinite;
        }
        @keyframes shooting {
          0% {
            opacity: 0;
            transform: translateX(0) translateY(0) scaleX(0.7) skewX(-15deg);
          }
          10% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(120vw) translateY(40vh) scaleX(1.1) skewX(-15deg);
          }
        }
        .enhanced-chat-bubble-ai {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-top: 1px solid rgba(255, 255, 255, 0.6);
          border-left: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 35px 35px 35px 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          padding: 2.5rem 3.5rem;
          max-width: 700px;
          min-height: 120px;
          display: flex;
          align-items: center;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .enhanced-chat-bubble-user {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-top: 1px solid rgba(255, 255, 255, 0.6);
          border-right: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 35px 35px 12px 35px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          padding: 2.5rem 3.5rem;
          max-width: 700px;
          min-height: 48px;
          display: flex;
          align-items: center;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .enhanced-chat-bubble-user.editing-active {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 0 0 2px rgba(147, 51, 234, 0.2);
        }
        .onboarding-logo-img {
          width: 80px;
          height: 80px;
          object-fit: contain;
          margin: 0 auto 16px;
          display: block;
        }
      `}</style>

      {/* Debug button: Only show in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={handleDebugLogReport}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: '#a78bfa',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 20px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            cursor: 'pointer',
            opacity: 0.85
          }}
        >
          Debug: Log Karmic Report
        </button>
      )}
    </div>
  );
};

export default OnboardingLifePredictor;