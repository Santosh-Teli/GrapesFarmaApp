// store/languageStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "kn" | "hi";

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: "en",
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: "grapes-farm-language",
        }
    )
);
