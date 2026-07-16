import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslate } from "~/lib/useTranslate";
import { LangSwitcher } from "~/components/LangSwitcher";
import { useState } from "react";
export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});
function AdminLoginPage() {
  const { t } = useTranslate();
  const [error, setError] = useState("");
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
          <p className="mt-2 text-gray-400">{t("admin.ownerPanel")}</p>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            const fd = new FormData(e.currentTarget);
            const res = await fetch("/api/admin/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password: fd.get("password") }),
            });
            const data = await res.json();
            if (data.success) {
              window.location.href = "/admin/dashboard";
            } else {
              setError(data.error || t("admin.loginFailed"));
            }
          }}
          className="rounded-2xl bg-gray-800 p-8 shadow-xl border border-gray-700"
        >
          <div className="space-y-4">
            <input
              name="password"
              type="password"
              placeholder="Admin Password"
              autoFocus
              required
              className="w-full rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-amber-500 px-6 py-3 font-bold text-gray-900 transition hover:bg-amber-400"
            >
              Admin Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}