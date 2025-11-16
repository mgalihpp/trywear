import { create } from "zustand";
import type { Attachment } from "@/types/index";

interface UploadStore {
  attachments: Attachment[];
  uploadProgress: number;
  isUploading: boolean;
  setAttachments: (
    updater: Attachment[] | ((prev: Attachment[]) => Attachment[]),
  ) => void;
  setUploadProgress: (progress: number) => void;
  addAttachments: (files: Attachment[]) => void;
  removeAttachmentByName: (fileName: string) => void;
  resetAttachments: () => void;
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  attachments: [],
  uploadProgress: 0,
  isUploading: false,

  setAttachments: (updater) =>
    set((state) => ({
      attachments:
        typeof updater === "function" ? updater(state.attachments) : updater,
    })),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  addAttachments: (files) =>
    set({ attachments: [...get().attachments, ...files] }),
  removeAttachmentByName: (fileName) =>
    set({
      attachments: get().attachments.filter((a) => a.file.name !== fileName),
    }),
  resetAttachments: () =>
    set({
      attachments: [],
      uploadProgress: 0,
      isUploading: false,
    }),
}));
