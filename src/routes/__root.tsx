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
      { title: "MLS Israel — פרויקטים חדשים בישראל" },
      {
        name: "description",
        content:
          "הפלטפורמה המובילה לחיפוש פרויקטי בנייה חדשים בישראל. דירות חדשות, בתים ווילות בפריסייל ובבנייה.",
      },
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
      </head>
      <body className="font-heebo" style={{ fontFamily: "'Heebo','Inter',sans-serif" }}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}