"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Zap,
  Palette,
  Flame,
  Star,
  Layers,
  Heart,
  Hash,
  Lock,
  MessageCircle,
  FileText,
  User,
  ChevronDown,
  Coins,
  ArrowLeft,
  Send,
  Sparkles,
  X,
  Crown,
  Check,
  Mail,
  Hand,
  Menu,
} from "lucide-react"
import defaultProfilePic from './default-pfp.jpg';
import { useAuth } from './context/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase/config';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
// Add this import for auto-resize
import ReactTextareaAutosize from 'react-textarea-autosize';
// Add this import for markdown rendering
import ReactMarkdown from 'react-markdown';
import { getDailyChatResponse } from './services/gpt';
// import { chatWithStarMap } from './services/starMapChat'; // Removed due to missing module
import NumerologyReport from './NumerologyReport';
import { NumerologyService, NumerologyUserData } from './services/numerologyService';
import ReactModal from 'react-modal'; // Make sure to run: npm install react-modal

// Utility function
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ")
}

// UI Components
function Button({
  children,
  onClick,
  disabled,
  variant = "default",
  size = "default",
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm"
  className?: string
}) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  }

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  )
}

function Badge({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "secondary"
}) {
  const baseClasses =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

  const variants = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  }

  return <div className={cn(baseClasses, variants[variant], className)}>{children}</div>
}

function Avatar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}>{children}</div>
  )
}

function AvatarImage({ src, alt = "" }: { src: string; alt?: string }) {
  return <img className="aspect-square h-full w-full" src={src || "/placeholder.svg"} alt={alt} />
}

function AvatarFallback({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}>
      {children}
    </div>
  )
}

function Textarea({
  value,
  onChange,
  onKeyPress,
  placeholder,
  className = "",
  rows = 3,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyPress?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  className?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  )
}

function ScrollArea({
  children,
  className = "",
  ref,
}: {
  children: React.ReactNode
  className?: string
  ref?: React.RefObject<HTMLDivElement>
}) {
  return (
    <div ref={ref} className={cn("relative overflow-auto h-full", className)}>
      <div className="h-full w-full">
        {children}
      </div>
    </div>
  )
}

function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      {children}
    </div>
  )
}

function DialogContent({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative z-50 grid w-full gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full",
        className,
      )}
    >
      {children}
    </div>
  )
}

function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>
}

function DialogTitle({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h2>
}

// Types
interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  options?: string[]
}

// Data
const chatSections = [
  {
    id: "ask-about-today",
    label: "Ask about today",
    description: "General guidance and support",
    icon: MessageCircle,
    color: "text-blue-600",
  },
]

const reportSections = [
  {
    id: "vibrational-frequency",
    label: "Vibrational Frequency",
    description: "Your current energy reading",
    icon: Zap,
    color: "text-amber-600",
  },
  {
    id: "aura-profile",
    label: "Aura Profile",
    description: "Color, emotion, protection & openness",
    icon: Palette,
    color: "text-violet-600",
  },
  {
    id: "flame-score",
    label: "Flame Score",
    description: "Your spiritual evolution meter",
    icon: Flame,
    color: "text-orange-600",
  },
  {
    id: "star-map",
    label: "Star Map",
    description: "Planetary transits & karmic insights",
    icon: Star,
    color: "text-blue-600",
  },
  {
    id: "kosha-scan",
    label: "Kosha Scan",
    description: "The balance across your 5 inner bodies",
    icon: Layers,
    color: "text-emerald-600",
  },
  {
    id: "longevity-index",
    label: "Longevity Index",
    description: "Energy-nutrition alignment & tips",
    icon: Heart,
    color: "text-rose-600",
  },
  {
    id: "numerology",
    label: "Numerology",
    description: "Your numbers and their meanings",
    icon: Hash,
    color: "text-indigo-600",
  },
]

const sectionTitles: Record<string, string> = {
  "ask-about-today": "Ask about today",
  "vibrational-frequency": "Vibrational Frequency Reading",
  "aura-profile": "Aura Profile Analysis",
  "flame-score": "Spiritual Flame Score",
  "star-map": "Cosmic Star Map",
  "kosha-scan": "Kosha Body Scan",
  "longevity-index": "Longevity Index",
  numerology: "Numerology Reading",
}

const creditPackages = [
  {
    name: "Starter Pack",
    credits: 50,
    price: "$5.00",
    pricePerCredit: "$0.10",
    popular: false,
  },
  {
    name: "Value Pack",
    credits: 100,
    price: "$9.00",
    pricePerCredit: "$0.09",
    savings: "Save 10%",
    popular: true,
  },
]

const reportBundles = [
  {
    name: "Single Report",
    reports: 1,
    credits: 20,
    priceEquivalent: "$1.80 - $2.00",
    popular: false,
  },
  {
    name: "Triple Bundle",
    reports: 3,
    credits: 40,
    priceEquivalent: "$3.60 - $4.00",
    savings: "Save 33%",
    popular: true,
  },
  {
    name: "Complete Bundle",
    reports: 6,
    credits: 100,
    priceEquivalent: "$9.00 - $10.00",
    savings: "Save 17%",
    popular: false,
  },
]

