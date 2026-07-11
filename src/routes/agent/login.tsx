import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslate } from "~/lib/useTranslate";
import { LangSwitcher } from "~/components/LangSwitcher";

export const Route = createFileRoute("/agent/login")({
  component: LoginPage,
});

function LoginPage() {
  const { t } = useTranslate();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Link to="/" className="text-2xl font-bold text-blue-700">
              {t("site.name")}
            </Link>
            <LangSwitcher />
          </div>
          <p className="mt-2 text-gray-500">{t("agent.loginTitle")}</p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const res = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: fd.get("email"),
                password: fd.get("password"),
              }),
            });
            const data = await res.json();
            if (data.success) {
              window.location.href = "/agent/dashboard";
            } else {
              alert(data.error || t("agent.errorInvalid"));
            }
          }}
          className="rounded-2xl bg-white p-8 shadow-sm"
        >
          <div className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder={t("agent.email")}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
            <input
              name="password"
              type="password"
              placeholder={t("agent.password")}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              {t("agent.loginBtn")}
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">
            {t("agent.noAccount")}{" "}
            <Link to="/agent/signup" className="text-blue-600 underline">
              {t("agent.signupLink")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}