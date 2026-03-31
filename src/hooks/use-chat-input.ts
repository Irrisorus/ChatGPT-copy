"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMessages } from "@/hooks/use-messages";
import { useChats } from "@/hooks/use-chats";

type FileAttachment = {
    file: File;
    previewUrl: string;
};

export function useChatInput() {
    const router = useRouter();
    const { id: chatId } = useParams() as { id?: string };
    const { createChat, isCreating } = useChats();
    const { sendMessage, isSending } = useMessages(chatId || "");

    const [input, setInput] = useState("");
    const [attachments, setAttachments] = useState<FileAttachment[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const clear = () => {
        attachments.forEach((att) => {
            if (att.previewUrl) URL.revokeObjectURL(att.previewUrl);
        });
        setAttachments([]);
        setInput("");
    };

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
            if (newAtts[index].previewUrl) URL.revokeObjectURL(newAtts[index].previewUrl);
            newAtts.splice(index, 1);
            return newAtts;
        });
    };

    useEffect(() => {
        const handleGlobalDrop = (e: any) => {
            if (e.detail) processFiles(e.detail);
        };
        window.addEventListener("global-file-drop", handleGlobalDrop);
        return () => window.removeEventListener("global-file-drop", handleGlobalDrop);
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        const isActiveSending = isSending || isCreating;
        if ((!input.trim() && attachments.length === 0) || isActiveSending) return;

        const filesToSend = attachments.map((att) => att.file);
        const currentInput = input;

        if (!chatId) {
            createChat(currentInput.slice(0, 40), {
                onSuccess: (newChat) => {
                    clear();
                    router.push(`/chats/chat/${newChat.id}?firstMsg=${encodeURIComponent(currentInput)}`);
                },
            });
        } else {
            clear();
            await sendMessage({
                chatId,
                content: currentInput,
                files: filesToSend,
            });
        }
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
        handleSubmit,
        isDisabled: isSending || isCreating,
        isSending,
    };
}
