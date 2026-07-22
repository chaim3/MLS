export const Route = createFileRoute("/blog/$slug")({
  head: (ctx) => {
    const data = ctx.loaderData as any;
    if (!data) return {};
    return {
      meta: [
        { title: (data.content_he || data.title) + " - MLS Israel Blog" },
        { name: "description", content: data.excerpt || "" },
        { property: "og:title", content: data.title + " - MLS Israel" },
        { property: "og:description", content: data.excerpt || "" },
        { property: "og:url", content: "https://mls-israel.ctonew.app/blog/" + (data as any).slug },
      ],
    };
  },
  loader: async ({ params }) => {
    const base = typeof window !== 'undefined' ? '' : 'http://localhost:3000';
    const res = await fetch(`${base}/api/blog?slug=${params.slug}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.post || null;
  },
  component: BlogDetail,
});
function BlogDetail() {
  const { t, lang } = useTranslate();
  const post = Route.useLoaderData() as any;
  if (!post) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50" dir={lang === "he" ? "rtl" : "ltr"}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{t("blog.articleNotFound")}</h1>
          <Link to="/blog" className="mt-4 inline-block text-blue-600 hover:underline">{t("blog.backToBlog")}</Link>
        </div>
      </div>
    );
  }
  const content = lang === "he" ? post.content_he : post.content_en || post.content_he;
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
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={lang === "he" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
          </svg>
          {t("blog.backToBlog")}
        </Link>
        <article className="mt-6">
          <p className="text-sm text-gray-500">{post.published_at}</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {lang === "he" ? (post.title_he || post.title) : (post.title_en || post.title)}
          </h1>
          {(lang === "he" ? (post.excerpt_he || post.excerpt) : (post.excerpt_en || post.excerpt)) && (
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              {lang === "he" ? (post.excerpt_he || post.excerpt) : (post.excerpt_en || post.excerpt)}
            </p>
          )}
          <div className="prose-custom mt-8 rounded-2xl bg-white p-8 shadow-sm">
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </article>
        <div className="mt-10 border-t border-gray-200 pt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <svg className="h-5 w-5" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="14" fill="#2563eb" fillOpacity="0.15"/>
              <path d="M32 16 L48 30 L45 30 L45 46 L37 46 L37 36 L27 36 L27 46 L19 46 L19 30 L16 30 Z" fill="#2563eb"/>
              <rect x="29" y="36" width="6" height="10" fill="#93c5fd" rx="1"/>
            </svg>
            ← {t("site.name")}
          </Link>
        </div>
      </main>
    </div>
  );
}
