import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Compass, User, ArrowLeft, Bell, Star, Rocket } from "lucide-react";

export default function ComingSoon() {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  // Sparkle positions
  const sparkles = [
    { top: "15%", left: "8%", size: "12px", delay: "0s" },
    { top: "25%", left: "85%", size: "16px", delay: "1s" },
    { top: "45%", left: "12%", size: "10px", delay: "2s" },
    { top: "65%", left: "75%", size: "14px", delay: "0.5s" },
    { top: "80%", left: "20%", size: "8px", delay: "1.5s" },
    { top: "35%", right: "10%", size: "12px", delay: "2.5s" },
    { top: "55%", left: "5%", size: "16px", delay: "3s" },
    { top: "75%", right: "15%", size: "10px", delay: "0.8s" },
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleBackClick = () => {
    navigate("/");
  };
  const handleSignInClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 relative overflow-hidden flex items-center justify-center">
      {/* Sparkles */}
      {sparkles.map((sparkle, idx) => (
        <div
          key={idx}
          className="sparkle"
          style={{
            position: "absolute",
            top: sparkle.top,
            left: sparkle.left,
            right: sparkle.right,
            width: sparkle.size,
            height: sparkle.size,
            opacity: 0.7,
            animation: `sparkle 3s ease-in-out infinite`,
            animationDelay: sparkle.delay,
          }}
        />
      ))}
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-7xl mx-auto w-full px-4 md:px-8">
        {/* Phone Mockup */}
        <div className={`relative flex-shrink-0 order-2 lg:order-1 ${isLoaded ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`} style={{ transition: "opacity 1s ease-out 0.3s, transform 1s ease-out 0.3s" }}>
          <div className="relative w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
            <div className="w-full h-full bg-gradient-to-b from-purple-50 to-purple-100 rounded-[2.5rem] overflow-hidden flex flex-col relative">
              {/* Status Bar */}
              <div className="flex justify-between items-center px-6 py-3 text-xs text-gray-600">
                <span className="font-semibold">9:41</span>
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="w-6 h-3 border border-gray-400 rounded-sm ml-1">
                    <div className="w-4 h-1.5 bg-green-500 rounded-sm m-0.5"></div>
                  </div>
                </div>
              </div>
              {/* App Header */}
              <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-purple-900 text-base">Eternal AI</h2>
                    <p className="text-xs text-purple-600">Your spiritual companion</p>
                  </div>
                </div>
              </div>
              {/* Coming Soon Content */}
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-purple-400/30">
                  <Rocket className="w-10 h-10 text-purple-300 animate-pulse" />
                </div>
                <h2 className="text-purple-700 text-2xl font-bold mb-4">Launching Soon</h2>
                <p className="text-purple-600 text-base mb-6 text-center">Your journey of inner growth and spiritual exploration begins soon.</p>
                <div className="flex justify-center space-x-2 mb-6">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-400"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Content (optional, can be removed if not needed) */}
        <div className={`flex-1 max-w-xl lg:max-w-2xl text-center lg:text-left order-1 lg:order-2 lg:ml-8 xl:ml-12 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transition: "opacity 1s ease-out 0.5s, transform 1s ease-out 0.5s" }}>
          <h1 className="text-3xl font-bold text-purple-900 mb-4">Eternal AI is Coming Soon</h1>
          <p className="text-lg text-purple-700 mb-8">Your personal companion for inner growth and spiritual exploration is launching soon. Get ready to embark on a transformative journey of self-discovery.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button onClick={handleBackClick} className="flex items-center gap-2 bg-white text-purple-700 border-2 border-purple-200 px-6 py-2 rounded-full font-semibold shadow hover:bg-purple-50 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <button onClick={handleSignInClick} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-full font-semibold shadow hover:from-purple-700 hover:to-purple-800 transition-all">
              <User className="w-4 h-4" />
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 