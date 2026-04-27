import Link from "next/link";

const openings = [
  {
    title: "Senior Full-Stack Engineer",
    location: "Remote / Mumbai",
    blurb: "Own features across our Next.js frontend, Django APIs, and realtime consult stack."
  },
  {
    title: "Clinical Product Designer",
    location: "Hybrid — Mumbai",
    blurb: "Shape flows for patients and clinicians with accessibility and trust at the center."
  },
  {
    title: "Healthcare Partnerships Lead",
    location: "Mumbai",
    blurb: "Build relationships with hospitals and specialty groups to expand CuraWise coverage."
  }
];

export default function CareersPage() {
  return (
    <div className="relative min-h-screen bg-paper">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-tr from-accent/20 via-pink-100/40 to-transparent" />
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-16 pt-32">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Careers</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink md:text-5xl">Build the future of digital care</h1>
        <p className="mt-4 text-lg text-muted">
          CuraWise is a small, product-focused team. We value ownership, empathy for patients and providers, and
          high-quality engineering. If that resonates, we would love to hear from you.
        </p>

        <div className="card-3d mt-10 rounded-2xl border border-pink-100 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Why join us</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>Meaningful problems at the intersection of AI, care delivery, and trust.</li>
            <li>Modern stack: Next.js, Django, WebSockets, and pragmatic security practices.</li>
            <li>Flexible arrangements for strong remote contributors.</li>
          </ul>
        </div>

        <h2 className="mt-12 text-sm font-semibold uppercase tracking-[0.25em] text-muted">Open roles</h2>
        <div className="mt-4 grid gap-4">
          {openings.map((role) => (
            <div
              key={role.title}
              className="card-3d rounded-2xl border border-pink-100 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{role.title}</h3>
                  <p className="text-xs font-medium uppercase tracking-wider text-accentDeep">{role.location}</p>
                </div>
                <a
                  href="mailto:careers@curawise.example?subject=Application%20-%20"
                  className="shrink-0 rounded-xl bg-accent px-4 py-2 text-center text-sm font-semibold text-white transition-all hover:bg-accentDeep active:scale-95"
                >
                  Apply
                </a>
              </div>
              <p className="mt-3 text-sm text-muted">{role.blurb}</p>
            </div>
          ))}
        </div>

        <div className="card-3d mt-8 rounded-2xl border border-dashed border-pink-200 bg-pink-50/50 p-6 text-center">
          <p className="text-sm text-muted">
            Don&apos;t see a perfect fit? Send your profile and interests to{" "}
            <a href="mailto:careers@curawise.example" className="font-semibold text-accentDeep hover:underline">
              careers@curawise.example
            </a>
            .
          </p>
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          <Link href="/contact" className="font-semibold text-accentDeep hover:underline">
            Contact
          </Link>
          {" · "}
          <Link href="/" className="font-semibold text-accentDeep hover:underline">
            Home
          </Link>
        </p>
      </main>
    </div>
  );
}
