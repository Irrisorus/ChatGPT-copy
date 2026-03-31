import { create } from 'zustand';

interface FileState {
  pendingFiles: File[];
  setPendingFiles: (files: File[]) => void;
  clearPendingFiles: () => void;
}

export const useFileStore = create<FileState>((set) => ({
  pendingFiles: [],
  setPendingFiles: (files) => set({ pendingFiles: files }),
  clearPendingFiles: () => set({ pendingFiles: [] }),
}));
