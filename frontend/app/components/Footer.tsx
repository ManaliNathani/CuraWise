"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  // Dashboards have their own RoleShell nav
  const isDashboard = pathname.startsWith("/user") || pathname.startsWith("/doctor") || pathname.startsWith("/admin") || pathname.startsWith("/onboarding");

  if (isDashboard) return null;

  return (
    <footer className="relative z-10 border-t border-pink-100 bg-white pt-16 pb-8">
      <div className="mx-auto max-w-6xl px-6 grid gap-10 md:grid-cols-4 lg:gap-16">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-accent to-accentDeep text-white font-bold shadow-md">CW</div>
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-ink">CuraWise</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            The next generation of digital healthcare. Instantly assess symptoms, find expert doctors, and maintain a secure medical foundation.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-ink">Platform</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li><Link href="/features" className="hover:text-accent transition-colors">Features</Link></li>
            <li><Link href="/doctors" className="hover:text-accent transition-colors">Find Doctors</Link></li>
            <li><Link href="/service" className="hover:text-accent transition-colors">Services</Link></li>
            <li><Link href="/login" className="hover:text-accent transition-colors">Login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-ink">Company</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
            <li><Link href="/blog" className="hover:text-accent transition-colors">Blog</Link></li>
            <li><Link href="/careers" className="hover:text-accent transition-colors">Careers</Link></li>
            <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-ink">Connect</h3>
          <p className="mt-4 text-sm text-muted mb-4">Subscribe to our newsletter for health tips and updates.</p>
          <div className="flex bg-pink-50/80 p-1 rounded-xl border border-pink-100 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
            <input type="email" placeholder="Email address" className="bg-transparent px-3 py-2 text-sm outline-none w-full text-ink" />
            <button className="bg-accent text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-accentDeep transition-colors">Join</button>
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-6xl px-6 mt-16 pt-8 border-t border-pink-100 flex flex-col items-center justify-between gap-4 md:flex-row text-sm text-muted">
        <p>© {new Date().getFullYear()} CuraWise. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-ink transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
