import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Star, Zap, Eye, Flame, Layers, Heart } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";
// Remove: import OnboardingLifePredictor from './OnboardingLifePredictor';
 
interface AppCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}
 
export const AppCard: React.FC<AppCardProps & { children?: React.ReactNode }> = ({ Icon, title, description, onClick, children }) => {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.95 }}
      className="bg-white rounded-xl p-6 shadow-md cursor-pointer w-64 h-72 flex flex-col justify-between transition-colors duration-300 hover:bg-gray-50"
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
          <Icon className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2 font-figtree">{title}</h2>
        <p className="text-gray-600 text-sm font-figtree font-light">{description}</p>
        {children}
      </div>
    </motion.div>
  )
}
 
interface CarouselProps {
  items: AppCardProps[];
  autoScroll?: boolean;
  stopAtIndex?: number;
  onStopScrolling?: () => void;
}
 
const Carousel: React.FC<CarouselProps> = ({ items, autoScroll = false, stopAtIndex = 0, onStopScrolling }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasStopped, setHasStopped] = useState(false);
 
  useEffect(() => {
    if (!autoScroll) return;
    setIsSpinning(true);
    setHasStopped(false);
 
    // Casino-style spin: 2-3 full rotations, always land on Life Predictor
    const cardWidth = 320 + 32; // card width + margin
    const containerWidth = carouselRef.current?.clientWidth || 1200;
    const centerOffset = (containerWidth / 2) - (cardWidth / 2);
    const totalCards = items.length;
    const totalRotations = 2 + Math.floor(Math.random() * 2); // 2-3 full spins
    const fullRotationDistance = totalCards * cardWidth;
    const finalCardOffset = stopAtIndex * cardWidth;
    const totalSpinDistance = (totalRotations * fullRotationDistance) + finalCardOffset;
    const finalPos = totalSpinDistance - centerOffset;
 
    let start = 0;
    let current = 0;
    let duration = 1800 + Math.random() * 400; // 1.8-2.2s
    let startTime: number | null = null;
 
    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }
 
    function animateScroll(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      current = start + (finalPos - start) * eased;
      if (carouselRef.current) {
        carouselRef.current.scrollLeft = current;
      }
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        // Snap to final position to avoid any browser scroll rounding
        if (carouselRef.current) {
          carouselRef.current.scrollLeft = finalPos;
        }
        setIsSpinning(false);
        setHasStopped(true);
        if (onStopScrolling) onStopScrolling();
      }
    }
 
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
      requestAnimationFrame(animateScroll);
    }
  }, [autoScroll, items.length, stopAtIndex, onStopScrolling]);
 
  // Create extended array for smooth infinite spinning
  const extendedItems: AppCardProps[] = [];
  for (let i = 0; i < 8; i++) {
    extendedItems.push(...items);
  }
 
  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div
        ref={carouselRef}
        className="flex overflow-x-auto no-scrollbar py-4 scroll-smooth min-h-[20rem]"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        {extendedItems.map((item, index) => {
          const actualIndex = index % items.length;
          const isCenterCard = hasStopped && actualIndex === stopAtIndex;
          return (
            <AppCard
              key={`${actualIndex}-${Math.floor(index / items.length)}`}
              Icon={item.Icon}
              title={item.title}
              description={item.description}
              onClick={isCenterCard ? item.onClick : () => {}}
            />
          );
        })}
      </div>
    </div>
  );
};
 
const hexCards = [
  {
    title: "Star Map",
    description: "Planetary transits & karmic insights",
    Icon: Sparkles,
  },
  {
    title: "Vibrational Frequency",
    description: "Your current energy reading",
    Icon: Zap,
  },
  {
    title: "Aura Profile",
    description: "Color, emotion, protection & openness",
    Icon: Eye,
  },
  {
    title: "Life Predictor",
    description: "Your first step of the journey",
    Icon: Star,
  },
  {
    title: "Flame Score",
    description: "Your spiritual evolution meter",
    Icon: Flame,
  },
  {
    title: "Kosha Scan",
    description: "The balance across your 5 inner bodies",
    Icon: Layers,
  },
  {
    title: "Longevity Index",
    description: "Energy-nutrition alignment & tips",
    Icon: Heart,
  },
];
 
