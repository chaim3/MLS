import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslate } from "~/lib/useTranslate";
import { LangSwitcher } from "~/components/LangSwitcher";

export const Route = createFileRoute("/agent/signup")({
  component: SignupPage,
});

function SignupPage() {
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
          <p className="mt-2 text-gray-500">{t("agent.signupTitle")}</p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const password = fd.get("password")?.toString() || "";
            const confirm = fd.get("confirmPassword")?.toString() || "";
            if (password !== confirm) {
              alert(t("agent.errorPasswordMismatch"));
              return;
            }
            const res = await fetch("/api/auth/signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: fd.get("name"),
                email: fd.get("email"),
                password: fd.get("password"),
                company: fd.get("company"),
                phone: fd.get("phone"),
                description: fd.get("description"),
              }),
            });
            const data = await res.json();
            if (data.success) {
              window.location.href = "/agent/dashboard";
            } else {
              alert(data.error || t("agent.errorEmailExists"));
            }
          }}
          className="rounded-2xl bg-white p-8 shadow-sm"
        >
          <div className="space-y-4">
            <input
              name="name"
              placeholder={t("agent.name")}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
            <input
              name="email"
              type="email"
              placeholder={t("agent.email") + " *"}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
            <input
              name="phone"
              type="tel"
              placeholder={t("agent.phone")}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
            <input
              name="company"
              placeholder={t("agent.company")}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
            <textarea
              name="description"
              placeholder={t("agent.description") || "תיאור קצר עליך (אופציונלי)"}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
            <input
              name="password"
              type="password"
              placeholder={t("agent.password") + " *"}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder={t("agent.confirmPassword")}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400">{t("agent.freeTier")}</p>
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              {t("agent.signupBtn")}
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">
            {t("agent.hasAccount")}{" "}
            <Link to="/agent/login" className="text-blue-600 underline">
              {t("agent.loginLink")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}