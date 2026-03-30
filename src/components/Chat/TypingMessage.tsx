"use client";

import { useEffect, useRef, useState } from "react";

export default function TypingMessage({ content }: { content: string }) {
  const [visibleContent, setVisibleContent] = useState("");
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisibleContent((prev) => {
        const target = contentRef.current;
        if (prev.length >= target.length) return prev;

        const diff = target.length - prev.length;
        
        let step = 1;
        if (diff > 100) step = 8;
        else if (diff > 30) step = 4;
        else if (diff > 10) step = 2;

        return target.slice(0, prev.length + step);
      });
    }, 20); 

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="whitespace-pre-wrap break-words leading-relaxed">
      {visibleContent}
      <span className="inline-block w-1.5 h-4 ml-1 bg-primary/40 animate-pulse align-middle" />
    </div>
  );
}
