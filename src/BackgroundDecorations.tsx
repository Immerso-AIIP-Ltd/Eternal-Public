export function BackgroundDecorations() {
  return (
    <>
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-pink-200 rounded-full opacity-30 animate-bounce"></div>
      <div className="absolute bottom-40 left-20 w-12 h-12 bg-cyan-200 rounded-full opacity-25 animate-pulse"></div>
      <div className="absolute bottom-20 right-40 w-24 h-24 bg-purple-300 rounded-full opacity-15 animate-bounce"></div>
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-cyan-300 to-purple-300 rounded-full opacity-15 blur-xl"></div>
    </>
  );
} 