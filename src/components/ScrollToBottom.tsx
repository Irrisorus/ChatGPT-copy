"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScrollToBottomProps {
  containerRef: React.RefObject<HTMLDivElement|null>;
}

export default function ScrollToBottom({ containerRef }: ScrollToBottomProps) {
  const [isVisible, setIsVisible] = useState(false);

  const checkScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const isScrolledUp = Math.abs(container.scrollTop) > 200;
    
    setIsVisible(isScrolledUp);
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScroll);
    return () => container.removeEventListener("scroll", checkScroll);
  }, [checkScroll, containerRef]);

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(
        "fixed bottom-24 right-8 rounded-full shadow-lg border animate-in fade-in zoom-in duration-200 z-50 cursor-pointer",
        "bg-background/80 backdrop-blur-sm hover:bg-background"
      )}
      onClick={scrollToBottom}
    >
      <ArrowDown className="size-5 text-muted-foreground" />
    </Button>
  );
}
