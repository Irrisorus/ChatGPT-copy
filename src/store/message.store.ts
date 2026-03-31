import { create } from 'zustand';

interface ChatStore {
  isSending: boolean;
  setIsSending: (val: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isSending: false,
  setIsSending: (val) => set({ isSending: val })
}));