// Helper Functions
const getInitialMessage = (section: string): Message => {
  const messages: Record<string, { content: string; options: string[] }> = {
    "ask-about-today": {
      content: "Hello! I'm here to help you with whatever is on your mind today. Whether you're facing challenges, seeking guidance, or just need someone to talk to, I'm here to listen and provide support. What would you like to discuss?",
      options: [
        "I'm feeling stressed about work",
        "I need relationship advice",
        "I want to explore my spiritual path",
        "I'm looking for life guidance",
        "Tell me about my energy today"
      ]
    },
    "star-map": {
      content: "Welcome to your Cosmic Star Map reading. I can help you understand planetary transits, karmic insights, and how celestial movements affect your spiritual journey. What specific aspect of your cosmic alignment would you like to explore today?",
      options: [
        "What are my current planetary transits?",
        "Tell me about my karmic lessons",
        "How do the stars affect my relationships?",
        "What's my spiritual purpose?",
        "Show me my cosmic challenges"
      ]
    },
    "vibrational-frequency": {
      content: "Let's explore your current vibrational frequency. I can help you understand your energy patterns and how they're affecting your daily life. What aspects of your energy would you like to examine?",
      options: [
        "What's my current energy level?",
        "How can I raise my vibration?",
        "What's blocking my energy flow?",
        "Show me my energy patterns",
        "How does my energy affect others?"
      ]
    },
    "aura-profile": {
      content: "Welcome to your Aura Profile analysis. I can help you understand the colors, emotions, and protective energies surrounding you. What would you like to know about your aura today?",
      options: [
        "What colors are in my aura?",
        "How strong is my protection?",
        "What emotions am I carrying?",
        "How can I cleanse my aura?",
        "Show me my aura's health"
      ]
    },
    "flame-score": {
      content: "Let's examine your Spiritual Flame Score - your evolution meter on the spiritual path. I can help you understand where you are in your journey and how to continue growing. What aspects of your spiritual development interest you most?",
      options: [
        "What's my current flame score?",
        "How can I increase my spiritual growth?",
        "What's my next spiritual milestone?",
        "Show me my spiritual strengths",
        "What's blocking my spiritual progress?"
      ]
    },
    "kosha-scan": {
      content: "Welcome to your Kosha Scan. I can help you understand the balance across your 5 inner bodies - physical, energetic, mental, wisdom, and bliss. Which layer would you like to explore first?",
      options: [
        "Scan my physical body (Annamaya)",
        "Check my energy body (Pranamaya)",
        "Analyze my mental body (Manomaya)",
        "Explore my wisdom body (Vijnanamaya)",
        "Connect to my bliss body (Anandamaya)"
      ]
    },
    "longevity-index": {
      content: "Let's explore your Longevity Index - the alignment between your energy and nutrition for optimal health. I can provide insights and tips for enhancing your vitality. What health aspects concern you most?",
      options: [
        "What's my current longevity score?",
        "How can I improve my vitality?",
        "What foods align with my energy?",
        "Show me my health patterns",
        "What lifestyle changes should I make?"
      ]
    },
    numerology: {
      content: "Welcome to your Numerology reading. I can help you understand the significance of numbers in your life and their deeper meanings. What numbers or life patterns would you like to explore?",
      options: [
        "What's my life path number?",
        "Tell me about my destiny number",
        "What's my soul urge number?",
        "Show me my personal year number",
        "What numbers are significant for me?"
      ]
    },
  }

  const messageData = messages[section] || messages["ask-about-today"]
  return {
    id: "1",
    type: "ai",
    content: messageData.content,
    options: messageData.options,
    timestamp: new Date(),
  }
}

// Helper function to parse AI response and extract answer + options
function parseAIResponse(response: string): { answer: string; options: string[] } {
  // Look for common patterns that indicate follow-up questions
  const patterns = [
    /(.*?)(?:\n\n|\n)(?:Here are some follow-up questions:|Suggested questions:|You might also ask:|Next steps:|Related questions:)([\s\S]*)/,
    /(.*?)(?:\n\n|\n)(?:1\.|2\.|3\.|4\.)([\s\S]*)/
  ]
  for (const pattern of patterns) {
    const match = response.match(pattern)
    if (match) {
      const answer = match[1].trim()
      const optionsText = match[2].trim()
      // Extract numbered options
      const options = optionsText
        .split(/\n/)
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(option => option.length > 0)
      return { answer, options }
    }
  }
  // If no pattern found, return the whole response as answer with no options
  return { answer: response, options: [] }
}

// Components
function ProfileSection({ username, profileAvatar, fallbackPic }: { username: string, profileAvatar: string, fallbackPic: string }) {
  return (
    <div className="bg-white/30 border-t border-white/30 backdrop-blur-sm p-4 flex-shrink-0 mt-auto">
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={profileAvatar || fallbackPic} />
          <AvatarFallback className="bg-gray-900 text-white">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-600 truncate">
            Hey <span className="font-semibold text-gray-900">{username}</span>
          </p>
          <p className="text-xs text-gray-500 truncate">Ready to explore?</p>
        </div>
      </div>
    </div>
  )
}

