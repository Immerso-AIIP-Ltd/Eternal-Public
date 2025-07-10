import { useState, useEffect } from "react"
import { Sparkles, Download } from "lucide-react"
import { useNavigate } from "react-router-dom";
// Frame assets
const frameAssets = {
  corner: "https://static.cdn-luma.com/files/dfd1ef3c85e6e017/Corner.png",
  edgeHorizontal: "https://static.cdn-luma.com/files/dfd1ef3c85e6e017/horizontal.png",
  edgeVertical: "https://static.cdn-luma.com/files/dfd1ef3c85e6e017/Vertical.png",
};

// Phone dimensions
const PHONE_WIDTH = 335;
const PHONE_HEIGHT = 600;
const CORNER_RADIUS = 50;
const DYNAMIC_ISLAND_WIDTH = 90;
const DYNAMIC_ISLAND_HEIGHT = 30;
const DYNAMIC_ISLAND_TOP = 38;

// Face analysis data
const faceAnalysisData = [
  {
    id: 1,
    title: "Forehead",
    subtitle: "High & Broad",
    description: "Wisdom, leadership qualities",
    position: { top: "10%", left: "-220px" },
    delay: 1000,
    connectionPoint: { x: 0, y: 80 },
  },
  {
    id: 2,
    title: "Face Shape",
    subtitle: "Oval",
    description: "Harmonious, well-balanced nature",
    position: { top: "15%", right: "-220px" },
    delay: 1500,
    connectionPoint: { x: PHONE_WIDTH, y: 100 },
  },
  {
    id: 3,
    title: "Nose",
    subtitle: "Straight Bridge",
    description: "Balanced personality traits",
    position: { bottom: "20%", left: "-220px" },
    delay: 2000,
    connectionPoint: { x: 0, y: PHONE_HEIGHT - 150 },
  },
];

// Palm analysis data
const palmAnalysisData = [
  {
    id: 1,
    title: "Heart Line",
    subtitle: "Deep & Clear",
    description: "Expressive in love, emotional depth",
    position: { top: "15%", left: "-220px" },
    delay: 1000,
    connectionPoint: { x: 0, y: 120 },
  },
  {
    id: 2,
    title: "Hand Type",
    subtitle: "Earth Hand",
    description: "Practical, reliable, grounded",
    position: { top: "20%", right: "-220px" },
    delay: 1500,
    connectionPoint: { x: PHONE_WIDTH, y: 140 },
  },
  {
    id: 3,
    title: "Mount of Jupiter",
    subtitle: "Prominent",
    description: "Ambition, leadership potential",
    position: { bottom: "25%", left: "-220px" },
    delay: 2000,
    connectionPoint: { x: 0, y: PHONE_HEIGHT - 180 },
  },
];

