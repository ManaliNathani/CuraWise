"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "./lib/api";

interface Doctor {
  id: number;
  user: { first_name: string; last_name: string; username: string };
  specialty: string;
  hospital?: { name: string; city: string } | null;
}

interface Hospital {
  id: number;
  name: string;
  city: string;
  address: string;
}

export default function Home() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    apiGet<Doctor[]>("/doctors/")
      .then(setDoctors)
      .catch(() => setDoctors([]));
    apiGet<Hospital[]>("/hospitals/")
      .then(setHospitals)
      .catch(() => setHospitals([]));
  }, []);

  return (
    <div className="relative min-h-screen bg-paper">
      <div className="absolute inset-x-0 -top-10 h-64 bg-gradient-to-r from-accent/15 via-accentBlue/10 to-transparent" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-32">
        <section className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted">AI-Based Care</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
              Symptom checker, hospital guidance, and real-time doctor consults.
            </h1>
            <p className="mt-4 text-lg text-muted">
              CuraWise helps patients triage symptoms, find the right hospital, and consult doctors
              with secure, blockchain-backed record integrity.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-accentDeep hover:scale-105 active:scale-95 shadow-md" href="/signup">
                Get started
              </Link>
              <Link className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-ink transition-all duration-200 hover:bg-slate-50 hover:scale-105 active:scale-95 shadow-sm" href="/login">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg">
            <p className="text-sm uppercase tracking-[0.35em] text-muted">Trusted care network</p>
            <h2 className="mt-4 text-3xl font-semibold text-ink">Verified doctors and hospitals ready to help.</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-pink-100 bg-pink-50 p-5 text-center">
                <p className="text-4xl font-semibold text-accentDeep">{doctors.length || "--"}</p>
                <p className="mt-2 text-sm text-muted">Verified doctors</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
                <p className="text-4xl font-semibold text-ink">{hospitals.length || "--"}</p>
                <p className="mt-2 text-sm text-muted">Network hospitals</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-lg">
            <p className="text-sm uppercase tracking-[0.35em] text-muted">Explore care options</p>
            <h2 className="mt-4 text-3xl font-semibold text-ink">Find the right support for your symptoms.</h2>
            <div className="mt-6 space-y-4">
              {doctors.slice(0, 3).map((doctor) => (
                <div key={doctor.id} className="rounded-2xl border border-pink-100 bg-pink-50 p-4">
                  <p className="font-semibold text-ink">Dr. {doctor.user.first_name || doctor.user.username}</p>
                  <p className="text-sm text-muted">{doctor.specialty}</p>
                  {doctor.hospital ? <p className="text-xs text-muted">{doctor.hospital.name}, {doctor.hospital.city}</p> : null}
                </div>
              ))}
              {hospitals.slice(0, 3).map((hospital) => (
                <div key={hospital.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="font-semibold text-ink">{hospital.name}</p>
                  <p className="text-sm text-muted">{hospital.city}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
