import React from "react";
import { Scissors, Calendar, Timer, DollarSign } from "lucide-react";

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
  disabled: boolean;
}

export default function QuickPrompts({ onSelect, disabled }: QuickPromptsProps) {
  const prompts = [
    {
      label: "Show Services & Prices",
      text: "What are your barbershop services, price list, and average durations?",
      icon: <DollarSign className="w-3.5 h-3.5 text-brass" />,
    },
    {
      label: "Check Availability",
      text: "Can I check appointment openings for a haircut tomorrow afternoon?",
      icon: <Calendar className="w-3.5 h-3.5 text-barber-red" />,
    },
    {
      label: "Recommend Style",
      text: "I want a classic style that's easy to maintain. What do you suggest for a professional look?",
      icon: <Scissors className="w-3.5 h-3.5 text-steel-blue" />,
    },
    {
      label: "Walk-in Wait Times",
      text: "What is your walk-in policy and how busy does the shop get on weekends?",
      icon: <Timer className="w-3.5 h-3.5 text-brass" />,
    },
  ];

  return (
    <div className="w-full py-1">
      <p className="font-mono text-[9px] uppercase tracking-wider text-ink-black/40 mb-1.5 font-bold">
        SUGGESTED ENQUIRIES
      </p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(p.text)}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-warm-paper hover:bg-warm-paper-dark border border-brass/25 rounded-full text-xs font-medium text-ink-black/85 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none text-left"
          >
            {p.icon}
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
