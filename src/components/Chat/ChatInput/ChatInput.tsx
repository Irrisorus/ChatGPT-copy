"use client";

import React, { useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useParams } from "next/navigation";
import { CornerDownLeft, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

import { AttachmentList } from "./AttachmentList";
import { ChatInputToolbar } from "./ChatInputToolbar";
import { useChatInput } from "@/hooks/use-chat-input";
import { useMessages } from "@/hooks/use-messages";

export function ChatInput() {
  const { id: chatId } = useParams() as { id: string };

  const { sendMessage, isSending } = useMessages(chatId);

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
    clear,
  } = useChatInput();

  useEffect(() => {
    const handleGlobalDrop = (e: any) => {
      if (e.detail) processFiles(e.detail);
    };
    window.addEventListener("global-file-drop", handleGlobalDrop);
    return () => window.removeEventListener("global-file-drop", handleGlobalDrop);
  }, [processFiles]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isSending || !chatId) return;

    const filesToSend = attachments.map((att) => att.file);
    const currentInput = input;

    clear();
    await sendMessage({
      chatId,
      content: currentInput,
      files: filesToSend
    });
  };

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
          <div
            className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none z-10"
          />
          <div
            className="relative w-full"
            onDragEnter={() => !isSending && setIsDragging(true)}
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
              isSending && "opacity-70 cursor-not-allowed"
            )}>

              <AttachmentList attachments={attachments} onRemove={removeFile} />

              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isSending ? "Gemini думает..." : "Спроси о чем-нибудь..."}
                className="w-full resize-none bg-transparent px-3 py-2 text-sm focus:outline-none min-h-[40px] max-h-[200px]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isSending) {
                    e.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
              />

              <ChatInputToolbar
                isSending={isSending}
                canSubmit={!!input.trim() || attachments.length > 0}
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
