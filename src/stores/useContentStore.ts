import { create } from "zustand";
import { MainContent } from "../types/enums";

export const useContentStore = create<{
  currentContent: MainContent;
  setCurrentContent: (content: MainContent) => void;
}>((set) => ({
  currentContent: MainContent.PROFILE,
  setCurrentContent: (content: MainContent) => set({ currentContent: content }),
}));
