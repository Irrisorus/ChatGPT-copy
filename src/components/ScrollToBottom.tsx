"use client";

import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScrollToBottomProps {
  isVisible: boolean; // Внешний флаг видимости
  onClick: () => void; // Внешний обработчик клика
}

export default function ScrollToBottom({ isVisible, onClick }: ScrollToBottomProps) {
  // Анимация ухода (fade-out) при скрытии, чтобы не обрывалось резко
  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(
        // Твои оригинальные стили
        "fixed bottom-24 right-8 rounded-full shadow-lg border z-50 cursor-pointer",
        "bg-background/80 backdrop-blur-sm hover:bg-background",
        // Улучшенная анимация появления и исчезновения
        "transition-all duration-300 ease-in-out",
        isVisible 
          ? "opacity-100 translate-y-0 pointer-events-auto" 
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
      onClick={onClick}
      // Добавляем aria-label для доступности
      aria-label="Прокрутить вниз"
    >
      <ArrowDown className="size-5 text-muted-foreground" />
    </Button>
  );
}
