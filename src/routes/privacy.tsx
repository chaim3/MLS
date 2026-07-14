import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslate } from "~/lib/useTranslate";
import { LangSwitcher } from "~/components/LangSwitcher";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - MLS Israel" },
      { name: "description", content: "MLS Israel privacy policy. Learn how we collect, use, and protect your personal information when you use our platform." },
      { property: "og:title", content: "Privacy Policy - MLS Israel" },
      { property: "og:description", content: "Learn how MLS Israel collects, uses, and protects your personal information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t, lang } = useTranslate();
  const isRtl = lang === "he";

  const he = {
    title: "מדיניות פרטיות",
    updated: "עודכן לאחרונה: יולי 2026",
    intro: "ב-MLS Israel (" + t("site.name") + ") אנחנו מכבדים את פרטיותך ומחויבים להגן על המידע האישי שלך. מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים, חושפים ומגנים על המידע שלך בעת השימוש בפלטפורמה שלנו.",
    sections: [
      {
        title: "איזה מידע אנו אוספים",
        content: "אנו אוספים מידע שאתה מספק לנו ישירות בעת יצירת חשבון, רישום פרויקט, או שליחת פנייה. זה כולל שם, כתובת אימייל, מספר טלפון, שם חברה, ופרטי פרויקט. אנו גם אוספים מידע אוטומטי כמו כתובת IP, סוג דפדפן, ודפים שבהם ביקרת."
      },
      {
        title: "כיצד אנו משתמשים במידע",
        content: "המידע משמש כדי לספק ולתחזק את הפלטפורמה, לתקשר איתך, להתאים תוכן אישי, לשפר את השירות, ולעמוד בדרישות החוק. אנו לא מוכרים מידע אישי לצדדים שלישיים."
      },
      {
        title: "שיתוף מידע",
        content: "אנו עשויים לשתף מידע עם ספקי שירותים המסייעים לנו בהפעלת הפלטפורמה (כגון אחסון, תשלומים, ניתוח נתונים), עם רשויות החוק במידה ויידרש, ועם יזמים וסוכנים כשאתה יוצר קשר באמצעות הפלטפורמה."
      },
      {
        title: "אבטחת מידע",
        content: "אנו נוקטים באמצעי אבטחה סבירים כדי להגן על המידע שלך מפני גישה לא מורשית, שינוי, חשיפה או השמדה. עם זאת, אף שיטת העברה באינטרנט אינה מאובטחת לחלוטין."
      },
      {
        title: "זכויותיך",
        content: "יש לך זכות לעיין, לתקן או למחוק את המידע האישי שלך בכל עת. ניתן לפנות אלינו בכתובת האימייל למטה. אנו נפעל בהתאם לדרישות חוק הגנת הפרטיות."
      },
      {
        title: "עוגיות (Cookies)",
        content: "הפלטפורמה משתמשת בעוגיות כדי לשפר את חוויית המשתמש, לנתח תנועה ולזכור העדפות. ניתן לשלוט בעוגיות דרך הגדרות הדפדפן שלך."
      },
      {
        title: "יצירת קשר",
        content: "לשאלות בנוגע למדיניות פרטיות זו, ניתן לפנות אלינו בכתובת: privacy@mlsisrael.co.il"
      }
    ]
  };

  const en = {
    title: "Privacy Policy",
    updated: "Last updated: July 2026",
    intro: "At MLS Israel (" + t("site.name") + "), we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.",
    sections: [
      {
        title: "Information We Collect",
        content: "We collect information you provide directly when creating an account, listing a project, or submitting an inquiry. This includes name, email address, phone number, company name, and project details. We also automatically collect information such as IP address, browser type, and pages visited."
      },
      {
        title: "How We Use Your Information",
        content: "Your information is used to provide and maintain the platform, communicate with you, personalize content, improve our service, and comply with legal obligations. We do not sell personal information to third parties."
      },
      {
        title: "Information Sharing",
        content: "We may share information with service providers who help us operate the platform (such as hosting, payments, analytics), with law enforcement if required, and with developers/agents when you initiate contact through the platform."
      },
      {
        title: "Data Security",
        content: "We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is completely secure."
      },
      {
        title: "Your Rights",
        content: "You have the right to access, correct, or delete your personal information at any time. Contact us at the email below. We will comply with applicable data protection laws."
      },
      {
        title: "Cookies",
        content: "Our platform uses cookies to enhance user experience, analyze traffic, and remember preferences. You can control cookies through your browser settings."
      },
      {
        title: "Contact Us",
        content: "For questions about this Privacy Policy, please contact us at: privacy@mlsisrael.co.il"
      }
    ]
  };

  const content = isRtl ? he : en;

  return (
    <div className="min-h-dvh bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <svg className="h-6 w-6 text-blue-600" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="14" fill="#2563eb" fillOpacity="0.15"/>
              <path d="M32 16 L48 30 L45 30 L45 46 L37 46 L37 36 L27 36 L27 46 L19 46 L19 30 L16 30 Z" fill="#2563eb"/>
              <rect x="29" y="36" width="6" height="10" fill="#93c5fd" rx="1"/>
            </svg>
            {t("site.name")}
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <LangSwitcher />
            <Link to="/agent/login" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              {t("agent.login")}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRtl ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
          </svg>
          {isRtl ? "חזרה לדף הבית" : "Back to home"}
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{content.updated}</p>
          <p className="mt-6 leading-relaxed text-gray-700">{content.intro}</p>
        </div>

        <div className="mt-10 space-y-8">
          {content.sections.map((section, i) => (
            <section key={i} className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
              <p className="mt-3 leading-relaxed text-gray-600">{section.content}</p>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p className="text-sm text-gray-500">{t("site.name")} © 2026</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-sm text-gray-500 transition hover:text-blue-600">{isRtl ? "פרטיות" : "Privacy"}</Link>
            <Link to="/terms" className="text-sm text-gray-500 transition hover:text-blue-600">{isRtl ? "תנאים" : "Terms"}</Link>
            <Link to="/" className="text-sm text-gray-500 transition hover:text-blue-600">{isRtl ? "דף הבית" : "Home"}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}