import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useChatStore } from "@/store/message.store";
import { useFileStore } from "@/store/use-file.store";

export function useInitialMessage(
  chatId: string, 
  isLoading: boolean, 
  sendMessage: (data: any) => Promise<any>
) {
  const searchParams = useSearchParams();
  const hasSentFirstMsg = useRef(false);
  const { pendingFiles, clearPendingFiles } = useFileStore();
  const { setIsSending } = useChatStore();

  useEffect(() => {
    const firstMsg = searchParams.get("firstMsg");
    if (firstMsg && !hasSentFirstMsg.current && !isLoading) {
      hasSentFirstMsg.current = true;
      
      const content = decodeURIComponent(firstMsg);
      const files = [...pendingFiles];

      setIsSending(true);
      sendMessage({ chatId, content, files: files.length > 0 ? files : undefined })
        .finally(() => setIsSending(false));

      clearPendingFiles();
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [chatId, isLoading, sendMessage, searchParams]);
}
