import React from "react";
import { RotateCcw, Scissors, User } from "lucide-react";
import BarberPole from "./BarberPole";

interface BarberHeaderProps {
  sessionId: string | null;
  loading: boolean;
  onReset: () => void;
}

export default function BarberHeader({ sessionId, loading, onReset }: BarberHeaderProps) {
  return (
    <header className="w-full bg-warm-paper border-b-4 border-ink-black px-6 py-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 z-30 shrink-0 relative overflow-hidden pt-6">
      {/* Absolute top barbershop stripe accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 barber-stripe"></div>

      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3.5 select-none w-full sm:w-auto justify-center sm:justify-start">
        <div className="w-10 h-10 border-2 border-brass bg-ink-black flex items-center justify-center rounded-sm shrink-0 shadow-sm">
          <span className="text-brass font-serif font-black text-xl tracking-tighter">B</span>
        </div>
        <div className="text-left">
          <h1 className="font-serif font-black italic tracking-tight text-2xl md:text-3xl text-ink-black flex items-center gap-2">
            THE GROOMING AGENT
          </h1>
          <p className="font-mono text-[9px] tracking-widest text-brass-dark uppercase font-bold">
            TRADITIONAL AI BARBER CONCIERGE
          </p>
        </div>
      </div>

      {/* Session Metadata & Reset Controls */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        {/* Ticket-style Session Badge */}
        <div className="bg-white border-2 border-brass/50 rounded-sm px-3 py-1.5 flex items-center gap-2 font-mono text-[11px] text-ink-black shadow-[4px_4px_0px_rgba(181,142,88,0.15)]">
          <User className="w-3.5 h-3.5 text-steel-blue" />
          <span className="opacity-60 uppercase tracking-wider">SESSION:</span>
          <span className="font-bold text-steel-blue truncate max-w-[100px]" title={sessionId || "No Session"}>
            {sessionId ? sessionId.substring(0, 10) : "CONNECTING..."}
          </span>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={loading}
          className="px-5 py-2 border-2 border-barber-red text-barber-red font-mono font-bold uppercase text-xs tracking-widest hover:bg-barber-red hover:text-warm-paper transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center gap-2 shrink-0 bg-transparent"
          title="Reset session and start a new chat"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET</span>
        </button>
      </div>
    </header>
  );
}
