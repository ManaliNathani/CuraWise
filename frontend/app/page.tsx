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
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="hero-glow hero-glow-a" />
      <div className="hero-glow hero-glow-b" />

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-32">
        <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="reveal-up">
            <p className="inline-flex rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
              Doctor-led Symptom Triage
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-slate-900 md:text-6xl">
              Check symptoms clearly. Understand urgency. Plan next medical step.
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-600 md:text-lg">
              CuraWise runs a guided health interview, estimates likely conditions, and recommends doctors and hospitals based on urgency and specialty.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="rounded-xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-700" href="/signup">
                Start Interview
              </Link>
              <Link className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100" href="/login">
                Open Workspace
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-5 text-sm text-slate-600">
              <span>Adaptive question flow</span>
              <span>Urgency-based triage</span>
              <span>Doctor/hospital matching</span>
            </div>
          </div>

          <div className="reveal-up delay-1 rounded-3xl border border-cyan-100 bg-white/95 p-6 shadow-xl shadow-cyan-100/50">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">How It Works</p>
            <div className="mt-5 space-y-3">
              {[
                "Add basic profile and risk factors",
                "Describe symptoms in your own words",
                "Get AI triage + possible conditions",
                "Connect to relevant doctors",
              ].map((item, idx) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-cyan-600 text-xs font-bold text-white">{idx + 1}</span>
                  <p className="text-sm text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="reveal-up delay-1 rounded-2xl border border-slate-200 bg-white p-5 text-center">
            <p className="text-3xl font-semibold text-slate-900">{doctors.length || "--"}</p>
            <p className="mt-1 text-sm text-slate-500">Approved doctors</p>
          </div>
          <div className="reveal-up delay-2 rounded-2xl border border-slate-200 bg-white p-5 text-center">
            <p className="text-3xl font-semibold text-slate-900">{hospitals.length || "--"}</p>
            <p className="mt-1 text-sm text-slate-500">Hospital network nodes</p>
          </div>
          <div className="reveal-up delay-3 rounded-2xl border border-slate-200 bg-white p-5 text-center">
            <p className="text-3xl font-semibold text-slate-900">24/7</p>
            <p className="mt-1 text-sm text-slate-500">Always available interview</p>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="reveal-up delay-2 rounded-3xl border border-slate-200 bg-white p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Available Specialists</p>
            <div className="mt-4 space-y-3">
              {doctors.slice(0, 4).map((doctor) => (
                <div key={doctor.id} className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
                  <p className="font-semibold text-slate-900">Dr. {doctor.user.first_name || doctor.user.username}</p>
                  <p className="text-sm text-slate-600">{doctor.specialty}</p>
                  {doctor.hospital ? <p className="text-xs text-slate-500">{doctor.hospital.name}, {doctor.hospital.city}</p> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-up delay-3 rounded-3xl border border-slate-200 bg-white p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Hospital Coverage</p>
            <div className="mt-4 space-y-3">
              {hospitals.slice(0, 4).map((hospital) => (
                <div key={hospital.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{hospital.name}</p>
                  <p className="text-sm text-slate-600">{hospital.city}</p>
                  <p className="text-xs text-slate-500">{hospital.address}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
