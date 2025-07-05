import React from "react";
import "./SplashScreen.css";
import background from './background.png';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    title: "Decode Your Aura",
    desc: "Reveal the colors and energies that surround your spirit."
  },
  {
    title: "Vibrational Frequency",
    desc: "Discover the resonance that shapes your reality."
  },
  {
    title: "Karmic Blueprint",
    desc: "Uncover the patterns woven through your lifetimes."
  },
  {
    title: "Flame Score",
    desc: "Measure the intensity of your spiritual twin flame connection."
  },
  {
    title: "Soul Rhythm",
    desc: "Feel your energy's dance with the universe's pulse."
  },
  {
    title: "Past Life Insights",
    desc: "Glimpse echoes from your previous incarnations."
  }
];

const SplashScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="splash-bg">
      <img
        src={background}
        alt="Rotating Background"
        className="rotate-image-bg"
        style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, opacity: 0.15, pointerEvents: 'none', width: '800px', height: '800px'}}
      />
      <h1 className="welcome-title">Welcome, Seeker of Light</h1>
      {/* <p className="welcome-note">
        You have arrived at the threshold of the unseen, where the whispers of your soul echo through the cosmos.<br/>
        Here, the veils of the ordinary are lifted. Step forward to decode the radiant tapestry of your aura, attune to your unique vibrational frequency, and unveil the secrets of your karmic blueprint.<br/>
        This is not just a journey—it is your awakening.
      </p> */}
      <div className="features">
        {features.map((f, i) => (
          <div className="feature-card" key={i}>
            <h2>{f.title}</h2>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
      <button className="cta-btn" onClick={() => navigate('/onboarding-one')}>
        Begin Your Soul Journey
      </button>
    </div>
  );
};

export default SplashScreen; 