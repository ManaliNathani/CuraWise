import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-paper">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-accent/20 via-accentBlue/15 to-transparent" />
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-16 pt-32">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Company</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink md:text-5xl">About CuraWise</h1>
        <p className="mt-4 text-lg text-muted">
          We build thoughtful tools that help people understand symptoms, find the right care, and stay connected with
          clinicians—without replacing real medical judgment.
        </p>

        <div className="card-3d mt-10 rounded-2xl border border-pink-100 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Our mission</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            CuraWise combines guided symptom assessment, hospital and specialist discovery, and secure consultation
            workflows so patients move from worry to a clear next step faster. We work with providers and health systems
            to keep data handling transparent and aligned with clinical standards.
          </p>
        </div>

        <div className="card-3d mt-6 rounded-2xl border border-pink-100 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">What we believe</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex gap-2">
              <span className="font-semibold text-accent">•</span>
              <span>Technology should reduce friction in care, not add noise or false certainty.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-accent">•</span>
              <span>Patients deserve plain-language explanations and easy paths to human experts.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-accent">•</span>
              <span>Trust is earned through security, clarity, and respect for privacy.</span>
            </li>
          </ul>
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          <Link href="/contact" className="font-semibold text-accentDeep hover:underline">
            Get in touch
          </Link>{" "}
          or{" "}
          <Link href="/" className="font-semibold text-accentDeep hover:underline">
            return home
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
