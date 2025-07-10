import React, { useEffect } from 'react';
import {BrowserRouter as Router, Route, Routes, useNavigate} from 'react-router-dom';
import LandingPage from './LandingPage';
import './App.css';
import SignUp from './SignUp';
import LoginPage from './LoginPage';
import ProfileCreation from './ProfileCreation';
import ChatHome from './ChatHome';
import VideoPage from './Videopage';
import ImageAnime from './ImageAnime';
import ReportPage from './ReportPage';
import SplashScreen from './SplashScreen';
import GemPage from './GemPage';
import KarmicReport from './KarmicReport';
import VibrationalReport from './VibrationalReport';
import AuraReport from './AuraReport';
import ReportChat from './ReportChat';
import OnboardingSplashScreen from './OnboardingSplashScreen';
import OnboardingLifePredictor from './OnboardingLifePredictor';
import HomeScreen from './HomeScreen';
import ComingSoon from './ComingSoon';
import NumerologyApiDebug from './NumerologyApiDebug';
import NumerologyApiFullDebug from './NumerologyApiFullDebug';

function App() {
  return (
    <Router>                                 
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile-creation" element={<ProfileCreation />} />
        <Route path="/chat" element={<ChatHome />}/>
        <Route path="/chat-home" element={<ChatHome />}/>
        <Route path="/video" element={<VideoPage />}/>
        <Route path="/image" element={<ImageAnime />}/>
        <Route path="/report" element={<ReportPage />}/>
        <Route path="/splash" element={<SplashScreen />}/>
        <Route path="/gem" element={<GemPage />}/>
        <Route path="/karmic-report" element={<KarmicReport />}/>
        <Route path="/vibrational-report" element={<VibrationalReport />}/>
        <Route path="/aura-report" element={<AuraReport />}/>
        <Route path="/report-chat" element={<ReportChat />}/>
        <Route path="/onboarding-splash" element={<OnboardingSplashScreen />} />
        <Route path="/onboarding-life-predictor" element={<OnboardingLifePredictor />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/numerology-debug" element={<NumerologyApiDebug />} />
        <Route path="/numerology-full-debug" element={<NumerologyApiFullDebug />} />
      </Routes>
    </Router>
  );
}

export default App;