const hexPositions = [
  { top: '0%', left: '50%', translate: '-50%, 0' }, // top
  { top: '20%', left: '88%', translate: '-50%, -50%' }, // top-right
  { top: '70%', left: '88%', translate: '-50%, -50%' }, // bottom-right
  { top: '100%', left: '50%', translate: '-50%, -100%' }, // bottom
  { top: '70%', left: '12%', translate: '-50%, -50%' }, // bottom-left
  { top: '20%', left: '12%', translate: '-50%, -50%' }, // top-left
  { top: '50%', left: '50%', translate: '-50%, -50%' }, // center
];
 
const LineCarousel: React.FC<{ onCenterClick: () => void }> = ({ onCenterClick }) => {
  const [spread, setSpread] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const centerIdx = 3; // Life Predictor is the 4th card (index 3)
  const spacing = 260;
 
  useEffect(() => {
    const t1 = setTimeout(() => setSpread(true), 600);
    const t2 = setTimeout(() => setShowTitle(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
 
  // Motion variants for staggered spread
  const cardVariants = {
    stacked: (custom: number) => ({
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      zIndex: custom === centerIdx ? 20 : 10,
      filter: 'none',
    }),
    spread: (custom: number) => ({
      x: (custom - centerIdx) * spacing,
      y: custom === centerIdx ? -48 : 0,
      scale: custom === centerIdx ? 1.18 : 1,
      opacity: 1,
      zIndex: custom === centerIdx ? 20 : 10 - Math.abs(custom - centerIdx),
      filter: custom === centerIdx ? 'none' : 'blur(4px)',
      transition: {
        x: { type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.08 * Math.abs(custom - centerIdx) },
        y: { type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.08 * Math.abs(custom - centerIdx) },
        scale: { type: 'spring' as const, stiffness: 120, damping: 18, delay: 0.08 * Math.abs(custom - centerIdx) },
        filter: { delay: 0.08 * Math.abs(custom - centerIdx), duration: 0.3 },
      }
    })
  };
 
  return (
    <div className="relative w-full flex items-center justify-center" style={{ height: 500 }}>
      {/* Title appears after spread - moved outside card row for visibility */}
      {showTitle && (
        <motion.h2
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="fixed left-1/2 top-10 -translate-x-1/2 text-5xl md:text-7xl font-light bg-gradient-to-br from-purple-500 via-pink-400 to-indigo-400 bg-clip-text text-transparent leading-[1.2] pb-2 antialiased z-50 pointer-events-none"
        >
          Let us begin our journey.
        </motion.h2>
      )}
      {/* Cards stacked and then spread */}
      {hexCards.map((card, i) => {
        const isCenter = i === centerIdx;
        return (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            initial="stacked"
            animate={spread ? "spread" : "stacked"}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ zIndex: isCenter ? 20 : 10 - Math.abs(i - centerIdx) }}
          >
            <AppCard
              Icon={card.Icon}
              title={card.title}
              description={card.description}
              onClick={isCenter ? onCenterClick : () => {}}
            >
              {isCenter && (
                <button
                  className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold text-lg shadow-lg hover:scale-105 transition-transform"
                  onClick={onCenterClick}
                >
                  Begin path
                </button>
              )}
            </AppCard>
          </motion.div>
        );
      })}
    </div>
  );
};
 
const OnboardingSplashScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [showFlip, setShowFlip] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const [carouselStopped, setCarouselStopped] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const navigate = useNavigate();
 
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setCurrentStep(1), 300))
    timers.push(setTimeout(() => setCurrentStep(2), 3000))
    timers.push(setTimeout(() => setShowFlip(true), 5000))
    timers.push(setTimeout(() => setCurrentStep(3), 7000))
    timers.push(setTimeout(() => setCurrentStep(4), 10000))
    timers.push(setTimeout(() => {
      setCurrentStep(5)
      setShowCards(true)
    }, 15000))
    return () => timers.forEach(clearTimeout)
  }, [])
 
  const handleCarouselStop = () => {
    setCarouselStopped(true)
    setTimeout(() => {
      setShowTitle(true)
    }, 50)
  }
 
  const cards: AppCardProps[] = [
    {
      title: "Life Predictor",
      description: "Your first step of the journey",
      Icon: Star,
      onClick: () => navigate('/onboarding-life-predictor'),
    },
    {
      title: "Star Map",
      description: "Planetary transits & karmic insights",
      Icon: Sparkles,
      onClick: () => {},
    },
    {
      title: "Vibrational Frequency",
      description: "Your current energy reading",
      Icon: Zap,
      onClick: () => {},
    },
    {
      title: "Aura Profile",
      description: "Color, emotion, protection & openness",
      Icon: Eye,
      onClick: () => {},
    },
    {
      title: "Flame Score",
      description: "Your spiritual evolution meter",
      Icon: Flame,
      onClick: () => {},
    },
    {
      title: "Kosha Scan",
      description: "The balance across your 5 inner bodies",
      Icon: Layers,
      onClick: () => {},
    },
    {
      title: "Longevity Index",
      description: "Energy-nutrition alignment & tips",
      Icon: Heart,
      onClick: () => {},
    },
  ]
 
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
 
  const styles = `
    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: scale(1); }
      to { opacity: 0; transform: scale(0.8); }
    }
    @keyframes flipOut {
      from { transform: rotateX(0deg); }
      to { transform: rotateX(-90deg); }
    }
    @keyframes flipIn {
      from { transform: rotateX(90deg); }
      to { transform: rotateX(0deg); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.08); opacity: 0.8; }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.5); }
      50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }
    }
    @keyframes slideInStagger {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-scale { animation: fadeInScale 1.2s ease-out forwards; }
    .animate-fade-out { animation: fadeOut 1s ease-out forwards; }
    .animate-flip-out { animation: flipOut 0.5s ease-in forwards; }
    .animate-flip-in { animation: flipIn 0.5s ease-out forwards; }
    .animate-float { animation: float 4s ease-in-out infinite; }
    .animate-pulse-gentle { animation: pulse 3s ease-in-out infinite; }
    .animate-glow { animation: glow 2.5s ease-in-out infinite; }
    .animate-slide-in-stagger { animation: slideInStagger 0.8s ease-out forwards; }
    .perspective-1000 { perspective: 1000px; }
    .transform-style-preserve-3d { transform-style: preserve-3d; }
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
  `
 
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 flex items-center justify-center overflow-hidden relative">
      <style>{styles}</style>
      {/* Twinkling Stars */}
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
            animationDelay: sparkle.delay
          }}
        />
      ))}
      {showTitle && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20" style={{overflow: 'visible'}}>
          <h2
            className="mb-16 text-6xl md:text-5xl font-light animate-fade-in-scale bg-gradient-to-br from-purple-500 via-pink-400 to-indigo-400 bg-clip-text text-transparent leading-[1.2] pb-2 antialiased mb-16"
          >
            Let's begin our journey
          </h2>
        </div>
      )}
      <div className="flex items-center justify-center min-h-screen w-full px-4 overflow-hidden">
        <div className="text-center w-full max-w-7xl relative">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center h-full"
              >
                <h1 className="text-7xl md:text-8xl font-light tracking-wide mb-8 bg-gradient-to-br from-purple-500 via-pink-400 to-indigo-400 bg-clip-text text-transparent leading-[1.2] pb-2 antialiased">
                  Welcome to Eternal
                </h1>
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center h-full"
              >
                <p className="text-5xl md:text-6xl font-light leading-[1.2] pb-2 antialiased bg-gradient-to-br from-purple-500 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                  Generate personal reports in{" "}
                  <span className="relative inline-block perspective-1000 align-baseline" style={{ minWidth: '10ch' }}>
                    <span className={`inline-block align-baseline transition-all duration-300 transform-style-preserve-3d ${showFlip ? 'animate-flip-out' : ''} bg-gradient-to-br from-purple-500 via-pink-400 to-indigo-400 bg-clip-text text-transparent font-light`} style={{ width: '10ch', textAlign: 'left' }}>
                      minutes.
                    </span>
                    <span className={`absolute inset-0 inline-block align-baseline transition-all duration-300 transform-style-preserve-3d ${showFlip ? 'animate-flip-in' : 'opacity-0'} bg-gradient-to-br from-purple-500 via-pink-400 to-indigo-400 bg-clip-text text-transparent font-light`} style={{ animationDelay: '0.3s', width: '10ch', textAlign: 'left' }}>
                      <span className={`transition-all duration-300 ${showFlip ? 'underline decoration-purple-500 decoration-2 underline-offset-4' : ''}`} style={{ transitionDelay: showFlip ? '0.25s' : '0s' }}>seconds.</span>
                    </span>
                  </span>
                </p>
              </motion.div>
            )}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center h-full"
                style={{ overflow: 'visible' }}
              >
                <div className="flex flex-col items-center justify-center gap-8">
                  <p
                    className="text-4xl md:text-5xl font-light mb-12 bg-gradient-to-br from-purple-500 via-pink-400 to-indigo-400 bg-clip-text text-transparent"
                  >
                    Powered by Eternal AI
                  </p>
                  <div className="w-32 h-32 relative">
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-float opacity-90 shadow-lg"></div>
                    <div className="absolute inset-3 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full animate-pulse-gentle"></div>
                    <div className="absolute inset-6 bg-gradient-to-br from-white to-purple-100 rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            )}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: showCards ? -200 : 0, opacity: showCards ? 0 : 1 }}
                exit={{ y: -200, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center overflow-visible"
              >
                <h2 className="text-4xl md:text-5xl font-light mb-12 bg-gradient-to-br from-purple-500 via-pink-400 to-indigo-400 bg-clip-text text-transparent leading-[1.2] pb-2 antialiased text-center">
                  We just need 4 things from you
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                  {/* Item 1: Birth time, date & place */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-white rounded-xl p-6 shadow-lg flex items-center space-x-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">⭐</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Your birth time, date & place</h3>
                      <p className="text-gray-600 text-sm">Essential for accurate astrological insights.</p>
                    </div>
                  </motion.div>

                  {/* Item 2: Your mood & state (today) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-white rounded-xl p-6 shadow-lg flex items-center space-x-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">🌙</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Your mood & state (today)</h3>
                      <p className="text-gray-600 text-sm">Helps personalize your daily reports.</p>
                    </div>
                  </motion.div>

                  {/* Item 3: A short face scan (optional) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="bg-white rounded-xl p-6 shadow-lg flex items-center space-x-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">📸</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">A short face scan (optional)</h3>
                      <p className="text-gray-600 text-sm">For deeper insights into your energy.</p>
                    </div>
                  </motion.div>

                  {/* Item 4: Your daily routine */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="bg-white rounded-xl p-6 shadow-lg flex items-center space-x-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">⏰</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Your daily routine</h3>
                      <p className="text-gray-600 text-sm">To align reports with your lifestyle.</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {showCards && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="w-full flex flex-col items-center justify-center overflow-visible mt-15">
                <h2 className="mb-16 text-6xl md:text-7xl font-light bg-gradient-to-br from-purple-500 via-pink-400 to-indigo-400 bg-clip-text text-transparent animate-fade-in-scale">
                  Let's start now!
                </h2>
                <div className="flex gap-8 overflow-visible">
                  {hexCards.map((card, i) => {
                    const isCenter = i === 3;
                    return (
                      <div
                        key={i}
                        className={`transition-all duration-300 ${isCenter ? "scale-110 shadow-xl border-2 border-purple-400 z-10" : "opacity-90"}`}
                        style={{ background: isCenter ? "white" : undefined, borderRadius: "1rem" }}
                      >
                        <AppCard
                          Icon={card.Icon}
                          title={card.title}
                          description={card.description}
                          onClick={isCenter ? () => navigate('/onboarding-life-predictor') : () => {}}
                        >
                          {isCenter && (
                            <button
                              className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold text-lg shadow-lg hover:scale-105 transition-transform"
                              onClick={() => navigate('/onboarding-life-predictor')}
                            >
                              Begin path
                            </button>
                          )}
                        </AppCard>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      {/* Remove AnimatePresence for chat */}
      {/* {showChat && (
        <motion.div
          key="chat"
          initial={{ opacity: 0, y: 200 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 200 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="w-full h-full absolute top-0 left-0"
        >
          <OnboardingLifePredictor animateStaged={true} />
        </motion.div>
      )} */}
    </div>
  )
}
 
export default OnboardingSplashScreen;
 