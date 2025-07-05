import React, { useEffect } from 'react';
import {BrowserRouter as Router, Route, Routes, useNavigate} from 'react-router-dom';
import LandingPage from './LandingPage';
import './App.css';
import SignUp from './SignUp';
import LoginPage from './LoginPage';
import OnboardingOne from './OnboardingOne'
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

function App() {
  return (
    <Router>                                 
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding-one" element={<OnboardingOne />} />
        <Route path="/profile-creation" element={<ProfileCreation />} />
        <Route path="/chat" element={<ChatHome />}/>
        <Route path="/video" element={<VideoPage />}/>
        <Route path="/image" element={<ImageAnime />}/>
        <Route path="/report" element={<ReportPage />}/>
        <Route path="/splash" element={<SplashScreen />}/>
        <Route path="/gem" element={<GemPage />}/>
        <Route path="/karmic-report" element={<KarmicReport />}/>
        <Route path="/vibrational-report" element={<VibrationalReport />}/>
        <Route path="/aura-report" element={<AuraReport />}/>
        <Route path="/report-chat" element={<ReportChat />}/>
      </Routes>
    </Router>
  );
}

export default App;