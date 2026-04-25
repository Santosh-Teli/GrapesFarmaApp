// hooks/use-translation.ts
import { useLanguageStore } from "@/store/languageStore";
import { translations } from "@/lib/i18n/translations";

export function useTranslation() {
    const { language } = useLanguageStore();
    return translations[language];
}
