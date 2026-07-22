import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useTranslate } from "~/lib/useTranslate";
import { LangSwitcher } from "~/components/LangSwitcher";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  title_he: string;
  title_en: string;
  excerpt: string;
  excerpt_he: string;
  excerpt_en: string;
  image_url: string;
  published_at: string;
  created_at: string;
};

const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { getDbAsync } = await import("~/lib/db");
  const db = await getDbAsync();
  const posts = db
    .prepare("SELECT id, slug, title, title_he, title_en, excerpt, excerpt_he, excerpt_en, image_url, published_at, created_at FROM blog_posts WHERE published_at IS NOT NULL ORDER BY published_at DESC")
    .all() as BlogPost[];
  return posts;
});
export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog - MLS Israel | Real Estate Guides & News" },
      { name: "description", content: "Read our latest guides about buying property in Israel, new construction projects, and real estate investment tips." },
      { property: "og:title", content: "Blog - MLS Israel" },
      { property: "og:description", content: "Real estate guides, news, and tips for buying new construction in Israel." },
    ],
  }),
  loader: () => getPosts(),
  component: BlogIndex,
});
function BlogIndex() {
  const { t, lang } = useTranslate();
  const posts = Route.useLoaderData();
  return (
    <div className="min-h-dvh bg-gray-50" dir={lang === "he" ? "rtl" : "ltr"}>
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
          <nav className="flex items-center gap-3">
            <LangSwitcher />
            <Link to="/agent/login" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
              {t("agent.login")}
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900">{t("blog.title")}</h1>
        <p className="mt-2 text-lg text-gray-600">{t("blog.subtitle")}</p>
        <div className="mt-10 space-y-8">
          {posts.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center text-gray-400">
              {t("blog.noArticles")}
            </div>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                to={"/blog/" + post.slug}
                className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row">
                  {post.image_url ? (
                    <div className="h-48 w-full shrink-0 sm:h-auto sm:w-56">
                      <img src={post.image_url} alt={lang === "he" ? (post.title_he || post.title) : (post.title_en || post.title)} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-48 w-full shrink-0 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 sm:h-auto sm:w-56">
                      <svg className="h-12 w-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-center p-6">
                    <p className="text-sm text-gray-500">{post.published_at}</p>
                    <h2 className="mt-1 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {lang === "he" ? (post.title_he || post.title) : (post.title_en || post.title)}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-3">
                      {lang === "he" ? (post.excerpt_he || post.excerpt) : (post.excerpt_en || post.excerpt)}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600">
                      {t("blog.readMore")}
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lang === "he" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
