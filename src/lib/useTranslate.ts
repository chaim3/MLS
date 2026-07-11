import { useLang } from "~/lib/lang-context";
import { t as translate, type Lang } from "~/lib/i18n";

export function useTranslate() {
  const { lang } = useLang();
  const t = (key: string) => translate(key, lang);
  return { t, lang };
}