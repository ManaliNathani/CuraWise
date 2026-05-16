"use client";

import { useEffect, useState } from "react";
import RoleShell from "../components/RoleShell";
import StatCard from "../components/StatCard";
import { apiGet, apiPost } from "../lib/api";

interface AdminStats {
  users_count: number;
  doctors_count: number;
  doctors_pending_count: number;
  hospitals_count: number;
  consultations_count: number;
  hospitals_pending_count?: number;
  doctors_directory: AdminDoctorRow[];
  users_directory: AdminUserRow[];
  hospitals_directory: HospitalRow[];
}
interface AdminUserRow {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile?: { city?: string; phone?: string };
}

interface HospitalRow {
  id: number;
  name: string;
  city: string;
  address: string;
  specialties: string;
  phone: string;
  description?: string;
  review_note?: string;
  reviewed_at?: string | null;
  reviewed_by_name?: string | null;
}

interface AdminDoctorRow {
  id: number;
  user: { username: string; first_name: string; last_name: string };
  specialty: string;
  hospital: HospitalRow | null;
  is_approved: boolean;
  approval_status: "pending" | "approved" | "rejected";
  review_note: string;
  reviewed_at: string | null;
  reviewed_by_name: string | null;
}

interface PendingDoctor {
  id: number;
  user: { username: string; first_name: string; last_name: string };
  specialty: string;
}

