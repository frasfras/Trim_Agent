import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, AlertCircle, Scissors, BookOpen, Coffee, MessageSquare, Clipboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message, SessionState } from "./types";
import BarberHeader from "./components/BarberHeader";
import ChatMessage from "./components/ChatMessage";
import QuickPrompts from "./components/QuickPrompts";
import ReceiptTicket from "./components/ReceiptTicket";

// Unique ID Generator
const generateId = () => Math.random().toString(36).substring(2, 9);

// Fun rotating barber-themed thinking messages
const BARBER_THINKING_STATUSES = [
  "Stropping razor on leather belt...",
  "Lathering up rich warm sandalwood shaving soap...",
  "Reviewing the haircut catalog...",
  "Sterilizing scissors & clippers in Barbicide...",
  "Steaming fresh hot towels...",
  "Consulting the appointment registry...",
  "Sweeping up hair from the last cut...",
  "Adjusting the hydraulics of the vintage chair..."
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<SessionState>({
    sessionId: null,
    loading: true,
    error: null,
  });
  const [inputValue, setInputValue] = useState("");
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [copiedSession, setCopiedSession] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize/retrieve session ID on mount
  useEffect(() => {
    initializeSession();
  }, []);

  // Cycle thinking statuses while waiting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBotThinking) {
      interval = setInterval(() => {
        setThinkingIndex((prev) => (prev + 1) % BARBER_THINKING_STATUSES.length);
      }, 3000);
    } else {
      setThinkingIndex(0);
    }
    return () => clearInterval(interval);
  }, [isBotThinking]);

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotThinking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeSession = async () => {
    setSession({ sessionId: null, loading: true, error: null });
    try {
      const response = await fetch("/api/sessions", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to create session with the server.");
      }
      const data = await response.json();
      
      // Determine session ID (handle different possible payload structures)
      const sid = data.session_id || data.sessionId || data.id || "web-user-01-session";
      
      setSession({
        sessionId: sid,
        loading: false,
        error: null,
      });

      // Add welcoming introductory bot message
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: `💈 **Welcome to The Clipper & Blade Barber Shop!** 💈\n\nI am your AI Concierge, here to coordinate your grooming experience. I can assist you with:\n- Booking haircuts, trims, or luxury straight-shaves.\n- Explaining our services, vintage grooming therapies, and rates.\n- Answering styling questions to recommend the best cut for your hair texture.\n- Finding appointment availability.\n\nHow can I help clean up your look today, sir?`,
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setSession({
        sessionId: null,
        loading: false,
        error: err.message || "Could not reach the Barber Shop API server.",
      });
    }
  };

  // Helper to extract text from generic backend response events
  const extractTextFromEvent = (event: any): string | null => {
    if (!event) return null;
    if (typeof event === "string") return event;

    // Standard structures
    if (event.message?.parts?.[0]?.text) {
      return event.message.parts[0].text;
    }
    if (event.message?.content) {
      if (typeof event.message.content === "string") return event.message.content;
      if (event.message.content.parts?.[0]?.text) return event.message.content.parts[0].text;
    }
    if (event.parts?.[0]?.text) {
      return event.parts[0].text;
    }
    if (typeof event.text === "string" && event.text.trim()) {
      return event.text;
    }
    if (typeof event.content === "string" && event.content.trim()) {
      return event.content;
    }
    if (typeof event.message === "string" && event.message.trim()) {
      return event.message;
    }
    if (typeof event.data === "string" && event.data.trim()) {
      return event.data;
    }
    if (event.data && typeof event.data === "object") {
      if (typeof event.data.text === "string") return event.data.text;
      if (event.data.parts?.[0]?.text) return event.data.parts[0].text;
    }
    if (event.new_message?.parts?.[0]?.text) {
      return event.new_message.parts[0].text;
    }

    // Recursive search fallback for any field named 'text'
    for (const key in event) {
      if (event[key] && typeof event[key] === "object") {
        const nested = extractTextFromEvent(event[key]);
        if (nested) return nested;
      }
    }

    return null;
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmedText = textToSend.trim();
    if (!trimmedText || !session.sessionId || isBotThinking) return;

    // 1. Add user message to state
    const userMessage: Message = {
      id: generateId(),
      sender: "user",
      text: trimmedText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsBotThinking(true);

    try {
      // 2. Query our fullstack proxy endpoint
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.sessionId,
          message: trimmedText,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error (status ${response.status})`);
      }

      const eventsList = await response.json();
      console.log("Raw API Response Events List:", eventsList);

      // 3. Find last text message in list of returned events
      let botText = "";
      if (Array.isArray(eventsList)) {
        // Iterate backward to find the last text message
        for (let i = eventsList.length - 1; i >= 0; i--) {
          const extracted = extractTextFromEvent(eventsList[i]);
          if (extracted) {
            botText = extracted;
            break;
          }
        }
      } else if (eventsList && typeof eventsList === "object") {
        // What if eventsList is wrapped in another object?
        const potentialArray = eventsList.events || eventsList.data || eventsList.parts || eventsList.response;
        if (Array.isArray(potentialArray)) {
          for (let i = potentialArray.length - 1; i >= 0; i--) {
            const extracted = extractTextFromEvent(potentialArray[i]);
            if (extracted) {
              botText = extracted;
              break;
            }
          }
        } else {
          // Check the object itself
          botText = extractTextFromEvent(eventsList) || "";
        }
      }

      // Fallback response if parsing didn't find any message
      if (!botText.trim()) {
        botText = "✂️ *[Agent Update]* I successfully processed your request, but did not return any explicit conversational message event. Please let me know how else I can assist you!";
      }

      // 4. Add bot response to state
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          sender: "bot",
          text: botText,
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          sender: "bot",
          text: `⚠️ **Concierge System Error:** I couldn't reach the barbershop schedule book. It might be due to server load or network issues (Status: ${error.message}). Please try sending again in a few seconds!`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

  const handleResetSession = () => {
    setMessages([]);
    initializeSession();
  };

  const handleCopySession = () => {
    if (session.sessionId) {
      navigator.clipboard.writeText(session.sessionId);
      setCopiedSession(true);
      setTimeout(() => setCopiedSession(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-ink-black flex justify-center items-stretch overflow-hidden select-text antialiased">
      {/* Outer framing wrapper containing App with Thick Borders */}
      <div className="w-full max-w-[1400px] flex flex-col bg-[#FDFBF7] border-x-4 border-ink-black overflow-hidden relative shadow-2xl">
        
        {/* Header Widget */}
        <BarberHeader
          sessionId={session.sessionId}
          loading={session.loading}
          onReset={handleResetSession}
        />

        {/* Master Body Panel (Bento Grid on Large Screens, scroll chat in middle) */}
        <main className="flex-1 flex overflow-hidden relative">
          
          {/* LEFT: Main Chat Component */}
          <div className="flex-1 flex flex-col overflow-hidden bg-warm-paper-light">
            
            {/* Top Info Banner if server fails to connect */}
            {session.error && (
              <div className="bg-barber-red/10 border-b-2 border-ink-black px-4 py-3 flex items-center justify-between gap-3 text-xs text-barber-red font-mono">
                <span className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  ERROR: {session.error}
                </span>
                <button
                  onClick={initializeSession}
                  className="px-3 py-1.5 border border-barber-red bg-barber-red text-warm-paper font-mono uppercase font-bold text-[10px] tracking-wider rounded-sm hover:bg-barber-red-dark transition-all cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Scrollable Chat Area */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 md:px-6 relative flex flex-col bg-[radial-gradient(#b58e5814_1px,transparent_1px)] [background-size:20px_20px]"
            >
              <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-start">
                
                {/* Vintage Welcome card displayed on start */}
                {messages.length <= 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border-2 border-brass bg-white p-6 md:p-8 rounded-sm mb-6 text-center shadow-[6px_6px_0px_rgba(181,142,88,0.2)] select-none relative overflow-hidden"
                  >
                    {/* Decorative stripe line at card top */}
                    <div className="absolute top-0 left-0 w-full h-1 barber-stripe"></div>
                    <div className="absolute right-[-12px] top-[15px] rotate-12 text-brass/10 font-serif select-none pointer-events-none text-9xl">
                      ✂️
                    </div>
                    <div className="w-14 h-14 border-2 border-brass bg-ink-black flex items-center justify-center text-brass mx-auto mb-4 rounded-sm">
                      <Scissors className="w-7 h-7" />
                    </div>
                    <h2 className="font-serif font-black italic text-2xl text-ink-black tracking-tight mb-2 uppercase">
                      The Grooming Parlour
                    </h2>
                    <p className="font-sans text-xs md:text-sm text-ink-black/70 max-w-md mx-auto leading-relaxed font-medium">
                      Consult our master digital assistant to coordinate appointment slots, explore classic therapies, look up shave rates, or to sweep through classic pompadours. Select an action below to begin.
                    </p>
                  </motion.div>
                )}

                {/* List of Messages */}
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                </AnimatePresence>

                {/* Thinking animation state */}
                {isBotThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex w-full gap-3.5 my-4 justify-start"
                  >
                    <div className="w-10 h-10 border-2 border-brass bg-ink-black flex items-center justify-center text-brass shadow-sm shrink-0 mt-0.5 select-none rounded-sm">
                      <Scissors className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="flex flex-col max-w-[85%] sm:max-w-[78%]">
                      <span className="font-mono text-[9px] uppercase tracking-widest mb-1 text-brass-dark font-bold">
                        BARBER AGENT
                      </span>
                      <div className="bg-white border-2 border-brass p-4 shadow-[4px_4px_0px_rgba(181,142,88,0.15)] relative rounded-sm">
                        <div className="flex items-center gap-3">
                          {/* Pulsing Dots Loader */}
                          <div className="flex space-x-1.5 items-center shrink-0">
                            <span className="w-2 h-2 bg-brass rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-brass rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-brass rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                          <span className="font-mono text-xs italic text-brass font-bold tracking-wide">
                            {BARBER_THINKING_STATUSES[thinkingIndex]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input & Options Panel at Bottom */}
            <div className="border-t-4 border-ink-black bg-warm-paper p-4 shrink-0">
              <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">
                
                {/* Suggestions triggers (Shown only if not waiting or loading) */}
                <AnimatePresence>
                  {!isBotThinking && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <QuickPrompts
                        onSelect={handleSendMessage}
                        disabled={session.loading || isBotThinking}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main Text Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }}
                  className="flex gap-3 items-stretch relative"
                >
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={session.loading || isBotThinking}
                      placeholder={
                        session.loading
                          ? "Acquiring secure barber chair..."
                          : "Speak with the master barber agent..."
                      }
                      className="w-full bg-warm-paper-dark border-2 border-ink-black px-4 py-3.5 rounded-sm text-sm font-medium placeholder:text-ink-black/40 outline-none focus:ring-2 focus:ring-brass transition-all disabled:opacity-60 pr-28"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 select-none pointer-events-none opacity-50">
                      <span className="text-[9px] font-mono font-bold tracking-wider text-ink-black">CLIENT: WEB-USER-01</span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={session.loading || isBotThinking || !inputValue.trim()}
                    className="w-24 bg-ink-black text-brass hover:bg-brass hover:text-ink-black flex flex-col items-center justify-center border-2 border-ink-black transition-all cursor-pointer disabled:opacity-40 select-none rounded-sm"
                  >
                    <Send className="w-5 h-5 shrink-0" />
                    <span className="text-[9px] font-mono font-bold uppercase mt-1 tracking-widest">Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar appointment ticket details (Hidden on screens smaller than lg) */}
          <aside className="hidden lg:flex w-[380px] border-l-4 border-ink-black bg-warm-paper p-6 overflow-y-auto flex-col justify-start gap-6 select-none relative shrink-0">
            {/* Background ambiance details */}
            <div className="flex flex-col gap-1 text-center border-b-2 border-ink-black pb-4">
              <h4 className="font-serif font-black italic text-lg tracking-tight text-ink-black uppercase">SHOP DIRECTORY</h4>
              <p className="text-[10px] font-mono tracking-widest text-brass-dark font-bold uppercase">PARLOUR CONCIERGE</p>
            </div>

            <ReceiptTicket sessionId={session.sessionId} />

            {/* Barber Shop Rules and Hours Tag */}
            <div className="bg-white border-2 border-brass/50 rounded-sm p-4 font-mono text-[10px] text-ink-black/85 flex flex-col gap-3.5 shadow-[4px_4px_0px_rgba(181,142,88,0.15)]">
              <div className="font-bold text-brass uppercase border-b border-dashed border-ink-black/10 pb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-steel-blue" />
                <span>SHOP RULES &amp; POLICY</span>
              </div>
              <p className="leading-relaxed text-ink-black/80 font-medium">
                • Razor hot towels require a 15-minute preparation buffer.
              </p>
              <p className="leading-relaxed text-ink-black/80 font-medium">
                • Late arrivals past 10 minutes from schedule will automatically forfeit the reservation window.
              </p>
              <div className="font-bold text-brass uppercase border-b border-dashed border-ink-black/10 pt-1 pb-1.5 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-steel-blue" />
                <span>OPERATING HOURS</span>
              </div>
              <div className="flex justify-between font-mono font-bold text-ink-black/80">
                <span>TUE - FRI:</span>
                <span className="text-steel-blue">9:00 AM - 7:00 PM</span>
              </div>
              <div className="flex justify-between font-mono font-bold text-ink-black/80">
                <span>SATURDAY:</span>
                <span className="text-steel-blue">8:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between font-mono font-bold">
                <span>SUN - MON:</span>
                <span className="text-barber-red font-extrabold uppercase">CLOSED</span>
              </div>
            </div>
          </aside>

        </main>
      </div>
    </div>
  );
}
