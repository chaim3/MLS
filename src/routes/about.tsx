import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslate } from "~/lib/useTranslate";
import { LangSwitcher } from "~/components/LangSwitcher";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us - MLS Israel | New Construction Discovery Platform" },
      { name: "description", content: "MLS Israel is the leading discovery platform for new construction projects across Israel. Learn about our mission, how we help buyers and agents, and how to get started." },
      { property: "og:title", content: "About MLS Israel - Find New Apartments & Projects" },
      { property: "og:description", content: "Your one-stop platform for discovering new construction projects across Israel. Browse hundreds of developments, connect with agents, and find your dream home." },
      { property: "og:url", content: "https://mls-israel.ctonew.app/about" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t, lang } = useTranslate();
  const isRtl = lang === "he";

  return (
    <div className="min-h-dvh bg-gray-50" dir={isRtl ? "rtl" : "ltr"}>
      {/* Navigation */}
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
            <Link
              to="/blog"
              className="hidden rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 sm:inline-block"
            >
              {t("nav.blog")}
            </Link>
            <Link to="/agent/login" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              {t("agent.login")}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            {isRtl ? "פלטפורמת הגילוי המובילה לפרויקטים חדשים בישראל" : "The Leading Discovery Platform for New Construction in Israel"}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-blue-100">
            {isRtl
              ? "MLS Israel מחברת בין רוכשי דירות לבין היזמים והקבלנים המובילים בישראל. במקום אחד, בזמן אחד."
              : "MLS Israel connects homebuyers with the leading developers and contractors in Israel. One place, one experience."}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isRtl ? "המשימה שלנו" : "Our Mission"}
            </h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              {isRtl
                ? "להפוך את חיפוש הדירה החדשה לפשוט, שקוף ונגיש לכולם. אנחנו מאמינים שכל אדם שמוצא בישראל ראוי לגלות את כל הפרויקטים החדשים שקיימים — בלי צורך בניווט באתרים מבולגנים או בסינון ידני של מודעות ישנות."
                : "To make finding a new apartment simple, transparent, and accessible to everyone. We believe every home seeker in Israel deserves to discover every new project available — without navigating cluttered sites or manually filtering out old listings."}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isRtl ? "החזון שלנו" : "Our Vision"}
            </h2>
            <p className="mt-3 leading-relaxed text-gray-600">
              {isRtl
                ? "ליצור את השוק השקוף והמקיף ביותר בישראל לפרויקטים חדשים — מקום שבו כל פרויקט בנייה, בכל עיר, מופיע עם כל הפרטים הנחוצים לקבלת החלטה מושכלת."
                : "To create the most transparent and comprehensive marketplace in Israel for new projects — a place where every construction project, in every city, appears with all the details needed to make an informed decision."}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {isRtl ? "איך זה עובד" : "How It Works"}
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* For Buyers */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-8">
              <h3 className="flex items-center gap-2 text-xl font-bold text-blue-800">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {isRtl ? "לקונים" : "For Buyers"}
              </h3>
              <ol className={`mt-4 space-y-4 text-gray-700 ${isRtl ? "list-inside [counter-reset:step]" : ""}`}>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">1</span>
                  <span>{isRtl ? "חפשו פרויקטים לפי עיר, טווח מחירים וסוג נכס" : "Browse projects by city, price range, and property type"}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">2</span>
                  <span>{isRtl ? "עיינו בתמונות, תוכניות קומה, טווחי מחירים ותאריכי מסירה" : "Review photos, floor plans, price ranges, and handover dates"}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">3</span>
                  <span>{isRtl ? "שלחו פנייה ישירה לנציג המכירות וקבעו ביקור" : "Submit a direct inquiry and schedule a visit"}</span>
                </li>
              </ol>
            </div>

            {/* For Agents/Developers */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-8">
              <h3 className="flex items-center gap-2 text-xl font-bold text-amber-800">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {isRtl ? "ליזמים וקבלנים" : "For Agents & Developers"}
              </h3>
              <ol className="mt-4 space-y-4 text-gray-700">
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">1</span>
                  <span>{isRtl ? "צרו חשבון חינם והעלו את הפרויקטים שלכם" : "Create a free account and list your projects"}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">2</span>
                  <span>{isRtl ? "קבלו פניות איכותיות מרוכשים פוטנציאליים" : "Receive qualified leads from potential buyers"}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">3</span>
                  <span>{isRtl ? "שדרגו לחבילה מתקדמת לחשיפה נוספת ותכונות פרימיום" : "Upgrade for premium placement and advanced features"}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          {isRtl ? "למה MLS Israel?" : "Why MLS Israel?"}
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 font-bold text-gray-900">
              {isRtl ? "מקיף ואמין" : "Comprehensive & Trusted"}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {isRtl ? "כל הפרויקטים החדשים במקום אחד — ללא מודעות ישנות, ללא בזבוז זמן." : "All new projects in one place — no old listings, no wasted time."}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="mt-4 font-bold text-gray-900">
              {isRtl ? "שקיפות מלאה" : "Full Transparency"}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {isRtl ? "מחירים, תוכניות קומה, תאריכי מסירה — כל הפרטים גלויים מראש." : "Prices, floor plans, handover dates — all details visible upfront."}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="mt-4 font-bold text-gray-900">
              {isRtl ? "קשר ישיר" : "Direct Contact"}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {isRtl ? "פנו ישירות לנציגי המכירות — ללא תיווך, ללא עמלות." : "Contact sales reps directly — no middlemen, no commissions."}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isRtl ? "צרו קשר" : "Get In Touch"}
          </h2>
          <p className="mt-3 text-gray-600">
            {isRtl
              ? "יש לכם שאלות? רוצים להוסיף פרויקט? אנחנו כאן בשבילכם."
              : "Have questions? Want to list a project? We're here to help."}
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="mailto:info@mlsisrael.co.il"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              info@mlsisrael.co.il
            </a>
            <a
              href="/agent/signup"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {isRtl ? "הרשמה כסוכן" : "Register as Agent"}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            {t("site.name")} © 2026 — {t("site.tagline")}
          </p>
          <div className="flex gap-4">
            <Link to="/blog" className="text-sm text-gray-500 transition hover:text-blue-600">{t("nav.blog")}</Link>
            <Link to="/" className="text-sm text-gray-500 transition hover:text-blue-600">
              {isRtl ? "דף הבית" : "Home"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}