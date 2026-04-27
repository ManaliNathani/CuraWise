"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

interface Hospital {
  id: number;
  name: string;
  city: string;
}

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [hospitalId, setHospitalId] = useState<string>("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    apiGet<Hospital[]>("/hospitals/")
      .then(setHospitals)
      .catch(() => setHospitals([]));
  }, []);

  const detectedRole = useMemo(() => {
    const value = `${username} ${firstName}`.toLowerCase();
    if (value.startsWith("dr") || value.includes(" doctor") || value.includes("doctor") || value.includes("dr ")) {
      return "doctor";
    }
    return "user";
  }, [username, firstName]);

  const handleSignup = async () => {
    setMessage(null);
    setIsLoading(true);
    try {
      await apiPost<{ profile: { role: string } }>(
        "/auth/signup/",
        {
          username,
          password,
          first_name: firstName,
          last_name: lastName,
          role: detectedRole,
          specialty: detectedRole === "doctor" ? specialty : undefined,
          hospital_id: detectedRole === "doctor" && hospitalId ? Number(hospitalId) : undefined,
        },
        { skipCsrf: true }
      );

      const next = detectedRole === "doctor" ? "/doctor" : "/user";
      window.location.assign(next);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Signup failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 pt-24 pb-12">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm card-3d">
        <h1 className="text-3xl font-semibold">Create your CuraWise account</h1>
        <p className="mt-2 text-sm text-muted">Choose your role to tailor onboarding.</p>



        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            className="rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="First name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
          <input
            className="rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Last name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
          <input
            className="rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            className="rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {detectedRole === "doctor" && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Doctor registration detected. Your account will be reviewed by the admin before doctor dashboard access is granted.
          </div>
        )}

        {detectedRole === "doctor" && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              className="rounded-xl border border-slate-200 p-3 text-sm"
              placeholder="Specialty (e.g. General Medicine)"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
            />
            <select
              className="rounded-xl border border-slate-200 p-3 text-sm"
              aria-label="Hospital affiliation"
              value={hospitalId}
              onChange={(event) => setHospitalId(event.target.value)}
            >
              <option value="">Select hospital (optional)</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name} ({hospital.city})
                </option>
              ))}
            </select>
          </div>
        )}

        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleSignup}
            disabled={isLoading}
            className={`rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ${
              isLoading ? "opacity-75 cursor-not-allowed" : "hover:bg-accentDeep hover:scale-[1.02] active:scale-95"
            }`}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
          <Link className="text-sm text-accentDeep transition-colors duration-200 hover:text-accentBlue hover:underline" href="/login">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
