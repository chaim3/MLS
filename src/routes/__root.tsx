import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "~/styles/app.css?url";
import { LangProvider } from "~/lib/lang-context";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "MLS Israel — פרויקטים חדשים בישראל | New Construction Projects" },
      {
        name: "description",
        content:
          "הפלטפורמה המובילה לחיפוש פרויקטי בנייה חדשים בישראל. דירות חדשות, בתים ווילות בפריסייל ובבנייה. | The leading platform for finding new construction projects across Israel.",
      },
      // Open Graph
      { property: "og:title", content: "MLS Israel — New Construction Projects in Israel" },
      { property: "og:description", content: "Browse new apartments, houses, and villas in new developments across Israel. Prices, floor plans, handover dates, and direct agent contact." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mls-israel.ctonew.app" },
      { property: "og:image", content: "https://mls-israel.ctonew.app/og-image.svg" },
      { property: "og:site_name", content: "MLS Israel" },
      { property: "og:locale", content: "he_IL" },
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MLS Israel — New Construction Projects in Israel" },
      { name: "twitter:description", content: "Browse new apartments, houses, and villas in new developments across Israel. Prices, floor plans, handover dates, and direct agent contact." },
      // Canonical
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap",
      },
      // hreflang
      { rel: "alternate", hrefLang: "he", href: "https://mls-israel.ctonew.app" },
      { rel: "alternate", hrefLang: "en", href: "https://mls-israel.ctonew.app" },
      { rel: "canonical", href: "https://mls-israel.ctonew.app" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
    ],
    scripts: [
      ...(process.env.UMAMI_WEBSITE_ID ? [{ defer: true as const, src: "https://cloud.umami.is/script.js", "data-website-id": process.env.UMAMI_WEBSITE_ID }] : []),
    ],
  }),
  notFoundComponent: () => {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-lg text-gray-500">
          הדף לא נמצא | Page not found
        </p>
      </div>
    );
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <LangProvider>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </LangProvider>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html
      dir="rtl"
      lang="he"
      suppressHydrationWarning
      // LangProvider will update these on the client
    >
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var lang = localStorage.getItem('lang') || 'he';
                document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
                document.documentElement.lang = lang;
              })();
            `,
          }}
        />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateListing",
              "name": "MLS Israel",
              "description": "הפלטפורמה המובילה לחיפוש פרויקטי בנייה חדשים בישראל. דירות חדשות, בתים ווילות בפריסייל ובבנייה.",
              "url": "https://mls-israel.ctonew.app",
              "areaServed": { "@type": "Country", "name": "IL" },
              "inLanguage": ["he", "en"],
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://mls-israel.ctonew.app/?city={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
      </head>
      <body className="font-heebo" style={{ fontFamily: "'Heebo','Inter',sans-serif" }}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}