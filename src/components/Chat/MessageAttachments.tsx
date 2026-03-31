"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ExternalLink, FileText } from "lucide-react";
import { Message, MessageRole } from "@/types";

type Attachment = NonNullable<Message["message_attachments"]>[number];

interface Props {
  attachments: Attachment[];
  role: MessageRole;
}

function MessageAttachments({ attachments, role }: Props) {
  if (!attachments?.length) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 mb-1",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {attachments.map((file) => {
        const isImage = file.file_type?.startsWith("image/");

        if (isImage) {
          return (
            <a
              key={file.id}
              href={file.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group overflow-hidden rounded-xl border border-white/20 bg-black/5 w-full max-w-[220px] aspect-[4/3]"
            >
              <img
                src={file.file_url}
                alt={file.file_name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-300 group-hove  r:scale-[1.03] min-h-[200px]"
              />

              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ExternalLink className="size-5 text-white" />
              </div>
            </a>
          );
        }

        return (
          <a
            key={file.id}
            href={file.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 p-2.5 rounded-xl border transition-colors w-full max-w-[320px]",
              role === "user"
                ? "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                : "bg-background border-border hover:bg-muted"
            )}
          >
            <FileText className="size-4 shrink-0" />

            <span className="truncate max-w-[120px] text-xs font-medium">
              {file.file_name}
            </span>
          </a>
        );
      })}
    </div>
  );
}

export default React.memo(MessageAttachments);
