"use client";

import { useState } from "react";
import { apiPost } from "../lib/api";

export default function HospitalRegisterPage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setStatus(null);
    setLoading(true);
    try {
      const res = await apiPost<{ detail: string }>("/hospitals/register/", {
        name,
        city,
        address,
        specialties,
        phone,
        description,
      });
      setStatus(res.detail || "Submitted for admin approval.");
      setName("");
      setCity("");
      setAddress("");
      setSpecialties("");
      setPhone("");
      setDescription("");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 pb-20 pt-28">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Hospital Registration Request</h1>
        <p className="mt-2 text-sm text-slate-600">
          Fill the hospital profile. Admin approval is required before the hospital appears in recommendations.
        </p>
        <div className="mt-6 grid gap-4">
          <input className="rounded-xl border border-slate-200 p-3 text-sm" placeholder="Hospital name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="rounded-xl border border-slate-200 p-3 text-sm" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <input className="rounded-xl border border-slate-200 p-3 text-sm" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <input className="rounded-xl border border-slate-200 p-3 text-sm" placeholder="Specialties (comma separated)" value={specialties} onChange={(e) => setSpecialties(e.target.value)} />
          <input className="rounded-xl border border-slate-200 p-3 text-sm" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <textarea className="min-h-[120px] rounded-xl border border-slate-200 p-3 text-sm" placeholder="Hospital description, facilities, emergency capabilities..." value={description} onChange={(e) => setDescription(e.target.value)} />
          <button onClick={submit} disabled={loading} className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
            {loading ? "Submitting..." : "Submit for Approval"}
          </button>
          {status && <p className="text-sm text-slate-700">{status}</p>}
        </div>
      </div>
    </main>
  );
}
