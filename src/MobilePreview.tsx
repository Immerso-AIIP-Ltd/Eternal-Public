import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Sparkles } from "lucide-react";

const chatMessages = [
  { type: "ai", text: "Welcome to Eternal AI! How are you feeling today?" },
  { type: "user", text: "I've been feeling a bit overwhelmed lately." },
  {
    type: "ai",
    text: "I understand. Let's explore this together. What specific thoughts have been weighing on your mind?" },
  { type: "user", text: "Work stress and finding balance in life." },
  { type: "ai", text: "Finding balance is a beautiful journey. Would you like to try a brief mindfulness exercise?" },
];

export function MobilePreview() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % chatMessages.length);
        setIsTyping(false);
      }, 1500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessageIndex, isTyping]);

  const visibleMessages = chatMessages.slice(0, currentMessageIndex + 1);

  return (
    <div className="relative cursor-pointer">
      {/* Phone Frame - Wider size */}
      <div className="relative w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
        {/* Screen - fills the phone frame better */}
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
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-purple-900 text-base">Eternal AI</h2>
                <p className="text-xs text-purple-600">Your spiritual companion</p>
              </div>
            </div>
          </div>
          {/* Chat Area */}
          <div className="flex-1 px-6 py-5 space-y-3 overflow-y-auto w-full">
            {visibleMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-fade-in w-full`}
              >
                <div
                  className={`max-w-[85%] w-fit px-4 py-2 rounded-xl text-base ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                      : "bg-white border border-purple-200 text-purple-700"
                  }`}
                >
                  <p className="leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-fade-in w-full">
                <div className="bg-white/80 backdrop-blur-sm text-purple-900 border border-purple-200 px-4 py-2 rounded-xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
          {/* Input Area */}
          <div className="px-6 py-5 bg-white/80 backdrop-blur-sm border-t border-purple-200 w-full">
            <div className="flex items-center gap-3 bg-purple-50 rounded-full px-5 py-3 border border-purple-200 w-full">
              <MessageCircle className="w-5 h-5 text-purple-400" />
              <input
                type="text"
                placeholder="Share your thoughts..."
                className="flex-1 bg-transparent text-base text-purple-700 placeholder-purple-400 outline-none"
                readOnly
              />
              <Send className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>
      </div>
      {/* Floating Elements */}
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-200 rounded-full animate-pulse"></div>
      <div
        className="absolute -bottom-6 -left-6 w-12 h-12 bg-purple-200 rounded-full animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
    </div>
  );
} 