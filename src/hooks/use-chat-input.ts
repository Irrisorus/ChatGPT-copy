"use client";

import { useEffect, useRef, useState } from "react";

type FileAttachment = {
    file: File;
    previewUrl: string;
};

export function useChatInput() {
    const [input, setInput] = useState("");
    const [attachments, setAttachments] = useState<FileAttachment[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const processFiles = (newFiles: File[]) => {
        const newAttachments = newFiles.map((file) => ({
            file,
            previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
        }));

        setAttachments((prev) => [...prev, ...newAttachments]);
    };

    const removeFile = (index: number) => {
        setAttachments((prev) => {
            const newAtts = [...prev];

            const removed = newAtts[index];
            if (removed.previewUrl) {
                URL.revokeObjectURL(removed.previewUrl);
            }

            newAtts.splice(index, 1);
            return newAtts;
        });
    };
    const clear = () => {
        attachments.forEach((att) => {
            if (att.previewUrl) URL.revokeObjectURL(att.previewUrl);
        });

        setAttachments([]);
        setInput("");
    };

    return {
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
    };
}
