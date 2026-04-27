"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/user", label: "User" },
  { href: "/doctor", label: "Doctor" },
  { href: "/admin", label: "Admin" }
];

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Sign up" },
  { href: "/onboarding", label: "Onboarding" }
];

export default function RoleShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <header className="border-b border-pink-100/80 bg-white/70 backdrop-blur-md sticky top-0 z-50 shadow-sm shadow-pink-100/30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-white font-semibold">CW</div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted">CuraWise</p>
              <p className="text-xs text-muted">{subtitle}</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1 transition-all active:scale-95 ${
                  pathname === item.href
                    ? "bg-accent/15 text-accentDeep shadow-sm"
                    : "hover:text-ink hover:bg-pink-50/80"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link className="hidden md:block rounded-xl border border-pink-100 px-4 py-2 text-sm font-semibold text-ink transition-all hover:bg-pink-50/80 hover:shadow-md active:scale-[0.98]" href="/">
              Home
            </Link>
            <Link className="hidden md:block rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-accentDeep hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]" href="/login">
              Switch role
            </Link>
            <button
              className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[220px_1fr]">
        <aside className={`${isMobileMenuOpen ? "block mb-6" : "hidden"} lg:block`}>
          <div className="dashboard-tile card-3d rounded-2xl border border-pink-100/80 bg-white/85 backdrop-blur-sm p-4 shadow-sm transition-all duration-300">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Navigation</p>
            <div className="mt-4 grid gap-2 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 transition ${
                    pathname === item.href
                      ? "bg-accent text-white shadow-md shadow-pink-200/40"
                      : "bg-pink-50/60 text-ink hover:bg-pink-100/80 active:scale-[0.98]"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label} dashboard
                </Link>
              ))}
              <Link
                href="/onboarding"
                className={`rounded-xl px-3 py-2 transition ${
                  pathname === "/onboarding"
                    ? "bg-accent text-white shadow-md shadow-pink-200/40"
                    : "bg-pink-50/60 text-ink hover:bg-pink-100/80 active:scale-[0.98]"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile settings
              </Link>
              <div className="mt-4 border-t border-slate-100 pt-4 md:hidden">
                <Link className="mb-2 block w-full rounded-xl border border-slate-200 px-4 py-2 text-center font-semibold text-ink" href="/">
                  Home
                </Link>
                <Link className="block w-full rounded-xl bg-accent px-4 py-2 text-center font-semibold text-white" href="/login">
                  Switch role
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <main className="dashboard-stage min-h-[40vh]">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          </div>
          {children}
        </main>
      </div>

      <footer className="border-t border-pink-100/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-muted md:flex-row">
          <span>© {new Date().getFullYear()} CuraWise. All rights reserved.</span>
          <div className="flex items-center gap-4">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg px-1 transition-colors hover:text-accentDeep hover:underline active:opacity-80">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