const emptyStats: AdminStats = {
  users_count: 0,
  doctors_count: 0,
  doctors_pending_count: 0,
  hospitals_count: 0,
  consultations_count: 0,
  doctors_directory: [],
  users_directory: [],
  hospitals_directory: [],
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([]);
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});
  const [pendingHospitals, setPendingHospitals] = useState<HospitalRow[]>([]);
  const [hospitalReviewNotes, setHospitalReviewNotes] = useState<Record<number, string>>({});

  const loadData = () => {
    apiGet<{ profile: { role: string } }>("/auth/me/")
      .then((me) => {
        if (me.profile?.role !== "admin") {
          window.location.href = "/login";
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });
    apiGet<AdminStats>("/admin/stats/")
      .then((data) => setStats({ ...emptyStats, ...data }))
      .catch(() => setStats({ ...emptyStats }));
    apiGet<PendingDoctor[]>("/admin/doctors/pending/")
      .then((data) => setPendingDoctors(data))
      .catch(() => setPendingDoctors([]));
    apiGet<HospitalRow[]>("/admin/hospitals/pending/")
      .then((data) => setPendingHospitals(data))
      .catch(() => setPendingHospitals([]));
  };

  useEffect(() => {
    loadData();
  }, []);

  const approveDoctor = async (doctorId: number) => {
    try {
      await apiPost(`/admin/doctors/${doctorId}/approve/`, {
        review_note: (reviewNotes[doctorId] || "").trim(),
      });
      setPendingDoctors((prev) => prev.filter((doc) => doc.id !== doctorId));
      setReviewNotes((prev) => ({ ...prev, [doctorId]: "" }));
      setNotice("Doctor approved.");
      loadData();
    } catch {
      setNotice("Approval failed.");
    }
  };

  const rejectDoctor = async (doctorId: number) => {
    const note = (reviewNotes[doctorId] || "").trim();
    if (!note) {
      setNotice("Rejection note is required.");
      return;
    }
    try {
      await apiPost(`/admin/doctors/${doctorId}/reject/`, { review_note: note });
      setPendingDoctors((prev) => prev.filter((doc) => doc.id !== doctorId));
      setReviewNotes((prev) => ({ ...prev, [doctorId]: "" }));
      setNotice("Doctor rejected.");
      loadData();
    } catch {
      setNotice("Rejection failed.");
    }
  };

  const s = stats;

  const approveHospital = async (hospitalId: number) => {
    try {
      await apiPost(`/admin/hospitals/${hospitalId}/approve/`, {
        review_note: (hospitalReviewNotes[hospitalId] || "").trim(),
      });
      setPendingHospitals((prev) => prev.filter((h) => h.id !== hospitalId));
      setHospitalReviewNotes((prev) => ({ ...prev, [hospitalId]: "" }));
      setNotice("Hospital approved.");
      loadData();
    } catch {
      setNotice("Hospital approval failed.");
    }
  };

  const deleteUser = async (userId: number, username: string) => {
    if (!window.confirm(`Delete user ${username}? This cannot be undone.`)) return;
    try {
      const res = await apiPost<{ detail: string }>(`/admin/users/${userId}/delete/`, {});
      setNotice(res.detail || "User deleted.");
      loadData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "User delete failed.");
    }
  };

  const deleteDoctor = async (doctorId: number, username: string) => {
    if (!window.confirm(`Delete doctor ${username}? This cannot be undone.`)) return;
    try {
      const res = await apiPost<{ detail: string }>(`/admin/doctors/${doctorId}/delete/`, {});
      setNotice(res.detail || "Doctor deleted.");
      loadData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Doctor delete failed.");
    }
  };

  const deleteHospital = async (hospitalId: number, hospitalName: string) => {
    if (!window.confirm(`Delete hospital ${hospitalName}? This cannot be undone.`)) return;
    try {
      const res = await apiPost<{ detail: string }>(`/admin/hospitals/${hospitalId}/delete/`, {});
      setNotice(res.detail || "Hospital deleted.");
      loadData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Hospital delete failed.");
    }
  };

  const rejectHospital = async (hospitalId: number) => {
    const note = (hospitalReviewNotes[hospitalId] || "").trim();
    if (!note) {
      setNotice("Hospital rejection note is required.");
      return;
    }
    try {
      await apiPost(`/admin/hospitals/${hospitalId}/reject/`, { review_note: note });
      setPendingHospitals((prev) => prev.filter((h) => h.id !== hospitalId));
      setHospitalReviewNotes((prev) => ({ ...prev, [hospitalId]: "" }));
      setNotice("Hospital rejected.");
      loadData();
    } catch {
      setNotice("Hospital rejection failed.");
    }
  };

  return (
    <RoleShell role="admin" title="Operations Control Center" subtitle="Manage clinicians, patients, and network readiness">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Patients (users)" value={s?.users_count ?? "--"} icon="P" />
        <StatCard label="Approved doctors" value={s?.doctors_count ?? "--"} icon="D" />
        <StatCard label="Pending doctors" value={s?.doctors_pending_count ?? "--"} icon="!" />
        <StatCard label="Hospitals" value={s?.hospitals_count ?? "--"} icon="H" />
        <StatCard label="Hospitals pending" value={s?.hospitals_pending_count ?? "--"} icon="P" />
        <StatCard label="Consultations" value={s?.consultations_count ?? "--"} icon="C" />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3" id="network">
        <div className="dashboard-tile rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Doctors on the platform</h2>
          <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto text-sm">
            {!s?.doctors_directory?.length && <p className="text-muted">No doctors registered yet.</p>}
            {s?.doctors_directory?.map((doc) => (
              <div key={doc.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">Dr. {doc.user.first_name || doc.user.username}</p>
                    <p className="text-xs text-muted">{doc.specialty}</p>
                    <p className="mt-1 text-xs text-ink/80">
                      {doc.hospital ? `${doc.hospital.name} · ${doc.hospital.city}` : "No hospital linked"}
                    </p>
                    {doc.review_note && <p className="mt-1 text-xs text-muted">Note: {doc.review_note}</p>}
                    {doc.reviewed_at && (
                      <p className="mt-1 text-xs text-muted">
                        Reviewed by {doc.reviewed_by_name || "Admin"} on {new Date(doc.reviewed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      doc.approval_status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : doc.approval_status === "rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {doc.approval_status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteDoctor(doc.id, doc.user.username)}
                  className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700"
                >
                  Remove doctor
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-tile rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Users on platform</h2>
          <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto text-sm">
            {!s?.users_directory?.length && <p className="text-muted">No users registered yet.</p>}
            {s?.users_directory?.map((u) => (
              <div key={u.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-ink">{u.first_name || u.username}</p>
                <p className="text-xs text-muted">@{u.username}</p>
                <p className="text-xs text-muted">{u.profile?.city || "City not set"}{u.profile?.phone ? ` · ${u.profile.phone}` : ""}</p>
                <button
                  type="button"
                  onClick={() => deleteUser(u.id, u.username)}
                  className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700"
                >
                  Remove user
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-tile rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Hospitals in network</h2>
          <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto text-sm">
            {!s?.hospitals_directory?.length && <p className="text-muted">No hospitals in the directory yet.</p>}
            {s?.hospitals_directory?.map((h) => (
              <div key={h.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-ink">{h.name}</p>
                <p className="text-xs font-medium text-accentDeep">{h.city}{h.phone ? ` · ${h.phone}` : ""}</p>
                <p className="mt-1 text-xs text-muted">{h.address}</p>
                <p className="mt-1 text-xs text-muted">Specialties: {h.specialties}</p>
                <button
                  type="button"
                  onClick={() => deleteHospital(h.id, h.name)}
                  className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700"
                >
                  Remove hospital
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="approvals" className="dashboard-tile mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Doctor approval queue</h2>
          <button type="button" onClick={loadData} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            Refresh all data
          </button>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          {pendingDoctors.map((doctor) => (
            <div key={doctor.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">Dr. {doctor.user.first_name || doctor.user.username}</p>
                  <p className="text-xs text-muted">{doctor.specialty}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => approveDoctor(doctor.id)} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Approve
                  </button>
                  <button type="button" onClick={() => rejectDoctor(doctor.id)} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
                    Reject
                  </button>
                </div>
              </div>
              <textarea
                className="mt-3 min-h-[70px] w-full rounded-xl border border-slate-200 p-3 text-xs text-ink"
                placeholder="Admin review note (required for rejection)"
                value={reviewNotes[doctor.id] || ""}
                onChange={(event) => setReviewNotes((prev) => ({ ...prev, [doctor.id]: event.target.value }))}
              />
            </div>
          ))}
          {pendingDoctors.length === 0 && <p className="text-sm text-muted">No pending doctors right now.</p>}
        </div>
        {notice && <p className="mt-4 text-sm text-muted">{notice}</p>}
      </div>

      <div id="hospital-approvals" className="dashboard-tile mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold">Hospital approval queue</h2>
        <div className="mt-4 space-y-3 text-sm">
          {pendingHospitals.map((hospital) => (
            <div key={hospital.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{hospital.name}</p>
                  <p className="text-xs text-slate-600">{hospital.city} · {hospital.address}</p>
                  <p className="text-xs text-slate-600">Specialties: {hospital.specialties}</p>
                  {hospital.description && <p className="mt-1 text-xs text-slate-600">{hospital.description}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => approveHospital(hospital.id)} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Approve
                  </button>
                  <button type="button" onClick={() => rejectHospital(hospital.id)} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
                    Reject
                  </button>
                </div>
              </div>
              <textarea
                className="mt-3 min-h-[70px] w-full rounded-xl border border-slate-200 p-3 text-xs text-ink"
                placeholder="Review note (required for rejection)"
                value={hospitalReviewNotes[hospital.id] || ""}
                onChange={(event) => setHospitalReviewNotes((prev) => ({ ...prev, [hospital.id]: event.target.value }))}
              />
            </div>
          ))}
          {pendingHospitals.length === 0 && <p className="text-sm text-slate-600">No pending hospitals.</p>}
        </div>
      </div>
    </RoleShell>
  );
}


