"use client";

import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { CornerDownLeft, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

import { AttachmentList } from "./AttachmentList";
import { ChatInputToolbar } from "./ChatInputToolbar";
import { useChatInput } from "@/hooks/use-chat-input";

export function ChatInput() {
  const {
    input,
    setInput,
    attachments,
    isDragging,
    setIsDragging,
    formRef,
    fileInputRef,
    imageInputRef,
    processFiles,
    removeFile,
    handleSubmit,
    isDisabled,
    isSending
  } = useChatInput();

  return (
    <div className="w-full shrink-0">
      <div className="w-full bg-background pt-3 pb-4 md:pb-6 px-4">
        <input
          type="file"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) processFiles(Array.from(e.target.files));
            e.target.value = "";
          }}
        />
        <input
          type="file"
          multiple
          accept="image/*"
          ref={imageInputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) processFiles(Array.from(e.target.files));
            e.target.value = "";
          }}
        />

        <form ref={formRef} onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          <div className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
          
          <div
            className="relative w-full"
            onDragEnter={() => !isDisabled && setIsDragging(true)}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.length) processFiles(Array.from(e.dataTransfer.files));
            }}
          >
            {isDragging && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-background/90 backdrop-blur-sm border-2 border-dashed border-primary text-primary animate-in fade-in zoom-in-95">
                <Paperclip className="h-8 w-8 mb-2 animate-bounce" />
                <span className="text-sm font-semibold">Кидайте сюда</span>
              </div>
            )}

            <div className={cn(
              "relative flex flex-col w-full rounded-2xl border bg-secondary/30 transition-all shadow-inner p-2.5 gap-2",
              isDisabled && "opacity-70 cursor-not-allowed"
            )}>
              <AttachmentList attachments={attachments} onRemove={removeFile} />

              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isDisabled ? "Gemini думает..." : "Спроси о чем-нибудь..."}
                className="w-full resize-none bg-transparent px-3 py-2 text-sm focus:outline-none min-h-[40px] max-h-[200px]"
                autoFocus
                disabled={isDisabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isDisabled) {
                    e.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
              />

              <ChatInputToolbar
                isSending={isDisabled}
                canSubmit={!!input.trim()}
                onAttachFiles={() => fileInputRef.current?.click()}
                onAttachImages={() => imageInputRef.current?.click()}
                submitIcon={
                  isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CornerDownLeft className="h-4 w-4" />
                  )
                }
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
