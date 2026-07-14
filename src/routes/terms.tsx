import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslate } from "~/lib/useTranslate";
import { LangSwitcher } from "~/components/LangSwitcher";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service - MLS Israel" },
      { name: "description", content: "MLS Israel terms of service. Understand the terms and conditions for using our platform to find new construction projects in Israel." },
      { property: "og:title", content: "Terms of Service - MLS Israel" },
      { property: "og:description", content: "Read the terms and conditions for using MLS Israel's platform for new construction discovery." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t, lang } = useTranslate();
  const isRtl = lang === "he";

  const he = {
    title: "תנאי שימוש",
    updated: "עודכן לאחרונה: יולי 2026",
    intro: "ברוכים הבאים ל-MLS Israel. תנאי שימוש אלה מסדירים את השימוש שלך בפלטפורמת גילוי הפרויקטים החדשים שלנו. על ידי שימוש בפלטפורמה, אתה מסכים לתנאים אלה.",
    sections: [
      {
        title: "תיאור השירות",
        content: "MLS Israel היא פלטפורמה המאפשרת למשתמשים לחפש פרויקטים חדשים של בנייה בישראל, ולאנשי מכירות ויזמים לרשום פרויקטים. הפלטפורמה משמשת כחלון ראווה ואינה צד לעסקאות בין קונים למוכרים.",
      },
      {
        title: "חשבונות משתמש",
        content: "ליצירת חשבון, עליך לספק מידע מדויק ומעודכן. אתה אחראי לשמירת סודיות פרטי ההתחברות שלך. אנו שומרים לעצמנו את הזכות להשעות או לבטל חשבונות המפרים תנאים אלה.",
      },
      {
        title: "ליסינג פרויקטים",
        content: "יזמים ואנשי מכירות רשאים לרשום פרויקטים בפלטפורמה. עליך להבטיח שכל המידע שתספק לגבי פרויקטים הוא מדויק, עדכני ואינו מטעה. MLS Israel אינה מאשרת או מתחייבת לדיוק המידע שמסופק על ידי המשתמשים.",
      },
      {
        title: "קניין רוחני",
        content: "התכנים, העיצוב, הלוגו וסימני המסחר בפלטפורמה הם רכושה של MLS Israel. אין להעתיק, להפיץ או להשתמש בהם ללא אישור מראש ובכתב.",
      },
      {
        title: "הגבלת אחריות",
        content: "MLS Israel אינה אחראית לכל נזק ישיר, עקיף או תוצאתי הנובע משימוש בפלטפורמה. הפלטפורמה מסופקת 'כפי שהיא' ('AS-IS'), ללא אחריות מכל סוג שהוא.",
      },
      {
        title: "שימוש הוגן",
        content: "משתמשים מתחייבים שלא להשתמש בפלטפורמה למטרות בלתי חוקיות, להציק למשתמשים אחרים, לשלוח דואר זבל, או להפר כל חוק ישראלי וחוקי הגנת הפרטיות.",
      },
      {
        title: "שינויים בתנאים",
        content: "אנו שומרים לעצמנו את הזכות לשנות תנאים אלה בכל עת. שינויים ייכנסו לתוקף עם פרסומם בפלטפורמה. המשך השימוש בפלטפורמה לאחר שינויים מהווה הסכמה לתנאים המעודכנים.",
      },
      {
        title: "יצירת קשר",
        content: "לשאלות בנוגע לתנאי שימוש אלה, ניתן לפנות אלינו בכתובת: legal@mlsisrael.co.il",
      },
    ],
  };

  const en = {
    title: "Terms of Service",
    updated: "Last updated: July 2026",
    intro: "Welcome to MLS Israel. These Terms of Service govern your use of our new construction discovery platform. By using the platform, you agree to these terms.",
    sections: [
      {
        title: "Description of Service",
        content: "MLS Israel is a platform that allows users to search for new construction projects in Israel, and allows agents and developers to list projects. The platform serves as a discovery showcase and is not a party to transactions between buyers and sellers.",
      },
      {
        title: "User Accounts",
        content: "To create an account, you must provide accurate and current information. You are responsible for maintaining the confidentiality of your login credentials. We reserve the right to suspend or terminate accounts that violate these terms.",
      },
      {
        title: "Project Listings",
        content: "Agents and developers may list projects on the platform. You must ensure all project information provided is accurate, current, and not misleading. MLS Israel does not endorse or guarantee the accuracy of user-provided information.",
      },
      {
        title: "Intellectual Property",
        content: "The content, design, logo, and trademarks on the platform are the property of MLS Israel. They may not be copied, distributed, or used without prior written permission.",
      },
      {
        title: "Limitation of Liability",
        content: "MLS Israel is not liable for any direct, indirect, or consequential damages arising from the use of the platform. The platform is provided 'AS-IS' without any warranty of any kind.",
      },
      {
        title: "Acceptable Use",
        content: "Users agree not to use the platform for unlawful purposes, harass other users, send spam, or violate any Israeli laws and privacy regulations.",
      },
      {
        title: "Changes to Terms",
        content: "We reserve the right to modify these terms at any time. Changes take effect when posted on the platform. Continued use after changes constitutes acceptance of the updated terms.",
      },
      {
        title: "Contact Us",
        content: "For questions about these Terms of Service, please contact us at: legal@mlsisrael.co.il",
      },
    ],
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