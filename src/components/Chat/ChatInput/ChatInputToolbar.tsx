"use client";

import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Paperclip } from "lucide-react";
import { ReactNode } from "react";

export function ChatInputToolbar({
  isSending,
  canSubmit,
  onAttachFiles,
  onAttachImages,
  submitIcon,
}: {
  isSending: boolean;
  canSubmit: boolean;
  onAttachFiles: () => void;
  onAttachImages: () => void;
  submitIcon: ReactNode;
}) {
    
  return (
    <div className="flex items-center justify-between w-full pt-1 border-t border-muted/50">
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isSending}
          onClick={onAttachFiles}
          className="h-9 w-9 text-muted-foreground rounded-xl shrink-0 cursor-pointer"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isSending}
          onClick={onAttachImages}
          className="h-9 w-9 text-muted-foreground rounded-xl shrink-0 cursor-pointer"
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
      </div>

      <Button
        type="submit"
        size="icon"
        className="h-9 w-9 rounded-xl transition-all"
        disabled={!canSubmit || isSending}
      >
        {submitIcon}
      </Button>
    </div>
  );
}
