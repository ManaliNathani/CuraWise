"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isWorkspace = pathname.startsWith("/user") || pathname.startsWith("/doctor") || pathname.startsWith("/admin");
  if (isWorkspace) return null;

  return (
    <footer className="relative z-10 mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-600 text-white font-bold">CW</div>
            <p className="text-base font-semibold text-slate-900">CuraWise</p>
          </div>
          <p className="mt-4 max-w-md text-sm text-slate-600">
            AI-assisted symptom interview, triage guidance, doctor consultation, and healthcare network coordination.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Platform</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/features" className="hover:text-slate-900">Features</Link>
            <Link href="/login" className="hover:text-slate-900">Login</Link>
            <Link href="/signup" className="hover:text-slate-900">Sign up</Link>
            <Link href="/hospital-register" className="hover:text-slate-900">Hospital Register</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Company</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/about" className="hover:text-slate-900">About</Link>
            <Link href="/contact" className="hover:text-slate-900">Contact</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} CuraWise. All rights reserved.</p>
          <p>For decision support only. Not a final medical diagnosis.</p>
        </div>
      </div>
    </footer>
  );
}
