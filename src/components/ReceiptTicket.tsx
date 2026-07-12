import React from "react";
import { Receipt, Calendar, Clock, Scissors, Info } from "lucide-react";

interface ReceiptTicketProps {
  sessionId: string | null;
}

export default function ReceiptTicket({ sessionId }: ReceiptTicketProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="w-full max-w-sm bg-white border-2 border-brass shadow-[6px_6px_0px_rgba(181,142,88,0.2)] p-5 relative overflow-hidden font-mono text-xs text-ink-black/85 flex flex-col gap-4 self-center md:self-auto shrink-0 select-none rounded-sm">
      {/* Decorative Stamp Background */}
      <div className="absolute right-[-20px] top-[40px] rotate-12 border-4 border-barber-red/20 text-barber-red/20 font-black px-4 py-2 text-xl rounded tracking-widest pointer-events-none select-none uppercase font-serif">
        PAID &amp; CUT
      </div>

      {/* Serrated Cut lines */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-repeating-zigzag opacity-75" />

      {/* Ticket Header */}
      <div className="text-center border-b border-dashed border-ink-black/30 pb-3">
        <Receipt className="w-6 h-6 mx-auto mb-1 text-brass" />
        <h3 className="font-serif font-bold text-sm tracking-wide text-ink-black uppercase">
          APPOINTMENT SLIP
        </h3>
        <p className="text-[10px] text-steel-blue">THE CLIPPER &amp; BLADE BARBER SHOP</p>
      </div>

      {/* Ticket Details */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between">
          <span className="text-steel-blue font-bold">CLIENT:</span>
          <span className="font-semibold text-right">web-user-01</span>
        </div>

        <div className="flex justify-between items-start gap-2">
          <span className="text-steel-blue font-bold shrink-0">SESSION_ID:</span>
          <span className="text-right truncate max-w-[150px] font-semibold text-[10px]" title={sessionId || ""}>
            {sessionId || "GENERATING..."}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-steel-blue font-bold">STATION:</span>
          <span className="font-semibold">CHAIR NO. 4</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-steel-blue font-bold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 inline" /> DATE:
          </span>
          <span className="font-semibold">{currentDate}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-steel-blue font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 inline" /> TIME:
          </span>
          <span className="font-semibold">WALK-IN REQ</span>
        </div>
      </div>

      {/* Services List */}
      <div className="border-t border-b border-dashed border-ink-black/30 py-3 flex flex-col gap-1.5">
        <div className="text-[10px] text-steel-blue tracking-wider font-bold mb-1 uppercase">
          AVAILABLE SERVICES
        </div>
        <div className="flex justify-between">
          <span>• Royal Haircut</span>
          <span className="text-brass">$45.00</span>
        </div>
        <div className="flex justify-between">
          <span>• Straight Razor Shave</span>
          <span className="text-brass">$35.00</span>
        </div>
        <div className="flex justify-between">
          <span>• Beard Sculpting &amp; Trim</span>
          <span className="text-brass">$30.00</span>
        </div>
        <div className="flex justify-between">
          <span>• Hot Towel Lather Therapy</span>
          <span className="text-brass">$20.00</span>
        </div>
      </div>

      {/* Fine Print / Interactive Note */}
      <div className="text-[10px] text-ink-black/60 text-center leading-relaxed italic">
        "Where tradition meets automated precision." Ask our AI barber agent to check wait times, book slots, or choose a classic pompadour.
      </div>

      {/* Barcode representation */}
      <div className="flex flex-col items-center gap-1 mt-1">
        <div className="h-7 w-full flex justify-between overflow-hidden bg-ink-black/5 p-1 rounded-sm">
          {Array.from({ length: 42 }).map((_, i) => {
            const widths = ["w-[1px]", "w-[2px]", "w-[3px]", "w-[1.5px]"];
            const gap = i % 3 === 0 ? "mr-[1px]" : "mr-[2px]";
            const width = widths[Math.floor((Math.sin(i) + 1) * 2)];
            return (
              <div
                key={i}
                className={`${width} ${gap} h-full bg-ink-black`}
              />
            );
          })}
        </div>
        <div className="text-[9px] text-center tracking-[4px] text-ink-black/60 uppercase">
          *BARBER-BOT-01*
        </div>
      </div>
    </div>
  );
}
