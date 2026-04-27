"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dashboards have their own RoleShell nav
  const isDashboard = pathname.startsWith("/user") || pathname.startsWith("/doctor") || pathname.startsWith("/admin") || pathname.startsWith("/onboarding");

  if (isDashboard) return null;

  const links = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/doctors", label: "Doctors" },
    { href: "/service", label: "Service" },
    { href: "/blog", label: "Blog" }
  ];

  return (
    <header className="fixed z-50 w-full border-b border-pink-100/90 bg-white/85 backdrop-blur-md top-0 shadow-sm shadow-pink-100/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3 group">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-accent to-accentDeep text-white font-bold shadow-md transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300">CW</div>
          <Link href="/" className="flex flex-col">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-ink transition-colors group-hover:text-accentDeep">CuraWise</span>
            <span className="text-xs text-muted font-medium">Digital Health</span>
          </Link>
        </div>
        
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(link => (
            <Link key={link.label} href={link.href} className="text-sm font-semibold text-muted transition-colors hover:text-accentDeep relative after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-accent after:-bottom-1 after:left-0 after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-300">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block text-sm font-semibold text-ink transition-colors hover:text-accentDeep">
            Log in
          </Link>
          <Link className="hidden md:flex rounded-xl bg-gradient-to-r from-accent to-accentDeep px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0" href="/signup">
            Get Started
          </Link>
          <button
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-ink md:hidden transition-colors hover:bg-slate-200 active:scale-95"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title="Menu"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "max-h-96 opacity-100 border-t border-slate-200" : "max-h-0 opacity-0"}`}>
        <div className="bg-white/95 px-6 py-4 backdrop-blur">
          <nav className="flex flex-col gap-4 text-sm font-semibold text-ink">
            {links.map(link => (
              <Link key={link.label} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent transition-colors py-2">
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-3">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center transition-colors hover:bg-slate-100">
                Log in
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full rounded-xl bg-accent px-4 py-3 text-center text-white shadow-sm transition-colors hover:bg-accentDeep">
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
