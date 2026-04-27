import Link from "next/link";
import React from "react";

export default function ServicePage() {
  return (
    <div className="min-h-screen pt-32 pb-16 px-6 max-w-4xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4">
          CuraWise <span className="text-accent">Services</span>
        </h1>
        <p className="text-muted text-lg">
          Comprehensive digital healthcare from the comfort of your home.
        </p>
      </div>

      <div className="grid gap-10">
        <div className="card-3d rounded-2xl bg-white p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3 aspect-square bg-slate-100 rounded-2xl animate-pulse"></div>
          <div className="w-full md:w-2/3">
            <h2 className="text-2xl font-bold text-ink mb-3">Enterprise Healthcare Integration</h2>
            <p className="text-muted leading-relaxed mb-4">
              We offer API integrations for hospitals looking to streamline patient intake and symptom checking through our AI systems. Secure, fast, and remarkably robust.
            </p>
            <Link href="/contact" className="text-accent font-bold hover:underline">Learn more &rarr;</Link>
          </div>
        </div>

        <div className="card-3d rounded-2xl bg-white p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row-reverse gap-8 items-center">
          <div className="w-full md:w-1/3 aspect-square bg-slate-100 rounded-2xl animate-pulse"></div>
          <div className="w-full md:w-2/3">
            <h2 className="text-2xl font-bold text-ink mb-3">Premium Video Consultations</h2>
            <p className="text-muted leading-relaxed mb-4">
              Get an upgrade on your standard membership to enable end-to-end encrypted high-definition video calls with top tier medical professionals worldwide.
            </p>
            <Link href="/signup" className="text-accent font-bold hover:underline">Upgrade plan &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
