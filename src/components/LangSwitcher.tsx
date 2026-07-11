import { useLang } from "~/lib/lang-context";

export function LangSwitcher() {
  const { lang, toggleLang } = useLang();
  return (
    <button
      onClick={toggleLang}
      className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
      title={lang === "he" ? "Switch to English" : "החלף לעברית"}
    >
      {lang === "he" ? "EN" : "עב"}
    </button>
  );
}