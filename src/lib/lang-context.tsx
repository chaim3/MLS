import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Lang } from "./i18n";
import { getLang, setLang } from "./i18n";

type LangContextType = {
  lang: Lang;
  toggleLang: () => void;
  setLanguage: (l: Lang) => void;
};

const LangContext = createContext<LangContextType>({
  lang: "he",
  toggleLang: () => {},
  setLanguage: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("he");

  useEffect(() => {
    setLangState(getLang());
  }, []);

  const setLanguage = (l: Lang) => {
    setLangState(l);
    setLang(l);
    document.documentElement.dir = l === "he" ? "rtl" : "ltr";
    document.documentElement.lang = l;
  };

  const toggleLang = () => {
    setLanguage(lang === "he" ? "en" : "he");
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang, setLanguage }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}