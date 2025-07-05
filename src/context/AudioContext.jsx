// src/context/AudioContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Create a global audio element to ensure it persists between renders
let globalAudio = null;

const AudioContext = createContext();

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const audioRef = useRef(null);

  // Update mute state when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Toggle mute state
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Start audio - this will be called explicitly from the Onboarding component
  const startAudio = () => {
    // Initialize audio only if not already done
    if (!isInitialized) {
      if (!globalAudio) {
        globalAudio = new Audio('/audio/meditation.mp3');
        globalAudio.loop = true;
        globalAudio.volume = 0.3;
      }
      
      // Store reference to the global audio
      audioRef.current = globalAudio;
      
      // Apply current mute state
      audioRef.current.muted = isMuted;
      
      // Try to play the audio
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Autoplay prevented:', error);
          
          // Add one-time event listener to enable audio on first user interaction
          const enableAudio = () => {
            audioRef.current.play().catch(e => console.error('Play error:', e));
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('touchstart', enableAudio);
          };
          
          document.addEventListener('click', enableAudio, { once: true });
          document.addEventListener('touchstart', enableAudio, { once: true });
        });
      }
      
      setIsInitialized(true);
    } else if (audioRef.current && audioRef.current.paused) {
      // If already initialized but paused, just play it
      audioRef.current.play().catch(e => console.error('Play error:', e));
    }
  };

  const value = {
    isMuted,
    toggleMute,
    startAudio
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export default AudioContext;