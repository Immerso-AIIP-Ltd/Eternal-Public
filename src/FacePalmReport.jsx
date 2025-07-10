// FacePalmReport.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, Hand, Sparkles, Calendar, Heart, Brain, TrendingUp, Star, ArrowLeft, Download, Share2 } from 'lucide-react';
import { processAnalysisText, ensureCompleteReportData } from './responseParser';
// If you need GPT-4 Vision service, import it here:
// import { analyzeImagesWithGPT4Vision, getMockAnalysisData } from './gpt4VisionService';

const FacePalmReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [analysisMeter, setAnalysisMeter] = useState(0);
  const [rawResponse, setRawResponse] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  // Get image URLs from navigation state
  const { faceDownloadUrl, palmDownloadUrl } = location.state || {};

  useEffect(() => {
    // Redirect back if no image URLs provided
    if (!faceDownloadUrl || !palmDownloadUrl) {
      navigate('/upload', { replace: true });
      return;
    }

    // Generate report based on images
    generateReport();
    // eslint-disable-next-line
  }, [faceDownloadUrl, palmDownloadUrl, navigate]);

  const generateReport = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Calling GPT-4o API...');
      const response = await fetch('/api/gpt4vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faceUrl: faceDownloadUrl,
          palmUrl: palmDownloadUrl
        })
      });
      const aiResponseText = await response.text();
      setRawResponse(aiResponseText); // Save raw response for debug
      console.log('Received response from GPT-4o:', aiResponseText);

      let parsed = processAnalysisText(aiResponseText);
      parsed = ensureCompleteReportData(parsed);
      setReportData(parsed);
    } catch (err) {
      setError('Failed to generate report. Please try again.');
      console.error('Report generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startAnalysisMeter = () => {
    // Animate the analysis meter from 0 to 100 over 3 seconds
    const maxValue = 100;
    const duration = 3000; // 3 seconds
    const steps = 60;
    const stepValue = maxValue / steps;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const animate = () => {
      if (currentStep <= steps) {
        const currentValue = Math.min(currentStep * stepValue, maxValue);
        setAnalysisMeter(currentValue);
        currentStep++;
        if (currentStep <= steps) {
          setTimeout(animate, stepDuration);
        }
      }
    };
    
    setTimeout(animate, 500); // Start animation after 500ms
  };

  const handleRetry = () => {
    generateReport();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Face & Palm Reading Report',
        text: 'Check out my personalized mystical reading!',
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    // Implement PDF download functionality
    alert('Download functionality would be implemented here');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md">
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto">
              <div className="w-28 h-28 rounded-full bg-purple-900/50 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{Math.round(analysisMeter)}%</span>
              </div>
            </div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-yellow-300 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Images</h2>
          <p className="text-purple-200 mb-4">Our mystical AI is reading your face and palm patterns...</p>
          
          <div className="space-y-3 mb-6">
            <div>
              <p className="text-purple-200 mb-1 text-sm">Facial structure analysis</p>
              <div className="h-2 bg-purple-900/30 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(analysisMeter * 1.2, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <p className="text-purple-200 mb-1 text-sm">Palm line interpretation</p>
              <div className="h-2 bg-purple-900/30 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(analysisMeter * 0.9, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <p className="text-purple-200 mb-1 text-sm">Personality traits mapping</p>
              <div className="h-2 bg-purple-900/30 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(analysisMeter * 0.8, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <p className="text-white/70 text-sm italic">This may take a minute as our AI deeply analyzes your unique characteristics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h2>
          <p className="text-purple-200 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center text-purple-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Upload
          </button>
          <h1 className="text-2xl font-bold text-white">Your Mystical Reading</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 bg-purple-600/30 hover:bg-purple-600/50 rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5 text-purple-200" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-purple-600/30 hover:bg-purple-600/50 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5 text-purple-200" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Overall Score */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-4">
              <div className="w-28 h-28 rounded-full bg-purple-900/50 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{reportData.overallScore}</span>
              </div>
            </div>
            <Star className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 fill-current" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Your Mystical Score</h2>
          <p className="text-purple-200">A harmonious blend of facial features and palm lines</p>
        </div>

        {/* Image Display and Analysis */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-purple-400 mr-2" />
              <h3 className="text-xl font-bold text-white">Face Analysis</h3>
            </div>
            <div className="aspect-square bg-purple-900/30 rounded-xl overflow-hidden mb-4">
              <img
                src={faceDownloadUrl}
                alt="Face analysis"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-purple-200 mb-2">Face Shape: {reportData.faceAnalysis.faceShape}</h4>
                <p className="text-gray-300 text-sm">{reportData.faceAnalysis.faceShapeMeaning}</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-200 mb-2">Dominant Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {reportData.faceAnalysis.dominantTraits.map((trait, index) => (
                    <span
                      key={index}
                      className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-sm"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-purple-200 mb-1">Personality</h4>
                <p className="text-gray-300 text-sm">{reportData.faceAnalysis.personality}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <Hand className="w-6 h-6 text-purple-400 mr-2" />
              <h3 className="text-xl font-bold text-white">Palm Reading</h3>
            </div>
            <div className="aspect-square bg-purple-900/30 rounded-xl overflow-hidden mb-4">
              <img
                src={palmDownloadUrl}
                alt="Palm analysis"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-purple-200 mb-2">Hand Type: {reportData.palmAnalysis.handType}</h4>
                <p className="text-gray-300 text-sm">{reportData.palmAnalysis.handTypeMeaning}</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-200 mb-1">Life Line</h4>
                <p className="text-gray-300 text-sm">{reportData.palmAnalysis.lifeLine}</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-200 mb-1">Heart Line</h4>
                <p className="text-gray-300 text-sm">{reportData.palmAnalysis.heartLine}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights Sections */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <div className="flex items-center mb-6">
            <Sparkles className="w-6 h-6 text-yellow-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Key Insights</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Face Features Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-pink-300 mb-2 border-b border-white/10 pb-2">Facial Features</h4>
              
              <div>
                <h5 className="text-purple-200 text-sm font-medium">Forehead</h5>
                <p className="text-gray-300 text-sm">{reportData.faceAnalysis.forehead}</p>
              </div>
              
              <div>
                <h5 className="text-purple-200 text-sm font-medium">Eyes</h5>
                <p className="text-gray-300 text-sm">{reportData.faceAnalysis.eyes}</p>
              </div>
              
              <div>
                <h5 className="text-purple-200 text-sm font-medium">Nose</h5>
                <p className="text-gray-300 text-sm">{reportData.faceAnalysis.nose}</p>
              </div>
              
              <div>
                <h5 className="text-purple-200 text-sm font-medium">Lips</h5>
                <p className="text-gray-300 text-sm">{reportData.faceAnalysis.lips}</p>
              </div>
              
              <div>
                <h5 className="text-purple-200 text-sm font-medium">Chin</h5>
                <p className="text-gray-300 text-sm">{reportData.faceAnalysis.chin}</p>
              </div>
            </div>
            
            {/* Palm Details Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-green-300 mb-2 border-b border-white/10 pb-2">Palm Details</h4>
              
              <div>
                <h5 className="text-purple-200 text-sm font-medium">Head Line</h5>
                <p className="text-gray-300 text-sm">{reportData.palmAnalysis.headLine}</p>
              </div>
              
              <div>
                <h5 className="text-purple-200 text-sm font-medium">Fate Line</h5>
                <p className="text-gray-300 text-sm">{reportData.palmAnalysis.fateLine}</p>
              </div>
              
              <div>
                <h5 className="text-purple-200 text-sm font-medium">Mount of Venus</h5>
                <p className="text-gray-300 text-sm">{reportData.palmAnalysis.mountOfVenus}</p>
              </div>
              
              <div>
                <h5 className="text-purple-200 text-sm font-medium">Finger Analysis</h5>
                <p className="text-gray-300 text-sm">{reportData.palmAnalysis.fingerAnalysis}</p>
              </div>
              
              <div>
                <h5 className="text-purple-200 text-sm font-medium">Special Markings</h5>
                <p className="text-gray-300 text-sm">{reportData.palmAnalysis.specialMarkings}</p>
              </div>
            </div>
            
            {/* Life Path Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-300 mb-2 border-b border-white/10 pb-2">Life Path</h4>
              
              <div>
                <h5 className="text-purple-200 text-sm font-medium">Life Phase</h5>
                <p className="text-gray-300 text-sm">{reportData.faceAnalysis.lifePhase}</p>
              </div>
              
              <div>
                <h5 className="text-purple-200 text-sm font-medium">Energy Level</h5>
                <p className="text-gray-300 text-sm">{reportData.faceAnalysis.energyLevel}</p>
              </div>
              
              <div>
                <h5 className="text-purple-200 text-sm font-medium">Destiny Path</h5>
                <p className="text-gray-300 text-sm">{reportData.palmAnalysis.destinyPath}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <Heart className="w-6 h-6 text-pink-400 mr-2" />
              <h3 className="text-xl font-bold text-white">Compatibility & Traits</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-purple-200 mb-2">Best Matches</h4>
                <div className="flex flex-wrap gap-2">
                  {reportData.compatibility.bestMatches.map((match, index) => (
                    <span
                      key={index}
                      className="bg-pink-600/30 text-pink-200 px-3 py-1 rounded-full text-sm"
                    >
                      {match}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-purple-200 mb-2">Growth Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {reportData.compatibility.challenges.map((challenge, index) => (
                    <span
                      key={index}
                      className="bg-orange-600/30 text-orange-200 px-3 py-1 rounded-full text-sm"
                    >
                      {challenge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
              <h3 className="text-xl font-bold text-white">Future Insights</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-purple-200 mb-1">Career</h4>
                <p className="text-gray-300 text-sm">{reportData.predictions.career}</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-200 mb-1">Relationships</h4>
                <p className="text-gray-300 text-sm">{reportData.predictions.relationships}</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-200 mb-1">Spiritual Growth</h4>
                <p className="text-gray-300 text-sm">{reportData.predictions.spiritual}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <Brain className="w-6 h-6 text-blue-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Personal Recommendations</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {reportData.compatibility.recommendations.map((rec, index) => (
              <div key={index} className="bg-purple-900/30 rounded-xl p-4 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="font-semibold text-white mb-1">{rec}</h4>
                <p className="text-gray-300 text-sm">Recommended for your spiritual journey</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center mb-8">
          <p className="text-purple-200/70 text-sm italic">
            This reading is for entertainment purposes only and should not be used for making important life decisions.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/upload')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
            >
              Get Another Reading
            </button>
            
            <button
              onClick={handleDownload}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
            >
              Download Report
            </button>
            
            <button
              onClick={() => navigate('/report-chat')}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
            >
              <span className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Ask AI About Reading
              </span>
            </button>
          </div>
        </div>

        {/* Debug Button and Raw Response */}
        <div className="text-center mt-6">
          <button
            onClick={() => setShowDebug(v => !v)}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg font-mono text-sm hover:bg-gray-700"
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
          {showDebug && (
            <pre className="mt-4 p-4 bg-black text-green-300 rounded-lg overflow-x-auto text-left max-w-full" style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
              {rawResponse}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacePalmReport;