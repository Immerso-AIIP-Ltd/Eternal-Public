import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DevicePreview } from './DevicePreview';
import { BackgroundDecorations } from './BackgroundDecorations';

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 relative overflow-hidden">
      <BackgroundDecorations />
      {/* Header */}
      <header className="relative z-10 pt-8 pb-4">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-cyan-100 text-cyan-600 rounded-full text-sm font-medium">
              Eternal AI
            </span>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="relative z-10 flex-1">
        <div className="container mx-auto px-6 h-full flex items-center justify-center" style={{ minHeight: '80vh' }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center justify-center max-w-7xl mx-auto">
            {/* Left Side - Device Preview */}
            <div className="flex justify-center lg:justify-start">
              <DevicePreview />
            </div>
            {/* Right Side - Content */}
            <div className="text-left space-y-8 ml-8 md:ml-16">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-purple-900 leading-tight max-w-x1">
                  <span className="block">Eternal AI</span>
                  <span className="block text-purple-400">Your personal AI companion for</span>
                  <span className="block">Spiritual Exploration</span>
                </h1>
                <p className="text-lg text-purple-600 max-w-2xl leading-relaxed">
                  Eternal AI empowers you to reflect, grow, and connect deeply with your spiritual self. Through
                  thoughtful prompts, intelligent guidance, and a serene interface, it helps you navigate your inner
                  journey. Whether you're journaling, meditating, or seeking clarity, Eternal is here to walk with
                  you—every step, every insight, every breakthrough.
                </p>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-row gap-4 justify-start">
                <a
                  href="/coming-soon"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg text-center"
                  style={{ textDecoration: 'none' }}
                >
                  🚀 Get the App Now
                </a>
                <Link
                  to="/login"
                  className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-3 rounded-full font-semibold transition-all duration-300 bg-transparent text-lg text-center"
                  style={{ textDecoration: 'none' }}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}