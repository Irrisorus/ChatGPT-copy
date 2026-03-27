"use client";

import React, { useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { Paperclip, CornerDownLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

interface IProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: IProps) {
  const [input, setInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const { isMobile } = useSidebar();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // shif + enter = new line
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    
    if (!trimmedInput || disabled) return;

    onSend(trimmedInput);
    setInput("");
  };

  return (
    <div className="w-full bg-background shrink-0 pt-2 pb-4 md:pb-6 px-4">
      <form 
        ref={formRef} 
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto"
      >
        <div className={`
          relative flex items-end w-full rounded-2xl border bg-secondary/30 
          focus-within:ring-1 focus-within:ring-ring focus-within:border-ring 
          transition-all pr-12 pl-2 py-1.5 shadow-inner
          ${disabled ? "opacity-70 cursor-not-allowed" : ""}
        `}>

          {/* TODO: add file upload */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 rounded-xl"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 rounded-xl"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>

          <TextareaAutosize
            tabIndex={0}
            rows={1}
            maxRows={10}
            value={input}
            disabled={disabled}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Gemini отвечает..." : "Спроси о чем-нибудь..."}
            spellCheck={false}
            className="flex-1 w-full resize-none bg-transparent px-3 py-2 text-sm focus-visible:outline-none disabled:cursor-not-allowed"
          />

          <div className="absolute right-2 bottom-1.5">
            <Button 
              type="submit" 
              size="icon" 
              className="h-9 w-9 rounded-xl transition-all" 
              disabled={!input.trim() || disabled}
            >
              {disabled ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CornerDownLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          Gemini может ошибаться. Проверяйте важную информацию.
        </p>
      </form>
    </div>
  );
}
