import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-paper">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-accentBlue/25 via-accent/15 to-transparent" />
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-16 pt-32">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Contact</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink md:text-5xl">We&apos;re here to help</h1>
        <p className="mt-4 text-lg text-muted">
          Questions about partnerships, product demos, or support? Reach out through any channel below. We aim to respond
          within two business days.
        </p>

        <div className="card-3d mt-10 grid gap-6 rounded-2xl border border-pink-100 bg-white p-8 shadow-sm md:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Email</h2>
            <a
              href="mailto:hello@curawise.example"
              className="mt-2 block text-lg font-semibold text-accentDeep transition-colors hover:text-accent"
            >
              hello@curawise.example
            </a>
            <p className="mt-2 text-xs text-muted">Replace with your production inbox when you go live.</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Phone</h2>
            <p className="mt-2 text-lg font-semibold text-ink">+91 90000 00000</p>
            <p className="mt-2 text-xs text-muted">Mon–Fri, 9:00–18:00 IST</p>
          </div>
          <div className="md:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Office</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              CuraWise Health Technologies
              <br />
              24 Health Avenue, Bandra West
              <br />
              Mumbai, Maharashtra 400050
              <br />
              India
            </p>
          </div>
        </div>

        <div className="card-3d mt-6 rounded-2xl border border-pink-100 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Media &amp; partnerships</h2>
          <p className="mt-3 text-sm text-muted">
            For press, hospital integrations, or research collaborations, email{" "}
            <a href="mailto:partners@curawise.example" className="font-semibold text-accentDeep hover:underline">
              partners@curawise.example
            </a>
            .
          </p>
        </div>

        <p className="mt-10 text-center text-sm text-muted">
          <Link href="/about" className="font-semibold text-accentDeep hover:underline">
            About us
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
