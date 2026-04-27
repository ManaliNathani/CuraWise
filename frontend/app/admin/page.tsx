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
  doctors_directory: AdminDoctorRow[];
  hospitals_directory: HospitalRow[];
  active_users?: number;
  doctors_online?: number;
  hospitals?: number;
  consultations_today?: number;
}

interface HospitalRow {
  id: number;
  name: string;
  city: string;
  address: string;
  specialties: string;
  phone: string;
}

interface AdminDoctorRow {
  id: number;
  user: { username: string; first_name: string; last_name: string };
  specialty: string;
  hospital: HospitalRow | null;
  is_approved: boolean;
}

interface PendingDoctor {
  id: number;
  user: { username: string; first_name: string; last_name: string };
  specialty: string;
}

const demoPending: PendingDoctor[] = [
  { id: 77, user: { username: "dr_neha", first_name: "Neha", last_name: "" }, specialty: "Neurology" },
  { id: 78, user: { username: "dr_kabir", first_name: "Kabir", last_name: "" }, specialty: "General Medicine" }
];

const emptyStats: AdminStats = {
  users_count: 0,
  doctors_count: 0,
  doctors_pending_count: 0,
  hospitals_count: 0,
  consultations_count: 0,
  doctors_directory: [],
  hospitals_directory: []
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([]);

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
      .then((data) =>
        setStats({
          ...emptyStats,
          ...data,
          doctors_directory: data.doctors_directory ?? [],
          hospitals_directory: data.hospitals_directory ?? []
        })
      )
      .catch(() => setStats({ ...emptyStats }));
    apiGet<PendingDoctor[]>("/admin/doctors/pending/")
      .then((data) => setPendingDoctors(data.length ? data : demoPending))
      .catch(() => setPendingDoctors(demoPending));
  };

  useEffect(() => {
    loadData();
  }, []);

  const approveDoctor = async (doctorId: number) => {
    try {
      await apiPost(`/admin/doctors/${doctorId}/approve/`, {});
      setPendingDoctors((prev) => prev.filter((doc) => doc.id !== doctorId));
      setNotice("Doctor approved.");
      loadData();
    } catch (err) {
      setNotice("Approval failed.");
    }
  };

  const s = stats;

  return (
    <RoleShell title="Admin dashboard" subtitle="Patients, doctors, and hospital network">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Patients (users)" value={s?.users_count ?? "--"} icon="P" />
        <StatCard label="Approved doctors" value={s?.doctors_count ?? "--"} icon="D" />
        <StatCard label="Pending doctors" value={s?.doctors_pending_count ?? "--"} icon="!" />
        <StatCard label="Hospitals" value={s?.hospitals_count ?? "--"} icon="H" />
        <StatCard label="Consultations" value={s?.consultations_count ?? "--"} icon="C" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="dashboard-tile card-3d rounded-2xl border border-pink-100/80 bg-white/85 backdrop-blur-sm p-6 shadow-sm transition-all duration-300">
          <h2 className="text-xl font-semibold">Doctors on the platform</h2>
          <p className="mt-1 text-sm text-muted">All registered doctors, affiliated hospital, and approval status.</p>
          <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto text-sm">
            {!s?.doctors_directory?.length && <p className="text-muted">No doctors registered yet.</p>}
            {s?.doctors_directory?.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl border border-pink-100/70 bg-pink-50/30 p-3 transition hover:border-accent/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">
                      Dr. {doc.user.first_name || doc.user.username}
                    </p>
                    <p className="text-xs text-muted">{doc.specialty}</p>
                    {doc.hospital ? (
                      <p className="mt-1 text-xs text-ink/80">
                        {doc.hospital.name} · {doc.hospital.city}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-muted">No hospital linked</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      doc.is_approved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {doc.is_approved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-tile card-3d rounded-2xl border border-pink-100/80 bg-white/85 backdrop-blur-sm p-6 shadow-sm transition-all duration-300">
          <h2 className="text-xl font-semibold">Hospitals in network</h2>
          <p className="mt-1 text-sm text-muted">Partner facilities and coverage cities.</p>
          <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto text-sm">
            {!s?.hospitals_directory?.length && <p className="text-muted">No hospitals in the directory yet.</p>}
            {s?.hospitals_directory?.map((h) => (
              <div
                key={h.id}
                className="rounded-xl border border-pink-100/70 bg-pink-50/30 p-3 transition hover:border-accent/20"
              >
                <p className="font-semibold text-ink">{h.name}</p>
                <p className="text-xs font-medium text-accentDeep">
                  {h.city}
                  {h.phone ? ` · ${h.phone}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted">{h.address}</p>
                <p className="mt-1 text-xs text-muted">Specialties: {h.specialties}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-tile card-3d mt-8 rounded-2xl border border-pink-100/80 bg-white/85 backdrop-blur-sm p-6 shadow-sm transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Doctor approval queue</h2>
            <p className="mt-1 text-sm text-muted">Approve new doctors before they can take consultations.</p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="rounded-xl border border-pink-100 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent/30 hover:shadow-md active:scale-[0.99]"
          >
            Refresh all data
          </button>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          {pendingDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="flex items-center justify-between rounded-xl border border-pink-100/70 bg-pink-50/40 p-4 transition hover:shadow-sm"
            >
              <div>
                <p className="font-semibold text-ink">
                  Dr. {doctor.user.first_name || doctor.user.username}
                </p>
                <p className="text-xs text-muted">{doctor.specialty}</p>
              </div>
              <button
                type="button"
                onClick={() => approveDoctor(doctor.id)}
                className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accentDeep transition hover:bg-accent/20 active:scale-95"
              >
                Approve
              </button>
            </div>
          ))}
          {pendingDoctors.length === 0 && <p className="text-sm text-muted">No pending doctors right now.</p>}
        </div>
        {notice && <p className="mt-4 text-sm text-muted">{notice}</p>}
      </div>
    </RoleShell>
  );
}
