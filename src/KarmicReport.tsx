// Enhanced KarmicReport with AI-generated content
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import KarmicReportChat from './KarmicReportChat';
// If you see a linter error for this, run: npm install react-markdown
import ReactMarkdown from 'react-markdown';

interface KarmicReportData {
  birthPlace?: string;
  lifeArea?: string;
  challenge?: string;
  jyotishReading?: string;
  chartImages?: {
    rasiChart?: string;
    navamshaChart?: string;
    [key: string]: any;
  };
  birthData?: {
    location?: string;
    dob?: string;
    tob?: string;
    timezone?: string;
  };
  lat?: number;
  lng?: number;
  vedicApi?: any;
  rapidApi?: any;
  aiGeneratedkarmicreport?: string;
  aiReportMetadata?: {
    generatedAt?: string;
    model?: string;
    tokensUsed?: number;
    [key: string]: any;
  };
}

const KarmicReport = () => {
  const [reportData, setReportData] = useState<KarmicReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'report' | 'charts' | 'chat'>('report');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadKarmicReport();
    // eslint-disable-next-line
  }, [currentUser, navigate]);

  const loadKarmicReport = async () => {
    try {
      setLoading(true);
      
      const reportDoc = await getDoc(doc(db, 'karmicReports', currentUser.uid));
      
      if (!reportDoc.exists()) {
        setError('No karmic report found. Please complete the onboarding process first.');
        navigate('/onboarding-life-predictor');
        return;
      }

      const data = reportDoc.data();
      setReportData(data as KarmicReportData);
      
      // Check if AI report exists
      if (!data.aiGeneratedkarmicreport) {
        console.warn('AI-generated report not found, showing fallback content');
      }

    } catch (err) {
      console.error('Error loading karmic report:', err);
      setError('Failed to load your karmic report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl">Loading your cosmic insights...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">🌌</div>
          <h2 className="text-2xl font-bold mb-4">Cosmic Alignment Issue</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => navigate('/onboarding-life-predictor')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Start New Reading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              🌟 Your Karmic Life Prediction
            </h1>
            <p className="text-xl opacity-90">
              Born in {reportData.birthPlace} on {reportData.birthData?.dob}
            </p>
            <p className="text-lg opacity-80 mt-2">
              Area of Focus: {reportData.lifeArea}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('report')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'report'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📖 AI Prediction Report
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'charts'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Birth Charts
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              💬 Ask Questions
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'report' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Report Header */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Personalized Life Prediction
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Generated using advanced AI with Vedic astrology and Western numerology
                  </p>
                </div>
                {reportData.aiReportMetadata?.generatedAt && (
                  <div className="text-right text-sm text-gray-500">
                    <p>Generated on</p>
                    <p>{new Date(reportData.aiReportMetadata.generatedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI-Generated Report Content */}
            <div className="p-8">
              {reportData.aiGeneratedkarmicreport ? (
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: (props) => <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-purple-200 pb-3" {...props} />,
                      h2: (props) => <h2 className="text-2xl font-semibold text-purple-800 mb-4 mt-8" {...props} />,
                      h3: (props) => <h3 className="text-xl font-semibold text-blue-700 mb-3 mt-6" {...props} />,
                      p: (props) => <p className="text-gray-700 mb-4 leading-relaxed" {...props} />,
                      ul: (props) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2" {...props} />,
                      li: (props) => <li className="leading-relaxed" {...props} />,
                      strong: (props) => <strong className="font-semibold text-purple-700" {...props} />,
                      em: (props) => <em className="italic text-blue-600" {...props} />
                    }}
                  >
                    {reportData.aiGeneratedkarmicreport}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔮</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Report Generation in Progress
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your personalized karmic report is being crafted by our AI. 
                    Please check back in a few moments or try refreshing the page.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Refresh Report
                  </button>
                </div>
              )}

              {/* Report Metadata */}
              {reportData.aiReportMetadata && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">Report Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>🤖 Generated using: {reportData.aiReportMetadata.model || 'GPT-4o'}</p>
                    {reportData.aiReportMetadata.tokensUsed && (
                      <p>⚡ Processing power used: {reportData.aiReportMetadata.tokensUsed.toLocaleString()} tokens</p>
                    )}
                    <p>✨ Data sources: Vedic Astrology (50%) + Western Numerology (50%)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vedic Charts */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4">
                <h3 className="text-xl font-bold text-gray-900">
                  🕉️ Vedic Astrology Charts
                </h3>
                <p className="text-gray-600">Traditional Jyotish analysis</p>
              </div>
              <div className="p-6 space-y-6">
                {reportData.chartImages?.rasiChart && (
                  <div>
                    <h4 className="font-semibold mb-3">Rasi Chart (D1)</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={reportData.chartImages.rasiChart}
                        alt="Rasi Chart"
                        className="w-full h-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          ((e.target as HTMLImageElement).nextSibling as HTMLElement).style.display = 'block';
                        }}
                      />
                      <div className="hidden p-4 text-center text-gray-500">
                        Chart temporarily unavailable
                      </div>
                    </div>
                  </div>
                )}
                
                {reportData.chartImages?.navamshaChart && (
                  <div>
                    <h4 className="font-semibold mb-3">Navamsha Chart (D9)</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={reportData.chartImages.navamshaChart}
                        alt="Navamsha Chart"
                        className="w-full h-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          ((e.target as HTMLImageElement).nextSibling as HTMLElement).style.display = 'block';
                        }}
                      />
                      <div className="hidden p-4 text-center text-gray-500">
                        Chart temporarily unavailable
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Western Numerology */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4">
                <h3 className="text-xl font-bold text-gray-900">
                  🔢 Western Numerology
                </h3>
                <p className="text-gray-600">Core numbers and meanings</p>
              </div>
              <div className="p-6">
                {reportData.rapidApi && (
                  <div className="space-y-4">
                    {/* Life Path Number */}
                    {reportData.rapidApi.life_path_number && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">
                          Life Path Number: {reportData.rapidApi.life_path_number.result}
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {reportData.rapidApi.life_path_number.meaning}
                        </p>
                      </div>
                    )}

                    {/* Destiny Number */}
                    {reportData.rapidApi.destiny_number && (
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-purple-800 mb-2">
                          Destiny Number: {reportData.rapidApi.destiny_number.result}
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {reportData.rapidApi.destiny_number.meaning}
                        </p>
                      </div>
                    )}

                    {/* Soul Urge Number */}
                    {reportData.rapidApi.soul_urge_number && (
                      <div className="p-4 bg-indigo-50 rounded-lg">
                        <h4 className="font-semibold text-indigo-800 mb-2">
                          Soul Urge Number: {reportData.rapidApi.soul_urge_number.result}
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {reportData.rapidApi.soul_urge_number.meaning}
                        </p>
                      </div>
                    )}

                    {/* Challenge Number */}
                    {reportData.challenge && (
                      <div className="p-4 bg-red-50 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">
                          Challenge Number: {reportData.challenge}
                        </h4>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <KarmicReportChat userData={reportData} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            ✨ Your karmic journey is unique. Use these insights as guidance for your personal growth.
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Continue Your Spiritual Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default KarmicReport;