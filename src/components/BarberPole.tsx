import React from "react";

export default function BarberPole() {
  return (
    <div className="flex flex-col items-center w-6 h-16 relative select-none">
      {/* Top Brass Cap */}
      <div className="w-7 h-2 bg-brass border border-brass-dark rounded-t shadow-md z-10" />
      <div className="w-5 h-1 bg-brass-dark z-10" />

      {/* Glass Body with Stripes */}
      <div className="w-4 flex-1 border-x border-ink-black/20 relative overflow-hidden animate-barberpole shadow-inner" />

      {/* Bottom Brass Cap */}
      <div className="w-5 h-1 bg-brass-dark z-10" />
      <div className="w-7 h-2 bg-brass border border-brass-dark rounded-b shadow-md z-10" />
    </div>
  );
}
