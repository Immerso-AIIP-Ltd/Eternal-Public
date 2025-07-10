export function LaptopPreview() {
  return (
    <div className="relative cursor-pointer">
      {/* Just the Laptop Screen - No Base */}
      <div className="w-[540px] h-[340px] bg-gradient-to-b from-gray-800 via-gray-700 to-gray-600 rounded-lg p-1.5 shadow-2xl mx-auto">
        {/* Screen Bezel */}
        <div className="w-full h-full bg-black rounded-lg overflow-hidden relative p-1.5">
          {/* Actual Screen */}
          <div className="w-full h-full bg-white rounded-md overflow-hidden">
            {/* Browser Chrome with URL */}
            <div className="h-10 bg-gray-100 border-b flex items-center px-4 gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex-1 mx-3">
                <div className="h-6 bg-white rounded text-sm flex items-center px-4 text-gray-700 border border-gray-300 shadow-sm">
                  🔒 eternal-ai.com/aura-reading
                </div>
              </div>
              <div className="flex gap-1">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
              </div>
            </div>
            {/* Aura Report Content */}
            <div className="p-4 h-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-purple-900">Your Aura Reading</h2>
                <div className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full">Live Analysis</div>
              </div>
              <div className="grid grid-cols-3 gap-4 h-full">
                {/* Left Column - Aura Visualization */}
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Aura Colors</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                        <span className="text-sm text-gray-600">Blue - Calm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
                        <span className="text-sm text-gray-600">Purple - Spiritual</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                        <span className="text-sm text-gray-600">Green - Growth</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Energy Level</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full w-4/5"></div>
                    </div>
                    <span className="text-sm text-gray-600">High Vibrational</span>
                  </div>
                </div>
                {/* Middle Column - Chakra Analysis */}
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Chakra Balance</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Crown</span>
                        <div className="w-10 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-violet-500 h-1.5 rounded-full w-4/5"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Third Eye</span>
                        <div className="w-10 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full w-3/4"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Heart</span>
                        <div className="w-10 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Traits</h3>
                    <div className="space-y-2">
                      <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">Intuitive</span>
                      <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm ml-2">Peaceful</span>
                    </div>
                  </div>
                </div>
                {/* Right Column - Insights */}
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Insights</h3>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded border-l-2 border-purple-400">Strong spiritual connection detected.</div>
                      <div className="text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded border-l-2 border-blue-400">High compassion levels.</div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Recommendations</h3>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">• Continue meditation</div>
                      <div className="text-sm text-gray-600">• Focus on throat chakra</div>
                      <div className="text-sm text-gray-600">• Embrace creativity</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 