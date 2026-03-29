"use client";

import { FileText, X } from "lucide-react";

type FileAttachment = {
  file: File;
  previewUrl: string;
};

export function AttachmentList({
  attachments,
  onRemove,
}: {
  attachments: FileAttachment[];
  onRemove: (index: number) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 pt-2">
      {attachments.map((att, index) => (
        <div
          key={`${att.file.name}-${index}`}
          className="relative group flex items-center bg-background border rounded-lg p-2 min-w-[120px] max-w-[200px]"
        >
          {att.previewUrl ? (
            <img
              src={att.previewUrl}
              alt="preview"
              className="h-10 w-10 object-cover rounded-md mr-2 shrink-0"
            />
          ) : (
            <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center mr-2 shrink-0">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          )}

          <span className="text-xs truncate font-medium pr-4">{att.file.name}</span>

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5 shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
