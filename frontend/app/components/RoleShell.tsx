"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { apiPost } from "../lib/api";

type RoleType = "user" | "doctor" | "admin";

const roleNav: Record<RoleType, { href: string; label: string }[]> = {
  user: [
    { href: "/user", label: "Symptom Interview" },
    { href: "/onboarding", label: "Profile Settings" },
  ],
  doctor: [
    { href: "/doctor", label: "Patient Queue" },
    { href: "/onboarding", label: "Profile Settings" },
  ],
  admin: [
    { href: "/admin", label: "Operations Overview" },
    { href: "/admin#approvals", label: "Doctor Approvals" },
    { href: "/admin#hospital-approvals", label: "Hospital Approvals" },
  ],
};

export default function RoleShell({
  title,
  subtitle,
  role,
  children,
}: {
  title: string;
  subtitle: string;
  role: RoleType;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = roleNav[role];
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href: string) => {
    if (href === pathname) return true;
    if (href.includes("#")) return href.split("#")[0] === pathname;
    return false;
  };

  const doLogout = async () => {
    setLoggingOut(true);
    try {
      await apiPost("/auth/logout/", {});
    } catch {
      // no-op
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-600 text-white font-semibold">CW</div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">CuraWise</p>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={doLogout}
            disabled={loggingOut}
            className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 md:block disabled:opacity-60"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[260px_1fr]">
        <aside className={`${isMobileMenuOpen ? "block mb-6" : "hidden"} lg:block`}>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Workspace</p>
            <div className="mt-4 grid gap-2 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 transition ${
                    isActive(item.href)
                      ? "bg-cyan-600 text-white shadow-md"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={doLogout}
                disabled={loggingOut}
                className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700 disabled:opacity-60"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </aside>

        <main className="dashboard-stage min-h-[40vh]">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
