"use client";

import { useEffect, useRef, useState } from "react";

interface TypingMessageProps {
  content: string;
}

export default function TypingMessage({ content }: TypingMessageProps) {
  const [visibleContent, setVisibleContent] = useState("");
  const typingTimerRef = useRef<number | null>(null);
  
  const targetRef = useRef(content);
  targetRef.current = content;

  useEffect(() => {
    typingTimerRef.current = window.setInterval(() => {
      setVisibleContent((prev) => {
        const target = targetRef.current;
        
        if (prev.length >= target.length) {
          return prev;
        }

        const remaining = target.slice(prev.length);
        const newlineIndex = remaining.indexOf("\n");
        
        const step =
          newlineIndex !== -1 && newlineIndex < 120
            ? newlineIndex + 1
            : Math.min(4, remaining.length);

        return target.slice(0, prev.length + step);
      });
    }, 16);

    return () => {
      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
      }
    };
  }, []); 

  return (
    <div className="whitespace-pre-wrap break-word">
      {visibleContent}
      <span className="typing-cursor" />
    </div>
  );
}
