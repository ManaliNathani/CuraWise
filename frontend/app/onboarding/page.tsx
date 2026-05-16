"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

interface Hospital {
  id: number;
  name: string;
  city: string;
}

export default function OnboardingPage() {
  const [role, setRole] = useState("user");
  const [doctorApproved, setDoctorApproved] = useState<boolean | null>(null);
  const [doctorPendingNotice, setDoctorPendingNotice] = useState(false);
  const [doctorApprovalStatus, setDoctorApprovalStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [doctorReviewNote, setDoctorReviewNote] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [hospitalId, setHospitalId] = useState<string>("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setDoctorPendingNotice(params.get("pending") === "doctor-approval");
      const status = params.get("status");
      if (status === "pending" || status === "approved" || status === "rejected") {
        setDoctorApprovalStatus(status);
      }
    }
    apiGet<{
      profile: { role: string; city: string; phone: string };
      doctor_approved?: boolean | null;
      doctor_approval_status?: "pending" | "approved" | "rejected" | null;
      doctor_review_note?: string | null;
    }>("/auth/me/")
      .then((me) => {
        setRole(me.profile?.role || "user");
        setCity(me.profile?.city || "");
        setPhone(me.profile?.phone || "");
        setDoctorApproved(me.doctor_approved ?? null);
        setDoctorApprovalStatus(me.doctor_approval_status ?? null);
        setDoctorReviewNote(me.doctor_review_note ?? null);
        setSessionReady(true);
      })
      .catch(() => {
        window.location.href = "/login";
      });
    apiGet<Hospital[]>("/hospitals/").then(setHospitals).catch(() => null);
  }, []);

  const handleSave = async () => {
    setMessage(null);
    try {
      await apiPost("/profile/update/", {
        city,
        phone,
        specialty: role === "doctor" ? specialty : undefined,
        bio: role === "doctor" ? bio : undefined,
        hospital_id: role === "doctor" && hospitalId ? Number(hospitalId) : undefined
      });
      if (role === "doctor" && doctorApproved !== true) {
        setMessage("Doctor profile saved. Access will be enabled after admin approval.");
        return;
      }
      window.location.href = role === "doctor" ? "/doctor" : role === "admin" ? "/admin" : "/user";
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm card-3d">
        <h1 className="text-3xl font-semibold">Complete your profile</h1>
        <p className="mt-2 text-sm text-muted">Finish onboarding for your {role} role.</p>
        {doctorPendingNotice && role === "doctor" && doctorApproved !== true && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Your doctor dashboard is locked until admin approval.
          </div>
        )}
        {role === "doctor" && doctorApprovalStatus === "rejected" && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            Admin rejected your doctor access request.
            {doctorReviewNote ? ` Reason: ${doctorReviewNote}` : ""}
          </div>
        )}
        {role === "doctor" && doctorApprovalStatus === "pending" && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Your doctor access request is under review by admin.
          </div>
        )}
        {role === "doctor" && doctorApprovalStatus === "approved" && doctorApproved === true && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Your doctor access is approved. You can continue to doctor dashboard.
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            className="rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="City"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
          <input
            className="rounded-xl border border-slate-200 p-3 text-sm"
            placeholder="Phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>

        {role === "doctor" && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              className="rounded-xl border border-slate-200 p-3 text-sm"
              placeholder="Specialty"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
            />
            <select
              className="rounded-xl border border-slate-200 p-3 text-sm"
              value={hospitalId}
              onChange={(event) => setHospitalId(event.target.value)}
            >
              <option value="">Select hospital</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name} ({hospital.city})
                </option>
              ))}
            </select>
            <textarea
              className="md:col-span-2 min-h-[120px] rounded-xl border border-slate-200 p-3 text-sm"
              placeholder="Short bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
          </div>
        )}

        {message && <p className="mt-4 text-sm text-red-600">{message}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white"
          >
            Save & continue
          </button>
          {sessionReady && (
            <Link
              className="text-sm font-semibold text-accentDeep hover:underline"
              href={role === "admin" ? "/admin" : role === "doctor" && doctorApproved === true ? "/doctor" : "/user"}
            >
              {role === "doctor" && doctorApproved !== true ? "Go to user dashboard" : "Skip to dashboard"}
            </Link>
          )}
          <Link className="text-sm text-muted hover:text-ink" href="/login">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