function Sidebar({
  activeSection,
  onSectionClick,
  unlockedFeatures,
  username,
  profileAvatar,
  fallbackPic,
  sidebarOpen,
  setSidebarOpen,
  setShowProModal,
}: {
  activeSection: string
  onSectionClick: (sectionId: string) => void
  unlockedFeatures: string[]
  username: string
  profileAvatar: string
  fallbackPic: string
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setShowProModal: (open: boolean) => void
}) {
  const unlockedReports = reportSections.filter((section) => unlockedFeatures.includes(section.id))
  const lockedReports = reportSections.filter((section) => !unlockedFeatures.includes(section.id))

  const renderSection = (items: typeof chatSections, title: string, titleIcon: any, showLock = false) => {
    const TitleIcon = titleIcon
    return (
      <div className="mb-6 px-6">
        <div className="flex items-center gap-2 py-2 mb-2">
          <TitleIcon className="w-4 h-4 text-gray-600" />
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
        </div>
        <div className="space-y-1">
          {items.map((item) => {
            const isUnlocked = unlockedFeatures.includes(item.id)
            const isActive = activeSection === item.id
            const Icon = item.icon

            // For locked reports, show faded, lock icon, and prevent opening
            if (showLock && !isUnlocked) {
              return (
                <button
                  key={item.id}
                  onClick={() => setShowProModal(true)}
                  className={cn(
                    "w-full p-3 text-left transition-all duration-150 group relative rounded-xl shadow-sm mb-2 bg-white/70 backdrop-blur-md border border-white/30 opacity-60 cursor-pointer hover:bg-white/80",
                    isActive ? "bg-purple-100/80 shadow-md" : ""
                  )}
                  disabled={false}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-1.5 bg-gray-100/70 rounded")}> 
                      <Icon className={cn("w-4 h-4", item.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 text-sm">{item.label}</h4>
                        <Lock className="w-3 h-3 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-sm">
                    <div className="bg-gray-900 text-white px-3 py-1 text-xs font-medium rounded-full">Pro Feature</div>
                  </div>
                </button>
              )
            }

            // Unlocked (or chat) section
            return (
              <button
                key={item.id}
                onClick={() => onSectionClick(item.id)}
                className={cn(
                  "w-full p-3 text-left transition-all duration-150 group relative rounded-xl shadow-sm mb-2 bg-white/70 backdrop-blur-md border border-white/30 hover:bg-white/80",
                  isActive && isUnlocked ? "bg-purple-100/80 shadow-md" : ""
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-1.5 bg-gray-100/70 rounded", isActive && isUnlocked ? "bg-gray-200/70" : "")}> 
                    <Icon className={cn("w-4 h-4", item.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 text-sm">{item.label}</h4>
                      {showLock && !isUnlocked && <Lock className="w-3 h-3 text-gray-400" />}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-[28rem] bg-white/20 backdrop-blur-xl border-r border-white/30 flex flex-col overflow-hidden rounded-r-3xl relative">
      {/* X Close Button */}
      {sidebarOpen && (
        <button
          className="absolute top-4 right-4 z-50 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
      )}
      <div className="p-6 border-b border-white/30 text-center">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">ETERNAL AI</h1>
      </div>
      <div className="flex-1 py-4 overflow-y-auto w-full">
        {renderSection(chatSections, "Chat", MessageCircle)}
        {unlockedReports.length > 0 && renderSection(unlockedReports, "Available Reports", FileText)}
        {lockedReports.length > 0 && renderSection(lockedReports, "Pro Reports", Lock, true)}
      </div>
      <ProfileSection username={username} profileAvatar={profileAvatar} fallbackPic={fallbackPic} />
    </div>
  )
}

function ChatArea({ activeSection, ethers, setEthers, unlockedReports, setUnlockedReports, currentUser, userProfile, navigate }: { activeSection: string, ethers: number, setEthers: any, unlockedReports: string[], setUnlockedReports: any, currentUser: any, userProfile: any, navigate: any }) {
  const [messages, setMessages] = useState<Message[]>([getInitialMessage(activeSection)])
  const [inputValue, setInputValue] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const autoSentRef = useRef(false); // Prevent double auto-send

  // Add numerology chat state
  const [numFollowUps, setNumFollowUps] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [lastFollowUp, setLastFollowUp] = useState<string | null>(null);

  useEffect(() => {
    setMessages([getInitialMessage(activeSection)])
    autoSentRef.current = false;
  }, [activeSection])

  // Remove the auto-send useEffect for 'ask-about-today'.

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      // Try multiple selectors to find the scrollable element
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]") || 
                            scrollAreaRef.current.querySelector(".overflow-auto") ||
                            scrollAreaRef.current
      
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    // Smooth auto-scroll with multiple attempts to ensure it works
    const timer1 = setTimeout(() => {
      scrollToBottom()
    }, 50)
    
    const timer2 = setTimeout(() => {
      scrollToBottom()
    }, 150)
    
    const timer3 = setTimeout(() => {
      scrollToBottom()
    }, 300)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [messages])

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    // Numerology conversational flow
    if (activeSection === 'numerology') {
      await handleNumerologySend(textToSend);
      setInputValue("");
      return;
    }

    // Deduct 10 ethers for every message sent, regardless of section
    if (ethers < 10) {
      alert('Not enough Ethers!');
      return;
    }
    setEthers((prev: number) => prev - 10);
    if (currentUser?.uid) {
      await updateDoc(doc(db, 'users', currentUser.uid), { ethers: ethers - 10 });
    }

    const userMessage: Message = {
      id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
      type: "user",
      content: textToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    if (!messageText) {
      setInputValue("")
    }

    // Remove options from the last AI message when a new message is sent
    setMessages((prev) => 
      prev.map((msg, index) => 
        index === prev.length - 2 && msg.type === "ai" 
          ? { ...msg, options: undefined }
          : msg
      )
    )

    // Add a typing indicator
    const typingMessage: Message = {
      id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
      type: "ai",
      content: "Typing...",
      timestamp: new Date(),
    }

    // Add typing indicator after a short delay
    setTimeout(() => {
      setMessages((prev) => [...prev, typingMessage])
    }, 300)

    try {
      // Debug logging
      console.log('[EternalAI] Sending prompt to backend:', { userId: currentUser?.uid || 'user', userMessage: textToSend });

      let apiResponse: string;
      if (activeSection === "ask-about-today") {
        apiResponse = await getDailyChatResponse(currentUser?.uid, textToSend);
      } else {
        // This case should ideally not be reached if chatWithReports is removed,
        // but keeping it for robustness or if other reports are added.
        // For now, it will just return the raw response.
        apiResponse = "This feature is not yet available in the free plan.";
      }

      // Debug logging
      console.log('[EternalAI] Received response from backend:', apiResponse);

      // Store the raw response as the message content (no parsing/options)
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.id !== typingMessage.id)
        return [...filtered, {
          id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
          type: "ai",
          content: apiResponse,
          options: undefined,
          timestamp: new Date(),
        }]
      })
    } catch (error: any) {
      // Debug logging
      console.error('[EternalAI] Error during chatWithReports:', error);
      // Remove typing indicator and show error message as AI response
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.id !== typingMessage.id)
        return [...filtered, {
          id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
          type: "ai",
          content: `Sorry, there was an error connecting to Eternal AI. ${error?.message ? 'Details: ' + error.message : 'Please try again later.'}`,
          options: [],
          timestamp: new Date(),
        }]
      })
    }
  }

  const handleOptionClick = (option: string) => {
    // Remove options from the current AI message immediately when an option is clicked
    setMessages((prev) => 
      prev.map((msg, index) => 
        index === prev.length - 1 && msg.type === "ai" 
          ? { ...msg, options: undefined }
          : msg
      )
    )
    
    handleSendMessage(option)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handler for sending a message in numerology chat
  const handleNumerologySend = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    // Add user message to chat
    const userMessage: Message = {
      id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
      type: "user",
      content: textToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    if (numFollowUps < 2) {
      // Add typing indicator
      const typingMessage: Message = {
        id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
        type: "ai",
        content: "Typing...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, typingMessage]);

      // Call GPT with current context and get next follow-up question
      const followUp = await getNumerologyFollowUp(numFollowUps, userAnswers, textToSend, currentUser);
      setLastFollowUp(followUp);
      setNumFollowUps(numFollowUps + 1);
      setUserAnswers([...userAnswers, textToSend]);
      // Remove typing indicator and add follow-up as AI message
      setMessages((prev) => {
        const filtered = prev.filter(msg => msg.content !== "Typing...");
        return [
          ...filtered,
          {
            id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
            type: "ai",
            content: followUp || '',
            timestamp: new Date(),
          },
        ];
      });
    } else {
      // After second follow-up, automatically generate the report after a short delay
      setUserAnswers([...userAnswers, textToSend]);
      setTimeout(async () => {
        // Show loading indicator in chat
        setMessages((prev) => [
          ...prev,
          {
            id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
            type: "ai",
            content: "Generating your Numerology Report...",
            timestamp: new Date(),
          },
        ]);
        try {
          let userData: Partial<NumerologyUserData> = {};
          const allAnswers = [...userAnswers, textToSend];
          allAnswers.forEach((ans, i) => {
            if (ans.match(/^\d{4}-\d{2}-\d{2}$/)) userData.birthDate = ans;
            else if (ans.split(' ').length > 1) {
              userData.firstName = ans.split(' ')[0];
              userData.lastName = ans.split(' ').slice(1).join(' ');
            } else if (!userData.firstName) {
              userData.firstName = ans;
            }
          });
          if (!userData.firstName) userData.firstName = userProfile.name.split(' ')[0] || 'User';
          if (!userData.lastName) userData.lastName = userProfile.name.split(' ').slice(1).join(' ') || '';
          if (!userData.birthDate) userData.birthDate = '2000-01-01';
          const numerologyService = new NumerologyService();
          const report = await numerologyService.generateCompleteReport(userData as NumerologyUserData, currentUser?.uid || '');
          let reportId = null;
          if (currentUser?.uid) {
            const reportsCollection = collection(db, 'users', currentUser.uid, 'numerologyReports');
            const docRef = await addDoc(reportsCollection, {
              ...report,
              createdAt: serverTimestamp(),
              answers: allAnswers,
            });
            reportId = docRef.id;
          }
          if (reportId) {
            navigate(`/numerology-report/${reportId}`);
          }
        } catch (err) {
          setMessages((prev) => [
            ...prev,
            {
              id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
              type: "ai",
              content: "Failed to generate numerology report. Please try again.",
              timestamp: new Date(),
            },
          ]);
        }
      }, 2000);
    }
    setInputValue("");
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      <ScrollArea ref={scrollAreaRef} className="flex-1 relative z-10">
        <div className="max-w-6xl mx-auto p-6 pb-32">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-4 animate-in slide-in-from-bottom-4 duration-500 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "both",
                }}
              >
                {message.type === "ai" && (
                  <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-purple-100 text-purple-500">
                      <Sparkles className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm animate-in slide-in-from-bottom-2 duration-700 ${
                    message.type === "user"
                      ? "bg-purple-400/80 backdrop-blur-sm text-white rounded-br-md"
                      : "bg-white/70 backdrop-blur-sm text-gray-700 rounded-bl-md border border-white/30"
                  }`}
                  style={{
                    animationDelay: `${index * 100 + 200}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium ${message.type === "user" ? "text-purple-100" : "text-gray-500"}`}
                    >
                      {message.type === "user" ? "You" : "Eternal AI"}
                    </span>
                    <span className={`text-xs ${message.type === "user" ? "text-purple-200" : "text-gray-400"}`}>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {message.type === "ai" ? (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap font-serif prose prose-purple max-w-none">
                      {message.content === "Typing..." ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      ) : (
                        typeof message.content === 'string' ? (
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        ) : (
                          <pre className="text-xs text-gray-500">{JSON.stringify(message.content, null, 2)}</pre>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans font-medium">
                      {typeof message.content === 'string' ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : (
                        <pre className="text-xs text-gray-500">{JSON.stringify(message.content, null, 2)}</pre>
                      )}
                    </div>
                  )}
                </div>

                {message.type === "user" && (
                  <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-purple-100 text-purple-500">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 p-2 flex items-center gap-2 min-w-[600px] max-w-[900px] w-[60vw] min-h-[48px] animate-in slide-in-from-bottom-4 duration-500">
          <ReactTextareaAutosize
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              activeSection === "ask-about-today" ? "What's on your mind today?" : "Ask about your reading..."
            }
            minRows={2}
            maxRows={6}
            className="resize-none bg-transparent border-none text-gray-700 placeholder-gray-400 focus:ring-0 rounded-xl px-4 py-2 flex-1 text-sm leading-snug"
            style={{ boxShadow: 'none', overflow: 'hidden' }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="bg-purple-400/80 hover:bg-purple-500/80 backdrop-blur-sm text-white px-4 py-2 h-[40px] rounded-xl flex-shrink-0 transition-all duration-200 hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProfilePanel({
  isOpen,
  onClose,
  userName,
  userProfilePic,
  userEmail,
  medal,
  setShowMedalModal,
  totalSpent,
  readingsCompleted,
  daysActive,
  insightsGained,
  recentActivity,
  navigate, // <-- add navigate prop
}: {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userProfilePic: string;
  userEmail: string;
  medal: { label: string; color: string; icon: React.ReactNode };
  setShowMedalModal: (open: boolean) => void;
  totalSpent: number;
  readingsCompleted: number;
  daysActive: number;
  insightsGained: number;
  recentActivity: string[];
  navigate: ReturnType<typeof useNavigate>; // <-- add type
}) {
  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-200 z-50 flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Account</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-col h-full">
        <div className="flex-1 p-6 space-y-6 overflow-y-auto min-h-0">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={userProfilePic} />
              <AvatarFallback className="bg-gray-900 text-white text-lg">
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{userName}</h3>
              <p className="text-sm text-gray-600">{userEmail}</p>
              <button
                className={`mt-1 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer ${medal.color}`}
                onClick={() => setShowMedalModal(true)}
                title="View your medal tier"
                tabIndex={0}
                type="button"
              >
                {medal.icon}
                {medal.label} Medal
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Usage Statistics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Readings Completed</span>
                  <span className="text-sm font-medium text-gray-900">{readingsCompleted}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Days Active</span>
                  <span className="text-sm font-medium text-gray-900">{daysActive}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Insights Gained</span>
                  <span className="text-sm font-medium text-gray-900">{insightsGained}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Spiritual Progress</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Energy Level</span>
                    <span className="text-sm font-medium text-gray-900">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2">
                    <div className="bg-gray-900 h-2 w-3/4"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Spiritual Growth</span>
                    <span className="text-sm font-medium text-gray-900">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2">
                    <div className="bg-gray-900 h-2 w-3/5"></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {recentActivity.slice(0, 3).map((activity: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-sm py-2">
                    <span className="text-gray-700">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-2 border-t border-gray-200 flex-shrink-0">
          <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
            <User className="w-4 h-4 mr-2" />
            Account Settings
          </Button>
          {totalSpent === 0 && (
            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-gray-900"
            size="sm"
            onClick={async () => {
              const auth = getAuth();
              await signOut(auth);
              navigate('/login');
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProPlanModal({ isOpen, onClose, handleBuyEthers, refreshUserData }: { isOpen: boolean; onClose: () => void; handleBuyEthers: (amount: number) => Promise<void>; refreshUserData: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [selecting, setSelecting] = useState<{ bundle: string, count: number } | null>(null);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<{ ethers: number, unlockedReports: string[] }>({ ethers: 0, unlockedReports: [] });
  const proReportIds = [
    "vibrational-frequency",
    "aura-profile",
    "flame-score",
    "kosha-scan",
    "longevity-index",
    "numerology"
  ];
  const allReports = proReportIds;
  const [lockedReports, setLockedReports] = useState<string[]>([]);

  const handleContactUs = () => {
    alert("Contact us at: enterprise@eternal-ai.com or call +1 (555) 123-4567")
  }

  // Fetch user ethers and unlockedReports for dynamic pricing
  useEffect(() => {
    async function fetchUser() {
      if (!currentUser?.uid) return;
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          ethers: data.ethers || 0,
          unlockedReports: data.unlockedReports || [],
        });
      }
    }
    if (isOpen) fetchUser();
  }, [isOpen, currentUser]);

  useEffect(() => {
    setLockedReports(allReports.filter(r => !userData.unlockedReports.includes(r)));
  }, [userData]);

  const handleBuy = async (amount: number) => {
    setLoading(true);
    setComplete(false);
    await handleBuyEthers(amount);
    setLoading(false);
    setComplete(true);
    setTimeout(() => {
      setComplete(false);
      onClose();
      refreshUserData();
    }, 2000);
  }

  // Dynamic pricing for bundles
  const getBundlePrice = (bundleCount: number) => {
    // Each report costs 20 ethers
    const pricePerReport = 20;
    const locked = lockedReports.length;
    const count = Math.min(bundleCount, locked);
    return count * pricePerReport;
  };

  // Handle bundle button click
  const handleBundleClick = (bundle: { name: string, reports: number }) => {
    if (bundle.name === "Complete Bundle") {
      // Unlock all locked reports
      handleUnlockComplete();
    } else {
      setSelecting({ bundle: bundle.name, count: bundle.reports });
      setSelectedReports([]);
      setError(null);
    }
  };

  // Handle unlocking complete bundle
  const handleUnlockComplete = async () => {
    setLoading(true);
    setError(null);
    const price = getBundlePrice(lockedReports.length);
    if (userData.ethers < price) {
      setError("Not enough Ethers.");
      setLoading(false);
      return;
    }
    try {
      const newUnlocked = [...userData.unlockedReports, ...lockedReports];
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ethers: userData.ethers - price,
        unlockedReports: newUnlocked
      });
      setUserData({ ethers: userData.ethers - price, unlockedReports: newUnlocked });
      setLoading(false);
      setComplete(true);
      setTimeout(() => {
        setComplete(false);
        onClose();
        refreshUserData();
      }, 2000);
    } catch (e) {
      setError("Failed to unlock reports. Try again.");
      setLoading(false);
    }
  };

  // Handle unlocking selected reports (single/triple)
  const handleUnlockSelected = async () => {
    setLoading(true);
    setError(null);
    const price = getBundlePrice(selectedReports.length);
    if (userData.ethers < price) {
      setError("Not enough Ethers.");
      setLoading(false);
      return;
    }
    try {
      const newUnlocked = [...userData.unlockedReports, ...selectedReports];
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ethers: userData.ethers - price,
        unlockedReports: newUnlocked
      });
      setUserData({ ethers: userData.ethers - price, unlockedReports: newUnlocked });
      setLoading(false);
      setComplete(true);
      setSelecting(null);
      setTimeout(() => {
        setComplete(false);
        onClose();
        refreshUserData();
      }, 2000);
    } catch (e) {
      setError("Failed to unlock reports. Try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto relative">
        {/* X Close Button */}
        <button
          className="absolute top-4 right-4 z-50 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
          onClick={onClose}
          aria-label="Close credits popup"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
        {/* Selection Modal for Single/Triple Bundle */}
        {selecting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
              <button
                className="absolute top-4 right-4 z-50 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                onClick={() => setSelecting(null)}
                aria-label="Close selection"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <h3 className="text-lg font-semibold mb-4 text-center">Select {selecting.count} report{selecting.count > 1 ? 's' : ''} to unlock</h3>
              <div className="grid grid-cols-1 gap-3 mb-6">
                {lockedReports.map((reportId) => {
                  const report = reportSections.find(r => r.id === reportId);
                  if (!report) return null;
                  const selected = selectedReports.includes(reportId);
                  return (
                    <button
                      key={reportId}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition ${selected ? 'bg-purple-100 border-purple-400' : 'bg-gray-50 border-gray-200 hover:bg-purple-50'}`}
                      onClick={() => {
                        if (selected) {
                          setSelectedReports(selectedReports.filter(r => r !== reportId));
                        } else if (selectedReports.length < selecting.count) {
                          setSelectedReports([...selectedReports, reportId]);
                        }
                      }}
                    >
                      <report.icon className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{report.label}</span>
                      {selected && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelecting(null)}>Cancel</Button>
                <Button onClick={handleUnlockSelected} disabled={selectedReports.length !== selecting.count || loading}>
                  Unlock Selected ({getBundlePrice(selectedReports.length)} Ethers)
                </Button>
              </div>
              {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
            </div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
            Choose Your Spiritual Journey Plan
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Purchase Ethers to unlock individual reports or bundles for better value
          </p>
        </DialogHeader>
        {loading ? (
          <div className="py-12 text-center text-lg font-semibold text-purple-600">Adding Ethers...</div>
        ) : complete ? (
          <div className="py-12 text-center text-lg font-semibold text-green-600">Transaction complete!</div>
        ) : (
          <>
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Credit Packages</h3>
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className={`relative p-4 border-2 transition-all ${
                      pkg.popular ? "border-gray-900 bg-gray-50" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Best Value
                      </Badge>
                    )}
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{pkg.name}</h4>
                      {pkg.savings && <div className="text-sm text-green-600 font-medium mb-2">{pkg.savings}</div>}
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-2xl font-bold text-gray-900">{pkg.price}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {pkg.credits} Ethers ({pkg.pricePerCredit}/Ether)
                      </div>
                    </div>
                    <Button
                      className={`w-full ${
                        pkg.popular
                          ? "bg-gray-900 hover:bg-gray-800 text-white"
                          : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                      }`}
                      variant={pkg.popular ? "default" : "outline"}
                      onClick={() => handleBuy(pkg.credits)}
                      disabled={loading || complete}
                    >
                      Buy {pkg.credits} Ethers
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Report Bundles</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {reportBundles.map((bundle) => (
                  <div
                    key={bundle.name}
                    className={`relative p-4 border-2 transition-all ${
                      bundle.popular ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {bundle.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}

                    <div className="text-center mb-4">
                      <h4 className="text-base font-semibold text-gray-900 mb-1">{bundle.name}</h4>
                      {bundle.savings && <div className="text-xs text-green-600 font-medium mb-2">{bundle.savings}</div>}
                      <div className="mb-2">
                        <span className="text-xl font-bold text-gray-900">{getBundlePrice(bundle.reports)}</span>
                        <span className="text-sm text-gray-600 ml-1">Ethers</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {bundle.reports} report{bundle.reports > 1 ? "s" : ""}
                      </div>
                      <div className="text-xs text-gray-500">{bundle.priceEquivalent}</div>
                    </div>

                    <Button
                      className={`w-full text-sm ${
                        bundle.popular
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                      }`}
                      variant={bundle.popular ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleBundleClick(bundle)}
                      disabled={lockedReports.length === 0 || loading}
                    >
                      {bundle.name === "Complete Bundle"
                        ? lockedReports.length === 0
                          ? "All Unlocked"
                          : `Unlock All (${getBundlePrice(lockedReports.length)} Ethers)`
                        : `Unlock ${bundle.reports} (${getBundlePrice(bundle.reports)} Ethers)`}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg">
              <div className="text-center">
                <Crown className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                <h3 className="text-xl font-bold mb-2">Enterprise Plan</h3>
                <p className="text-gray-300 mb-4 max-w-2xl mx-auto">
                  Custom solutions for organizations, spiritual centers, and wellness practitioners. Bulk credits,
                  white-label options, API access, and dedicated support.
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-300 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Unlimited reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>API integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>White-label solution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Priority support</span>
                  </div>
                </div>
                <Button
                  onClick={handleContactUs}
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-8"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Sales
                </Button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Ethers never expire</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span>Instant access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-gray-900" />
                  <span>Premium insights</span>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Add pool of numerology questions
const numerologyQuestions = [
  "What is your full name?",
  "What is your date of birth? (YYYY-MM-DD)",
  "Where were you born?",
  "What is your birth time? (HH:MM, optional)",
  "What is your phone number? (optional)",
  "What is your favorite color?",
  "What is your mother's maiden name?",
  "What is your lucky number?",
  "What is your favorite day of the week?"
];

// Add getNumerologyFollowUp utility function (replace with GPT call as needed)
async function getNumerologyFollowUp(
  numFollowUps: number,
  userAnswers: string[],
  userMessage: string,
  currentUser: any
): Promise<string | null> {
  // Placeholder: return a dynamic follow-up question based on the step
  if (numFollowUps === 0) {
    return "What is your full name? (for numerology calculation)";
  } else if (numFollowUps === 1) {
    return "What is your date of birth? (YYYY-MM-DD)";
  }
  return null;
}

// Main Component
export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("ask-about-today")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showProModal, setShowProModal] = useState(false)
  const [unlockedFeatures, setUnlockedFeatures] = useState<string[]>([])
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<{
    profilePicUrl: string;
    name: string;
    email: string;
    dob: string;
    birthPlace: string;
    totalSpent: number;
    streak: number;
    readingsCompleted?: number;
    daysActive?: number;
    insightsGained?: number;
    recentActivity?: string[];
  }>({
    profilePicUrl: defaultProfilePic,
    name: 'Spiritual Seeker',
    email: '',
    dob: '',
    birthPlace: '',
    totalSpent: 0,
    streak: 0,
    readingsCompleted: 0,
    daysActive: 0,
    insightsGained: 0,
    recentActivity: [],
  });
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  // Responsive sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ethers and unlockedReports state
  const [ethers, setEthers] = useState(0);
  const [unlockedReports, setUnlockedReports] = useState<string[]>([]);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [pendingBundle, setPendingBundle] = useState<{ type: string, count: number } | null>(null);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [showMedalModal, setShowMedalModal] = useState(false);
  // Numerology chat flow state
  const [numFollowUps, setNumFollowUps] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [lastFollowUp, setLastFollowUp] = useState<string | null>(null);

  const navigate = useNavigate();

  // In Dashboard, refactor fetchUserEthers to a function and pass it to ProPlanModal as refreshUserData
  const fetchUserEthers = async () => {
    if (!currentUser?.uid) return;
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setEthers(data.ethers || 0);
      const unlockedReportsFromFirestore = data.unlockedReports || [];
      setUnlockedReports(unlockedReportsFromFirestore);
      setUnlockedFeatures(["ask-about-today", "star-map", ...unlockedReportsFromFirestore]);
    }
  };
  useEffect(() => { fetchUserEthers(); }, [currentUser]);

  // Dummy purchase logic for ethers packages
  const handleBuyEthers = async (amount: number) => {
    setEthers(prev => prev + amount);
    if (currentUser?.uid) {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      let prevSpent = 0;
      if (userDoc.exists()) {
        const data = userDoc.data();
        prevSpent = data.totalSpent || 0;
      }
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ethers: ethers + amount,
        totalSpent: prevSpent + amount,
      });
    }
  };

  // Handle bundle purchase and unlock modal
  const handleBundlePurchase = (bundle: { type: string, count: number }) => {
    setPendingBundle(bundle);
    setShowUnlockModal(true);
    setSelectedReports([]);
  };

  const handleUnlockReports = async () => {
    if (!currentUser?.uid) return;
    await updateDoc(doc(db, 'users', currentUser.uid), {
      unlockedReports: arrayUnion(...selectedReports)
    });
    setUnlockedReports(prev => [...prev, ...selectedReports]);
    setShowUnlockModal(false);
    setPendingBundle(null);
    setSelectedReports([]);
  };

  // Only allow access to unlocked reports
  const isReportUnlocked = (reportId: string) => unlockedReports.includes(reportId);

  const handleSectionClick = (sectionId: string) => {
    if (unlockedFeatures.includes(sectionId)) {
      setActiveSection(sectionId)
    } else {
      setShowProModal(true)
    }
  }

  // Fetch user profile from Firebase on mount and when currentUser changes
  useEffect(() => {
    async function fetchUserProfile() {
      if (!currentUser?.uid) return;
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        let fullName = '';
        if (data.fullName) {
          fullName = data.fullName;
        } else if (data.firstName && data.lastName) {
          fullName = `${data.firstName} ${data.lastName}`;
        } else if (data.firstName) {
          fullName = data.firstName;
        } else if (data.displayName) {
          fullName = data.displayName;
        } else {
          fullName = data.email || 'Spiritual Seeker';
        }
        setUserProfile({
          profilePicUrl: data.profilePicUrl || defaultProfilePic,
          name: fullName,
          email: data.email || '',
          dob: data.dateOfBirth || '',
          birthPlace: data.birthPlace || '',
          totalSpent: data.totalSpent || 0,
          streak: data.streak || 0,
          readingsCompleted: data.readingsCompleted || 0,
          daysActive: data.daysActive || 0,
          insightsGained: data.insightsGained || 0,
          recentActivity: data.recentActivity || [],
        });
      }
    }
    fetchUserProfile();
  }, [currentUser]);

  // Fetch profile image from Firestore
  useEffect(() => {
    async function fetchProfileImage() {
      if (!currentUser?.uid) return;
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists() && userDoc.data().profilePicUrl) {
        setProfileAvatar(userDoc.data().profilePicUrl);
      } else {
        setProfileAvatar(null);
      }
    }
    fetchProfileImage();
  }, [currentUser]);

  // Sidebar overlay close handler
  const handleSidebarClose = () => setSidebarOpen(false);

  // Trap focus in sidebar when open (basic)
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Medal tier logic
  const getMedalTier = (spent: number) => {
    if (spent >= 1000) return { label: 'Platinum', color: 'bg-gradient-to-r from-gray-400 to-blue-300 text-white', icon: <Crown className="w-4 h-4 text-blue-400" /> };
    if (spent >= 100) return { label: 'Gold', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white', icon: <Crown className="w-4 h-4 text-yellow-400" /> };
    if (spent >= 50) return { label: 'Silver', color: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white', icon: <Crown className="w-4 h-4 text-gray-400" /> };
    if (spent >= 10) return { label: 'Bronze', color: 'bg-gradient-to-r from-yellow-700 to-yellow-500 text-white', icon: <Crown className="w-4 h-4 text-yellow-700" /> };
    return { label: 'Free', color: 'bg-gray-200 text-gray-700', icon: <Crown className="w-4 h-4 text-gray-400" /> };
  };
  const medal = getMedalTier(userProfile.totalSpent || 0);

  // Add ESC key handling for medal modal and sidebar
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showMedalModal) setShowMedalModal(false);
        if (sidebarOpen) setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showMedalModal, sidebarOpen]);

  // On login, update daysActive and streak
  useEffect(() => {
    async function updateLoginStats() {
      if (!currentUser?.uid) return;
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const lastLogin = data.lastLogin ? new Date(data.lastLogin) : null;
        const today = new Date();
        today.setHours(0,0,0,0);
        let daysActive = data.daysActive || 0;
        let streak = data.streak || 0;
        let lastStreakDate = data.lastStreakDate ? new Date(data.lastStreakDate) : null;
        let recentActivity = data.recentActivity || [];
        let streakUpdated = false;
        if (!lastLogin || lastLogin.toDateString() !== today.toDateString()) {
          daysActive += 1;
          if (lastStreakDate && (today.getTime() - lastStreakDate.getTime()) === 86400000) {
            streak += 1;
            streakUpdated = true;
          } else if (!lastStreakDate || (today.getTime() - lastStreakDate.getTime()) > 86400000) {
            streak = 1;
            streakUpdated = true;
          }
          if (streakUpdated && (streak % 10 === 0)) {
            recentActivity = [
              `🎉 ${streak} day streak achieved!`,
              ...recentActivity.slice(0, 9)
            ];
          }
          await updateDoc(userDocRef, {
            daysActive,
            streak,
            lastLogin: today.toISOString(),
            lastStreakDate: today.toISOString(),
            recentActivity
          });
        }
      }
    }
    updateLoginStats();
  }, [currentUser]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-150 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-purple-300 text-lg font-light opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: "rotate(" + Math.random() * 360 + "deg)",
            }}
          >
            +
          </div>
        ))}

        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`line-${i}`}
            className="absolute w-8 h-0.5 bg-purple-200 opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Sidebar for desktop, Drawer for mobile */}
      {/* Overlay for mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={handleSidebarClose}
          aria-label="Close sidebar overlay"
        />
      )}
      <aside
        className={
          `z-50 fixed top-0 left-0 h-full w-[28rem] bg-white/20 backdrop-blur-xl border-r border-white/30 flex flex-col overflow-hidden rounded-r-3xl transition-transform duration-300`
          + (sidebarOpen ? ' translate-x-0' : ' -translate-x-full')
        }
        style={{ boxShadow: sidebarOpen ? '0 0 0 9999px rgba(0,0,0,0.1)' : undefined }}
        tabIndex={sidebarOpen ? 0 : -1}
        aria-modal={sidebarOpen ? 'true' : undefined}
        role="dialog"
      >
        <Sidebar
          activeSection={activeSection}
          onSectionClick={(id) => {
            setActiveSection(id);
            setSidebarOpen(false);
          }}
          unlockedFeatures={unlockedFeatures}
          username={userProfile.name}
          profileAvatar={profileAvatar || userProfile.profilePicUrl || defaultProfilePic}
          fallbackPic={defaultProfilePic}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setShowProModal={setShowProModal}
        />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <div className="relative">
          <div className="flex items-center h-14 md:h-12 bg-white/15 backdrop-blur-xl border-b border-white/20 px-4 md:px-6 flex-shrink-0 mx-0 md:mx-4 mt-2 md:mt-4 rounded-none md:rounded-2xl">
            {/* Hamburger menu for all screens */}
            <button
              className="mr-2 p-2 rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar menu"
              title="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex-1 flex items-center">
              <h2 className="text-base md:text-lg font-semibold text-gray-700 truncate">{sectionTitles[activeSection] || "Select a Reading"}</h2>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="ghost"
                size="default"
                className="hidden md:flex items-center gap-2 hover:bg-white/20 px-4 py-2 text-gray-500 hover:text-gray-700 bg-white/10 backdrop-blur-sm rounded-lg text-base h-10"
                onClick={() => navigate('/home')}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-base font-semibold">Dashboard</span>
              </Button>
              {/* Credits box - now clickable */}
              <div
                className="flex items-center gap-2 px-4 py-2 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 cursor-pointer hover:bg-purple-100 transition"
                onClick={() => setShowProModal(true)}
                title="Buy more Ethers"
              >
                <Coins className="w-5 h-5 text-purple-400" />
                <span className="text-base font-bold text-purple-500">{ethers}</span>
                <span className="text-base text-purple-400">Ethers</span>
              </div>
              {/* Profile button - show avatar, name, dropdown */}
              <Button
                variant="ghost"
                size="default"
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-3 hover:bg-white/20 px-4 py-2 h-10 bg-white/10 backdrop-blur-sm rounded-lg text-base min-w-[160px]"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profileAvatar || userProfile.profilePicUrl || defaultProfilePic} />
                  <AvatarFallback className="bg-gray-600 text-white text-base">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-base font-semibold text-gray-700 truncate max-w-[90px]">{userProfile.name}</span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </Button>
            </div>
          </div>
        </div>
        {/* Chat area */}
        <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">
          {activeSection === 'numerology' && (
            <ChatArea
              activeSection={activeSection}
              ethers={ethers}
              setEthers={setEthers}
              unlockedReports={unlockedReports}
              setUnlockedReports={setUnlockedReports}
              currentUser={currentUser}
              userProfile={userProfile}
              navigate={navigate}
            />
          )}
        </div>
      </div>

      {/* Profile panel and modals (unchanged) */}
      <ProfilePanel
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userName={userProfile.name}
        userProfilePic={profileAvatar || userProfile.profilePicUrl || defaultProfilePic}
        userEmail={userProfile.email}
        medal={medal}
        setShowMedalModal={setShowMedalModal}
        totalSpent={userProfile.totalSpent}
        readingsCompleted={userProfile.readingsCompleted || 0}
        daysActive={userProfile.daysActive || 0}
        insightsGained={userProfile.insightsGained || 0}
        recentActivity={userProfile.recentActivity || []}
        navigate={navigate} // <-- pass navigate prop
      />
      <ProPlanModal isOpen={showProModal} onClose={() => setShowProModal(false)} handleBuyEthers={handleBuyEthers} refreshUserData={fetchUserEthers} />

      {showUnlockModal && pendingBundle && (
        <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
          <DialogContent className="max-w-md bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900 text-center">
                Unlock Reports for "{pendingBundle.type}" Bundle
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                You are about to unlock {pendingBundle.count} Ethers worth of reports.
                Please select which reports you would like to unlock.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {reportSections.map((report) => (
                  <Button
                    key={report.id}
                    variant={selectedReports.includes(report.id) ? "default" : "outline"}
                    onClick={() => {
                      if (selectedReports.includes(report.id)) {
                        setSelectedReports(prev => prev.filter(r => r !== report.id));
                      } else {
                        setSelectedReports(prev => [...prev, report.id]);
                      }
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <report.icon className="w-4 h-4 text-gray-600" />
                      <span>{report.label}</span>
                    </div>
                  </Button>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUnlockModal(false)}>Cancel</Button>
                <Button onClick={handleUnlockReports} disabled={selectedReports.length === 0}>
                  Unlock Selected
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showMedalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-5xl min-h-[32rem] w-full relative animate-in slide-in-from-bottom-4">
            <button
              className="absolute top-4 right-4 z-50 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              onClick={() => setShowMedalModal(false)}
              aria-label="Close medal info"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-2xl font-bold text-center mb-2">Your Medal Journey</h2>
            <div className="flex flex-col gap-4 mb-6">
              {/* Medal Tiers - make them bigger */}
              <div className="flex flex-row gap-6 justify-center items-end w-full mb-6">
                {[
                  { label: 'Free', color: 'bg-gray-200 text-gray-700', min: 0, icon: <Crown className="w-8 h-8 text-gray-400" /> },
                  { label: 'Bronze', color: 'bg-gradient-to-r from-yellow-700 to-yellow-500 text-white', min: 10, icon: <Crown className="w-8 h-8 text-yellow-700" /> },
                  { label: 'Silver', color: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white', min: 50, icon: <Crown className="w-8 h-8 text-gray-400" /> },
                  { label: 'Gold', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white', min: 100, icon: <Crown className="w-8 h-8 text-yellow-400" /> },
                  { label: 'Platinum', color: 'bg-gradient-to-r from-gray-400 to-blue-300 text-white', min: 1000, icon: <Crown className="w-8 h-8 text-blue-400" /> },
                ].map((tier) => (
                  <div
                    key={tier.label}
                    className={`flex flex-col items-center justify-center text-center gap-2 rounded-2xl w-48 h-64 shadow-xl transition-all duration-200 transform bg-white/80 ${medal.label === tier.label ? 'ring-2 ring-purple-400' : ''} ${tier.color} hover:scale-105`}
                    style={{ background: tier.color.includes('gradient') ? undefined : undefined }}
                  >
                    {tier.icon}
                    <span className="font-bold text-xl mt-2">{tier.label} Medal</span>
                    <span className="text-base font-medium">${tier.min}+ spent</span>
                    {medal.label === tier.label && (
                      <span className="mt-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-bold">Current</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6 text-center text-gray-700">
              <h3 className="font-semibold mb-1">How to Level Up</h3>
              <ul className="text-sm space-y-1">
                <li>• Unlock higher medals by purchasing credits and unlocking reports.</li>
                <li>• Maintain a <span className="font-semibold">7-day streak</span> to earn bonus rewards and loyalty perks.</li>
                <li>• Consistent use and engagement unlocks exclusive features.</li>
              </ul>
            </div>
            <div className="flex flex-col items-center gap-2 mt-4">
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-base font-semibold px-4 py-3 rounded-xl transition-all duration-200 text-center whitespace-normal break-words hover:scale-105 hover:shadow-lg hover:shadow-purple-300/40"
                onClick={() => { setShowMedalModal(false); setShowProModal(true); }}
              >
                Want to level up your lifestyle? Buy more credits and begin your journey!
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive styles for chat input and area */}
      <style>
        {`
        @keyframes float-line {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateX(20px) translateY(-10px);
            opacity: 0;
          }
        }
        
        .animate-float-line {
          animation: float-line linear infinite;
        }

        @keyframes slide-in-from-bottom-4 {
          from {
            transform: translateY(16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-in-from-bottom-2 {
          from {
            transform: translateY(8px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-bottom-4 {
          animation: slide-in-from-bottom-4 0.5s ease-out;
        }
        
        .slide-in-from-bottom-2 {
          animation: slide-in-from-bottom-2 0.7s ease-out;
        }
        @media (max-width: 768px) {
          .min-w-[600px] { min-width: 100% !important; }
          .max-w-[900px] { max-width: 100% !important; }
          .w-[60vw] { width: 100vw !important; }
          .p-6 { padding: 1rem !important; }
        }
        @media (max-width: 480px) {
          .p-6 { padding: 0.5rem !important; }
        }
        `}
      </style>
    </div>
  )
}