import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslate } from "~/lib/useTranslate";
import { LangSwitcher } from "~/components/LangSwitcher";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { t } = useTranslate();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Link to="/" className="text-2xl font-bold text-white">
              {t("site.name")} <span className="text-amber-400">Admin</span>
            </Link>
            <LangSwitcher />
          </div>
          <p className="mt-2 text-gray-400">Admin Panel</p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const res = await fetch("/api/admin/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
            });
            const data = await res.json();
            if (data.success) {
              window.location.href = "/admin/dashboard";
            } else {
              alert(data.error || "Login failed");
            }
          }}
          className="rounded-2xl bg-gray-800 p-8 shadow-xl border border-gray-700"
        >
          <div className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Admin Email"
              defaultValue="admin@example.com"
              required
              className="w-full rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-amber-500 px-6 py-3 font-bold text-gray-900 transition hover:bg-amber-400"
            >
              Admin Login
            </button>
          </div>
          <p className="mt-4 text-center text-xs text-gray-500">
            Use: chaim@bienenfeld.org / admin123
          </p>
        </form>
      </div>
    </div>
  );
}