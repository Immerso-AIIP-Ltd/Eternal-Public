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
} from "lucide-react"
import defaultProfilePic from './default-pfp.jpg';
import { useAuth } from './context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
// Add this import for auto-resize
import ReactTextareaAutosize from 'react-textarea-autosize';
// Add this import for markdown rendering
import ReactMarkdown from 'react-markdown';
import { generateReportWithVision } from './services/gpt';

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
}: {
  activeSection: string
  onSectionClick: (sectionId: string) => void
  unlockedFeatures: string[]
  username: string
  profileAvatar: string
  fallbackPic: string
}) {
  const unlockedReports = reportSections.filter((section) => unlockedFeatures.includes(section.id))
  const lockedReports = reportSections.filter((section) => !unlockedFeatures.includes(section.id))

  const renderSection = (items: typeof chatSections, title: string, titleIcon: any, showLock = false) => {
    const TitleIcon = titleIcon
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 px-4 py-2 mb-2">
          <TitleIcon className="w-4 h-4 text-gray-600" />
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
        </div>
        <div className="space-y-1">
          {items.map((item) => {
            const isUnlocked = unlockedFeatures.includes(item.id)
            const isActive = activeSection === item.id
            const Icon = item.icon

            return (
              <button
                key={item.id}
                onClick={() => onSectionClick(item.id)}
                className={cn(
                  "w-full p-3 text-left transition-all duration-150 group relative rounded-xl shadow-sm mb-2 bg-white/70 backdrop-blur-md border border-white/30 hover:bg-white/80",
                  isActive && isUnlocked ? "bg-purple-100/80 shadow-md" : "",
                  !isUnlocked && "opacity-60",
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

                {showLock && !isUnlocked && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-sm">
                    <div className="bg-gray-900 text-white px-3 py-1 text-xs font-medium rounded-full">Pro Feature</div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white/20 backdrop-blur-xl border-r border-white/30 flex flex-col overflow-hidden rounded-r-3xl">
      <div className="p-6 border-b border-white/30 text-center">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">ETERNAL AI</h1>
      </div>

      <div className="flex-1 px-2 py-4 overflow-y-auto flex flex-col items-center">
        {renderSection(chatSections, "Chat", MessageCircle)}
        {unlockedReports.length > 0 && renderSection(unlockedReports, "Available Reports", FileText)}
        {lockedReports.length > 0 && renderSection(lockedReports, "Pro Reports", Lock, true)}
      </div>

      <ProfileSection username={username} profileAvatar={profileAvatar} fallbackPic={fallbackPic} />
    </div>
  )
}

function Header({ activeSection, onProfileClick, profileAvatar, fallbackPic }: { activeSection: string; onProfileClick: () => void; profileAvatar: string; fallbackPic: string }) {
  return (
    <div className="h-12 bg-white/15 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-6 flex-shrink-0 mx-4 mt-4 rounded-2xl">
      <div className="w-80 flex items-center">
        <h2 className="text-base font-semibold text-gray-700">{sectionTitles[activeSection] || "Select a Reading"}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 hover:bg-white/20 px-2 py-1 text-gray-500 hover:text-gray-700 bg-white/10 backdrop-blur-sm rounded-lg text-xs h-7"
        >
          <ArrowLeft className="w-3 h-3" />
          <span className="text-xs font-medium">Dashboard</span>
        </Button>

        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20">
          <Coins className="w-3 h-3 text-purple-400" />
          <span className="text-xs font-bold text-purple-500">250</span>
          <span className="text-xs text-purple-400">credits</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onProfileClick}
          className="flex items-center gap-1.5 hover:bg-white/20 px-2 py-1 h-7 bg-white/10 backdrop-blur-sm rounded-lg"
        >
          <Avatar className="w-5 h-5">
            <AvatarImage src={profileAvatar || fallbackPic} />
            <AvatarFallback className="bg-gray-600 text-white text-xs">
              <User className="w-2.5 h-2.5" />
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-gray-600">Profile</span>
          <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
        </Button>
      </div>
    </div>
  )
}

function ChatArea({ activeSection }: { activeSection: string }) {
  const [messages, setMessages] = useState<Message[]>([getInitialMessage(activeSection)])
  const [inputValue, setInputValue] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { currentUser } = useAuth();
  const autoSentRef = useRef(false); // Prevent double auto-send

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
    const textToSend = messageText || inputValue.trim()
    if (!textToSend) return

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
      // Fetch user's Vedic astrology data from Firebase
      let vedicData = null;
      if (currentUser?.uid) {
        const karmicReportDoc = await getDoc(doc(db, 'karmicReports', currentUser.uid));
        if (karmicReportDoc.exists()) {
          vedicData = karmicReportDoc.data();
        }
      }

      // Create the context for the API call
      const reportContext = {
        availableReports: [activeSection],
        auraReport: null,
        vibrationalReport: null,
        karmicReport: vedicData ? {
          birthPlace: vedicData.birthPlace || 'Unknown',
          lifeArea: vedicData.lifeArea || 'General',
          challenge: vedicData.challenge || 'Unknown',
          jyotishReading: vedicData.jyotishReading || '',
          birthData: vedicData.birthData || {},
          vedicApi: vedicData.vedicApi || {},
          rapidApi: vedicData.rapidApi || {}
        } : null
      }

      // Create a comprehensive prompt for Eternal AI
      const enhancedPrompt = `You are Eternal, an AI agent that helps people find their spiritual paths. \n\nUSER'S VEDIC ASTROLOGY DATA:\n${vedicData ? `\nBirth Details:\n- Place: ${vedicData.birthPlace || 'Unknown'}\n- Date: ${vedicData.birthData?.dob || 'Unknown'}\n- Time: ${vedicData.birthData?.tob || 'Unknown'}\n- Timezone: ${vedicData.birthData?.timezone || 'Unknown'}\n- Life Area Focus: ${vedicData.lifeArea || 'General'}\n\nVedic Astrology Reading:\n${vedicData.jyotishReading || 'No reading available'}\n\nVedic API Data:\n${JSON.stringify(vedicData.vedicApi || {}, null, 2)}\n\nNumerology Data:\n${JSON.stringify(vedicData.rapidApi || {}, null, 2)}\n` : 'No Vedic astrology data available for this user.'}\n\nUSER QUERY: "${textToSend}"\n\nPlease provide a helpful, spiritual, and personalized response based on the user's Vedic astrology data and their question. Be encouraging, insightful, and practical. Connect the user's question with their astrological profile when relevant. Keep responses conversational and warm, as if you're a wise spiritual guide.\n\nAfter your response, provide 3-4 follow-up questions that the user could ask next to continue their spiritual exploration. Format these as clickable options.`

      // Debug logging
      console.log('[EternalAI] Sending prompt to backend:', { enhancedPrompt, reportContext, userId: currentUser?.uid || 'user' });

      const handler = generateReportWithVision;
      const apiResponse = await handler(textToSend);

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

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      <ScrollArea ref={scrollAreaRef} className="flex-1 relative z-10">
        <div className="max-w-4xl mx-auto p-6 pb-32">
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
                  className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm animate-in slide-in-from-bottom-2 duration-700 ${
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
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans font-medium">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
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
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
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

function ProfilePanel({ isOpen, onClose, userName, userProfilePic, userEmail }: { isOpen: boolean; onClose: () => void; userName: string; userProfilePic: string; userEmail: string }) {
  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-200 z-50",
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
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
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
              <Badge variant="secondary" className="mt-1 bg-gray-100 text-gray-700 text-xs">
                Free Plan
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Usage Statistics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Readings Completed</span>
                  <span className="text-sm font-medium text-gray-900">3</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Days Active</span>
                  <span className="text-sm font-medium text-gray-900">7</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Insights Gained</span>
                  <span className="text-sm font-medium text-gray-900">12</span>
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
                <div className="flex items-center gap-3 text-sm py-2">
                  <Star className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">Completed Star Map reading</span>
                </div>
                <div className="flex items-center gap-3 text-sm py-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span className="text-gray-700">Energy level increased</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-2 border-t border-gray-200 flex-shrink-0">
          <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
            <User className="w-4 h-4 mr-2" />
            Account Settings
          </Button>
          <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProPlanModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const handleContactUs = () => {
    alert("Contact us at: enterprise@eternal-ai.com or call +1 (555) 123-4567")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
            Choose Your Spiritual Journey Plan
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Purchase credits to unlock individual reports or bundles for better value
          </p>
        </DialogHeader>

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
                    {pkg.credits} credits ({pkg.pricePerCredit}/credit)
                  </div>
                </div>

                <Button
                  className={`w-full ${
                    pkg.popular
                      ? "bg-gray-900 hover:bg-gray-800 text-white"
                      : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                  }`}
                  variant={pkg.popular ? "default" : "outline"}
                >
                  Buy {pkg.credits} Credits
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
                    <span className="text-xl font-bold text-gray-900">{bundle.credits}</span>
                    <span className="text-sm text-gray-600 ml-1">credits</span>
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
                >
                  Use {bundle.credits} Credits
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
              <span>Credits never expire</span>
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
      </DialogContent>
    </Dialog>
  )
}

// Main Component
export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("ask-about-today")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showProModal, setShowProModal] = useState(false)
  const [unlockedFeatures, setUnlockedFeatures] = useState(["ask-about-today", "star-map"])
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState({
    profilePicUrl: defaultProfilePic,
    name: 'Spiritual Seeker',
    email: '',
    dob: '',
    birthPlace: '',
  });
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  const unlockAllFeatures = () => {
    setUnlockedFeatures([
      "ask-about-today",
      "vibrational-frequency",
      "aura-profile",
      "flame-score",
      "star-map",
      "kosha-scan",
      "longevity-index",
      "numerology",
    ])
  }

  if (typeof window !== "undefined") {
    ;(window as any).unlockAll = unlockAllFeatures
  }

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
        setUserProfile({
          profilePicUrl: data.profilePicUrl || defaultProfilePic,
          name: data.firstName || data.displayName || data.email || 'Spiritual Seeker',
          email: data.email || '',
          dob: data.dateOfBirth || '',
          birthPlace: data.birthPlace || '',
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-150 relative overflow-hidden">
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

      <Sidebar
        activeSection={activeSection}
        onSectionClick={handleSectionClick}
        unlockedFeatures={unlockedFeatures}
        username={userProfile.name}
        profileAvatar={profileAvatar || userProfile.profilePicUrl || defaultProfilePic}
        fallbackPic={defaultProfilePic}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeSection={activeSection} onProfileClick={() => setIsProfileOpen(true)} profileAvatar={profileAvatar || userProfile.profilePicUrl || defaultProfilePic} fallbackPic={defaultProfilePic} />
        <ChatArea activeSection={activeSection} />
      </div>

      <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} userName={userProfile.name} userProfilePic={profileAvatar || userProfile.profilePicUrl || defaultProfilePic} userEmail={userProfile.email} />
      <ProPlanModal isOpen={showProModal} onClose={() => setShowProModal(false)} />

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
      `}
      </style>
    </div>
  )
}