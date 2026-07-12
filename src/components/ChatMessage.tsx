import React from "react";
import ReactMarkdown from "react-markdown";
import { User, Scissors } from "lucide-react";
import { motion } from "motion/react";
import { Message } from "../types";

interface ChatMessageProps {
  message: Message;
}

// Generate stable voucher number based on message ID
const getVoucherNumber = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 900) + 100; // range 100-999
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user";
  const voucherNum = getVoucherNumber(message.id);

  // Format timestamp: hh:mm AM/PM
  const timeStr = message.timestamp.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex w-full gap-3.5 my-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar Icon */}
      {!isUser && (
        <div className="w-10 h-10 border-2 border-brass bg-ink-black flex items-center justify-center text-brass shadow-sm shrink-0 mt-3.5 select-none rounded-sm">
          <Scissors className="w-4 h-4" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div className="max-w-[85%] sm:max-w-[78%] flex flex-col">
        {/* Sender Name */}
        <span className={`font-mono text-[9px] uppercase tracking-widest mb-1 px-1 ${isUser ? "text-right text-steel-blue font-bold" : "text-left text-brass-dark font-bold"}`}>
          {isUser ? "CLIENT" : "BARBER AGENT"}
        </span>

        {/* Bubble */}
        {isUser ? (
          <div className="bg-steel-blue text-white p-4 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl max-w-md border-b-4 border-ink-black/35 font-medium text-sm leading-relaxed shadow-sm">
            <p className="whitespace-pre-wrap font-sans">{message.text}</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-brass p-6 shadow-[6px_6px_0px_rgba(181,142,88,0.2)] relative rounded-sm mt-3.5 mb-1.5">
            {/* Ticket Identifier Tag */}
            <div className="absolute -top-3.5 left-4 bg-brass text-white px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-widest font-bold border border-brass-dark">
              Service Voucher #{voucherNum}
            </div>

            <div className="markdown-body font-sans text-ink-black space-y-3 prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="font-serif font-black italic text-xl text-ink-black tracking-tight mt-2.5 mb-1.5" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="font-serif font-bold italic text-lg text-ink-black tracking-tight mt-2 mb-1" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="font-serif font-bold text-base text-ink-black tracking-wider mt-1.5 mb-1" {...props} />,
                  p: ({ node, ...props }) => <p className="font-sans text-ink-black/90 mb-2.5 leading-relaxed text-sm" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold text-barber-red" {...props} />,
                  em: ({ node, ...props }) => <em className="italic text-steel-blue font-semibold" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside ml-2.5 my-2 space-y-2 text-ink-black/85" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-inside ml-2.5 my-2 space-y-2 text-ink-black/85" {...props} />,
                  li: ({ node, ...props }) => <li className="font-sans leading-relaxed text-sm pl-0.5" {...props} />,
                  code: ({ node, ...props }) => (
                    <code className="font-mono text-xs bg-ink-black/5 px-1.5 py-0.5 rounded text-steel-blue font-semibold border border-ink-black/5" {...props} />
                  ),
                  pre: ({ node, ...props }) => (
                    <pre className="font-mono text-xs bg-ink-black/5 p-3 rounded border border-ink-black/10 overflow-x-auto my-3 text-ink-black/90" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-brass pl-4 py-1.5 my-3 bg-warm-paper-dark/30 italic text-ink-black/80 rounded-r text-xs" {...props} />
                  )
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>

            {/* Ticket Footer details */}
            <div className="border-t border-dashed border-ink-black/15 pt-3.5 flex justify-between items-center mt-5 font-mono text-[9px] text-ink-black/50 tracking-wider">
              <span>AGENCY: 1008791897094</span>
              <span>TIME: {timeStr}</span>
            </div>
          </div>
        )}

        {/* Outer Seen / Timestamp flag for users */}
        {isUser && (
          <span className="text-[9px] uppercase font-bold mt-1 text-ink-black/30 tracking-widest mr-1 text-right font-mono">
            Seen • {timeStr}
          </span>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-10 h-10 border-2 border-steel-blue bg-warm-paper flex items-center justify-center text-steel-blue shadow-sm shrink-0 mt-0.5 select-none rounded-sm">
          <User className="w-5 h-5" />
        </div>
      )}
    </motion.div>
  );
}
