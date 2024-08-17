import { create } from "zustand";
import { MainContent } from "../data-objects/enum";

export const useContentStore = create<{
  currentContent: MainContent;
  setCurrentContent: (content: MainContent) => void;
}>((set) => ({
  currentContent: MainContent.PROFILE,
  setCurrentContent: (content: MainContent) => set({ currentContent: content }),
}));
