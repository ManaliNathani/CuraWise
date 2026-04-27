import Link from "next/link";
import React from "react";

export default function FeaturesPage() {
  const features = [
    { title: "Symptom Checker", desc: "AI-driven analysis to understand your initial symptoms securely." },
    { title: "Doctor Consults", desc: "Schedule and hold virtual consultations with verified medical professionals." },
    { title: "Hospital Guidance", desc: "Find the best hospitals tailored to your specific condition and location." },
    { title: "Blockchain Integrity", desc: "Ensure your medical records remain completely immutable and private." },
    { title: "Real-time Metrics", desc: "For administrators, access beautiful dashboards and secure telemetry." },
    { title: "24/7 Availability", desc: "Access the CuraWise platform anytime, anywhere from any device." },
  ];

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 max-w-6xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-accentDeep">
          Platform Features
        </h1>
        <p className="mt-4 text-muted max-w-2xl mx-auto">
          Explore the state-of-the-art capabilities that make CuraWise the top digital health assistant in the industry.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div key={idx} className="card-3d rounded-2xl bg-white/80 p-6 border border-slate-200 backdrop-blur-md transition-all hover:-translate-y-2 cursor-pointer shadow-sm hover:shadow-xl">
            <div className="w-12 h-12 bg-accent/10 rounded-xl mb-4 flex items-center justify-center text-accentDeep font-bold">
              0{idx + 1}
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">{feature.title}</h3>
            <p className="text-muted text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link href="/signup" className="inline-block px-8 py-4 bg-gradient-to-r from-accent to-accentDeep text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
          Get Started Now
        </Link>
      </div>
    </div>
  );
}