// FrameComponent
interface FrameComponentProps {
  width: number;
  height: number;
  className?: string;
  corner: string;
  edgeHorizontal: string;
  edgeVertical: string;
  showFrame: boolean;
  cornerRadius: number;
}
function FrameComponent({
  width,
  height,
  className = "",
  corner,
  edgeHorizontal,
  edgeVertical,
  showFrame,
  cornerRadius,
}: FrameComponentProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        width,
        height,
        transformOrigin: "center",
      }}
    >
      <div className="relative w-full h-full">
        {/* Transparent screen area with rounded corners */}
        <div
          className="absolute inset-0 z-10"
          style={{
            borderRadius: `${cornerRadius}px`,
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        />

        {/* Frame Elements */}
        {showFrame && (
          <div className="absolute inset-0 z-20">
            {/* Corners */}
            <div
              className="absolute top-0 left-0 w-24 h-24 bg-contain bg-no-repeat opacity-90"
              style={{
                backgroundImage: `url(${corner})`,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }}
            />
            <div
              className="absolute top-0 right-0 w-24 h-24 bg-contain bg-no-repeat opacity-90"
              style={{
                backgroundImage: `url(${corner})`,
                transform: "scaleX(-1)",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-24 h-24 bg-contain bg-no-repeat opacity-90"
              style={{
                backgroundImage: `url(${corner})`,
                transform: "scaleY(-1)",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-24 h-24 bg-contain bg-no-repeat opacity-90"
              style={{
                backgroundImage: `url(${corner})`,
                transform: "scale(-1, -1)",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }}
            />

            {/* Edges */}
            <div
              className="absolute top-0 left-24 right-24 h-24 opacity-90"
              style={{
                backgroundImage: `url(${edgeHorizontal})`,
                backgroundSize: "auto 96px",
                backgroundRepeat: "repeat-x",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }}
            />
            <div
              className="absolute bottom-0 left-24 right-24 h-24 opacity-90"
              style={{
                backgroundImage: `url(${edgeHorizontal})`,
                backgroundSize: "auto 96px",
                backgroundRepeat: "repeat-x",
                transform: "rotate(180deg)",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }}
            />
            <div
              className="absolute left-0 top-24 bottom-24 w-24 opacity-90"
              style={{
                backgroundImage: `url(${edgeVertical})`,
                backgroundSize: "96px auto",
                backgroundRepeat: "repeat-y",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }}
            />
            <div
              className="absolute right-0 top-24 bottom-24 w-24 opacity-90"
              style={{
                backgroundImage: `url(${edgeVertical})`,
                backgroundSize: "96px auto",
                backgroundRepeat: "repeat-y",
                transform: "scaleX(-1)",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// AnalysisBubble
interface AnalysisBubbleProps {
  title: string;
  subtitle: string;
  description: string;
  position: any;
  isVisible: boolean;
  delay: number;
  connectionPoint: { x: number; y: number };
  phoneWidth: number;
  phoneHeight: number;
}
function AnalysisBubble({
  title,
  subtitle,
  description,
  position,
  isVisible,
  delay,
  connectionPoint,
  phoneWidth,
  phoneHeight,
}: AnalysisBubbleProps) {
  const [show, setShow] = useState(false);
  const [lineVisible, setLineVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShow(true);
        setTimeout(() => setLineVisible(true), 300);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      setLineVisible(false);
    }
  }, [isVisible, delay]);

  // Calculate line path from phone frame to bubble
  const isLeft = position.left !== undefined;
  const bubbleX = isLeft ? -200 : phoneWidth + 200;
  const bubbleY = position.top
    ? typeof position.top === "string"
      ? (Number.parseInt(position.top) / 100) * phoneHeight
      : position.top
    : phoneHeight - (typeof position.bottom === "string" ? (Number.parseInt(position.bottom) / 100) * phoneHeight : position.bottom);

  // Create curved path from connection point to bubble
  const startX = connectionPoint.x;
  const startY = connectionPoint.y;
  const endX = bubbleX + (isLeft ? 180 : 20); // Adjust for bubble width
  const endY = bubbleY + 40; // Center of bubble

  // Control points for smooth curve
  const controlX1 = startX + (isLeft ? -60 : 60);
  const controlY1 = startY;
  const controlX2 = endX + (isLeft ? 40 : -40);
  const controlY2 = endY;

  const pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;

  return (
    <>
      {/* Curved Connection Line */}
      <svg
        className="absolute top-0 left-0 pointer-events-none z-35"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <path
          d={pathData}
          stroke="#a855f7"
          strokeWidth="2"
          fill="none"
          strokeDasharray="200"
          strokeDashoffset={lineVisible ? "0" : "200"}
          style={{
            transition: "stroke-dashoffset 1s ease-in-out",
            opacity: lineVisible ? 1 : 0,
          }}
        />
      </svg>

      {/* Analysis Bubble */}
      <div
        className={`absolute z-40 transition-all duration-600 transform ${
          show ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-4"
        }`}
        style={position}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 min-w-[180px] max-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          </div>
          <p className="text-purple-600 font-medium text-xs mb-1">{subtitle}</p>
          <p className="text-gray-600 text-xs leading-relaxed">{description}</p>
        </div>
      </div>
    </>
  );
}

function AstroScanLanding() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState("");
  const [scanningStarted, setScanningStarted] = useState(false);
  const [currentMode, setCurrentMode] = useState<"face" | "palm">("face");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [faceAnalysisComplete, setFaceAnalysisComplete] = useState(false);
  const [palmAnalysisStarted, setPalmAnalysisStarted] = useState(false);
  const [showFaceAnalysis, setShowFaceAnalysis] = useState(false);
  const [showPalmAnalysis, setShowPalmAnalysis] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const intervalId = setInterval(updateTime, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Start face scanning animation
    const timer1 = setTimeout(() => {
      setScanningStarted(true);
      setTimeout(() => {
        setShowFaceAnalysis(true);

        // Hide face analysis after all bubbles have shown
        setTimeout(() => {
          setShowFaceAnalysis(false);
          setFaceAnalysisComplete(true);

          // Start palm transition
          setTimeout(() => {
            setCurrentMode("palm");
            setScanningStarted(false);
            setPalmAnalysisStarted(true);

            setTimeout(() => {
              setScanningStarted(true);
              setTimeout(() => {
                setShowPalmAnalysis(true);
              }, 2000);
            }, 500);
          }, 1000);
        }, 5000); // Show face bubbles for 5 seconds
      }, 2000);
    }, 1000);

    return () => clearTimeout(timer1);
  }, []);

  const currentVideoSrc = currentMode === "face" ? "/girl-video.mp4" : "/palm-video.mp4";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <span className="text-2xl font-bold text-gray-900">AstroScan</span>
        </div>

        <button className="bg-black text-white hover:bg-gray-800 rounded-xl px-6 py-2 flex items-center gap-2">
          <Download className="w-4 h-4" />
          App Store
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 py-12">
        {/* Hero Text */}
        <div className="text-center mb-16 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Ancient Wisdom Meets
            <br />
            <span className="text-purple-600">AI Face & Palm Reading</span>
          </h1>
          <p className="text-lg text-gray-600">
            Discover your personality and destiny through advanced facial analysis and palmistry
          </p>
        </div>

        {/* Phone Frame with Video */}
        <div className="relative">
          <div
            style={{
              width: PHONE_WIDTH,
              height: PHONE_HEIGHT,
              position: "relative",
            }}
          >
            {/* Video Background */}
            <div
              className="absolute inset-0 z-0 overflow-hidden"
              style={{
                borderRadius: `${CORNER_RADIUS}px`,
              }}
            >
              <video
                key={currentVideoSrc} // Force re-render when video changes
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
                  isTransitioning ? "scale-110" : "scale-100"
                }`}
                style={{
                  borderRadius: `${CORNER_RADIUS}px`,
                }}
                src={currentVideoSrc}
                loop
                muted
                playsInline
                autoPlay
              />
            </div>

            {/* Frame Overlay */}
            <FrameComponent
              width={PHONE_WIDTH}
              height={PHONE_HEIGHT}
              corner={frameAssets.corner}
              edgeHorizontal={frameAssets.edgeHorizontal}
              edgeVertical={frameAssets.edgeVertical}
              showFrame={true}
              cornerRadius={CORNER_RADIUS}
            />

            {/* iPhone UI Elements */}
            <div
              className="absolute text-white text-sm z-30 drop-shadow-lg font-medium"
              style={{
                top: "46px",
                left: "46px",
              }}
            >
              {currentTime}
            </div>

            <div
              className="absolute z-30"
              style={{
                top: "46px",
                right: "46px",
              }}
            >
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 bg-white rounded-sm opacity-80"></div>
                <div className="w-4 h-2 bg-white rounded-sm opacity-60"></div>
                <div className="w-4 h-2 bg-white rounded-sm opacity-40"></div>
              </div>
            </div>

            {/* Dynamic Island */}
            <div
              className="absolute z-30 bg-black rounded-full"
              style={{
                top: `${DYNAMIC_ISLAND_TOP}px`,
                left: "50%",
                transform: "translateX(-50%)",
                width: `${DYNAMIC_ISLAND_WIDTH}px`,
                height: `${DYNAMIC_ISLAND_HEIGHT}px`,
              }}
            />

            {/* Scanning Text Overlay */}
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
              <div
                className={`text-center transition-all duration-1000 ${
                  scanningStarted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <h2 className="text-white text-xl font-semibold mb-2 drop-shadow-lg">Your AstroScan</h2>
                <p className="text-white text-lg drop-shadow-lg">
                  ({currentMode === "face" ? "Face" : "Palm"}) is ready!
                </p>
              </div>
            </div>

            {/* Face Analysis Bubbles */}
            {currentMode === "face" &&
              faceAnalysisData.map((analysis) => (
                <AnalysisBubble
                  key={`face-${analysis.id}`}
                  title={analysis.title}
                  subtitle={analysis.subtitle}
                  description={analysis.description}
                  position={analysis.position}
                  isVisible={showFaceAnalysis}
                  delay={analysis.delay}
                  connectionPoint={analysis.connectionPoint}
                  phoneWidth={PHONE_WIDTH}
                  phoneHeight={PHONE_HEIGHT}
                />
              ))}

            {/* Palm Analysis Bubbles */}
            {currentMode === "palm" &&
              palmAnalysisData.map((analysis) => (
                <AnalysisBubble
                  key={`palm-${analysis.id}`}
                  title={analysis.title}
                  subtitle={analysis.subtitle}
                  description={analysis.description}
                  position={analysis.position}
                  isVisible={showPalmAnalysis}
                  delay={analysis.delay}
                  connectionPoint={analysis.connectionPoint}
                  phoneWidth={PHONE_WIDTH}
                  phoneHeight={PHONE_HEIGHT}
                />
              ))}

            {/* Bottom Input Bar */}
            <div
              className="absolute z-30"
              style={{
                bottom: "80px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "280px",
              }}
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-3 text-center">
                <p className="text-white text-sm">
                  {currentMode === "face" ? "Ask AstroAI about your face..." : "Ask AstroAI about your palm..."}
                </p>
              </div>
            </div>

            {/* Home Indicator */}
            <div
              className="absolute z-30"
              style={{
                bottom: "30px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "152px",
                height: "5px",
                backgroundColor: "white",
                borderRadius: "2.5px",
              }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <div
          className={`mt-8 transition-all duration-1000 delay-3000 ${
            showFaceAnalysis || showPalmAnalysis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold"
            onClick={() => navigate("/upload-report-images")}
          >
            View Full {currentMode === "face" ? "Face & Palmistry" : "Palmistry & Face"} Report
          </button>
        </div>
      </main>
    </div>
  );
}

export default AstroScanLanding; 