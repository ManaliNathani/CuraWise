"use client";

import { useEffect, useMemo, useState } from "react";
import RoleShell from "../components/RoleShell";
import { apiGet, apiPost } from "../lib/api";

interface Doctor {
  id: number;
  user: { id: number; first_name: string; last_name: string; username: string };
  specialty: string;
  hospital?: { name: string; city: string } | null;
}

interface SymptomCheck {
  id: number;
  predicted_condition: string;
}

interface Consultation {
  id: number;
  doctor: { id: number; first_name: string; last_name: string; username: string };
}

interface Message {
  id: number;
  content: string;
  sender: { username: string };
  created_at: string;
}

interface Hospital {
  id: number;
  name: string;
  city: string;
  address: string;
  specialties: string;
  phone: string;
}

const demoDoctors: Doctor[] = [
  {
    id: 1,
    user: { id: 1, first_name: "Arjun", last_name: "", username: "dr_arjun" },
    specialty: "Cardiology",
    hospital: { name: "CityCare Medical Center", city: "Mumbai" }
  },
  {
    id: 2,
    user: { id: 2, first_name: "Neha", last_name: "", username: "dr_neha" },
    specialty: "Neurology",
    hospital: { name: "GreenCross Clinic", city: "Mumbai" }
  },
  {
    id: 3,
    user: { id: 3, first_name: "Kabir", last_name: "", username: "dr_kabir" },
    specialty: "General Medicine",
    hospital: { name: "Harbor Hospital", city: "Mumbai" }
  }
];

export default function UserDashboard() {
  const [symptoms, setSymptoms] = useState("");
  const [city, setCity] = useState("");
  const [severity, setSeverity] = useState("Mild");
  const [check, setCheck] = useState<SymptomCheck | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    apiGet<{ profile: { role: string } }>("/auth/me/")
      .then((me) => {
        if (me.profile?.role !== "user") {
          window.location.href = "/login";
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });
    apiGet<Doctor[]>("/doctors/")
      .then((data) => setDoctors(data.length ? data : demoDoctors))
      .catch(() => setDoctors(demoDoctors));
    apiGet<Hospital[]>("/hospitals/")
      .then(setHospitals)
      .catch(() => setHospitals([]));
  }, []);

  const suggestedDoctors = useMemo(() => {
    if (!check) return doctors.slice(0, 3);
    const condition = check.predicted_condition.toLowerCase();
    let keyword = "general";
    if (condition.includes("cardiac") || condition.includes("respiratory")) keyword = "cardio";
    if (condition.includes("migraine") || condition.includes("headache")) keyword = "neuro";
    if (condition.includes("viral")) keyword = "general";
    const filtered = doctors.filter((doctor) =>
      doctor.specialty.toLowerCase().includes(keyword)
    );
    return (filtered.length ? filtered : doctors).slice(0, 3);
  }, [doctors, check]);

  const recommendedHospitals = useMemo(() => {
    if (!hospitals.length) return [];
    const q = city.trim().toLowerCase();
    if (!q) {
      return hospitals.slice(0, 6);
    }
    const matched = hospitals.filter((h) => {
      const hc = h.city.toLowerCase();
      return hc === q || hc.includes(q) || q.includes(hc);
    });
    return matched.length ? matched : hospitals.slice(0, 6);
  }, [hospitals, city]);

  const handleAnalyze = async () => {
    setStatus(null);
    setIsAnalyzing(true);
    try {
      const result = await apiPost<SymptomCheck>("/symptom-checks/", {
        symptoms,
        severity,
        city
      });
      setCheck(result);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startConsult = async (doctorId: number) => {
    if (!check) {
      setStatus("Run a symptom check first.");
      return;
    }
    try {
      const consultation = await apiPost<Consultation>("/consultations/create/", {
        doctor_id: doctorId,
        symptom_check_id: check.id
      });
      setActiveConsultation(consultation);
      const history = await apiGet<Message[]>(`/consultations/${consultation.id}/messages/`);
      setMessages(history);
      setStatus("Consultation started. You can chat now.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to start consultation");
    }
  };

  useEffect(() => {
    if (!activeConsultation) return;
    const id = activeConsultation.id;
    const loadMessages = () => {
      apiGet<Message[]>(`/consultations/${id}/messages/`).then(setMessages).catch(() => null);
    };
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [activeConsultation]);

  const sendMessage = async () => {
    if (!activeConsultation || !messageDraft.trim()) return;
    const text = messageDraft.trim();
    setMessageDraft("");
    try {
      const msg = await apiPost<Message>(`/consultations/${activeConsultation.id}/messages/`, { content: text });
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to send message");
      setMessageDraft(text);
    }
  };

  return (
    <RoleShell title="User dashboard" subtitle="Patient experience">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="dashboard-tile card-3d rounded-2xl border border-pink-100/80 bg-white/85 backdrop-blur-sm p-6 shadow-sm transition-all duration-300">
          <h2 className="text-xl font-semibold">Symptom Checker</h2>
          <p className="mt-2 text-sm text-muted">Describe what you&apos;re feeling and receive AI guidance.</p>
          <div className="mt-4 grid gap-4">
            <textarea
              className="min-h-[130px] rounded-xl border border-slate-200 p-4 text-sm"
              placeholder="Example: fever, cough, sore throat"
              value={symptoms}
              onChange={(event) => setSymptoms(event.target.value)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-xl border border-slate-200 p-3 text-sm"
                placeholder="City"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
              <select
                className="rounded-xl border border-slate-200 p-3 text-sm"
                value={severity}
                onChange={(event) => setSeverity(event.target.value)}
              >
                <option>Mild</option>
                <option>Moderate</option>
                <option>Severe</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ${
                  isAnalyzing ? "opacity-75 cursor-not-allowed" : "hover:bg-accentDeep hover:scale-105 active:scale-95"
                }`}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze symptoms"}
              </button>
              <button
                type="button"
                onClick={() => setStatus("Draft saved locally.")}
                className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-ink transition-all duration-200 hover:bg-slate-50 hover:scale-105 active:scale-95"
              >
                Save draft
              </button>
            </div>
            {check && (
              <div className="rounded-xl border border-pink-200 bg-pink-50 p-4 text-sm text-pink-900">
                AI Insight: {check.predicted_condition}
              </div>
            )}
            {recommendedHospitals.length > 0 && (
              <div className="rounded-xl border border-pink-100 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-ink">Hospital recommendations</h3>
                <p className="mt-1 text-xs text-muted">
                  {city.trim()
                    ? `Facilities in or near “${city.trim()}”. We also show network hospitals if none match your city.`
                    : "Enter your city above for localized matches. Showing network hospitals you can consider."}
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {recommendedHospitals.map((h) => (
                    <li
                      key={h.id}
                      className="rounded-lg border border-pink-100/80 bg-pink-50/40 px-3 py-2 transition hover:border-accent/25"
                    >
                      <span className="font-semibold text-ink">{h.name}</span>
                      <span className="text-muted"> · {h.city}</span>
                      {h.phone ? <span className="block text-xs text-muted mt-0.5">{h.phone}</span> : null}
                      <span className="block text-xs text-muted mt-0.5">{h.address}</span>
                      <span className="block text-xs text-accentDeep/90 mt-0.5">Specialties: {h.specialties}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {status && <p className="text-sm text-muted">{status}</p>}
          </div>
        </section>

        <section className="dashboard-tile card-3d rounded-2xl border border-pink-100/80 bg-white/85 backdrop-blur-sm p-6 shadow-sm transition-all duration-300">
          <h2 className="text-xl font-semibold">Doctor Consult</h2>
          <p className="mt-2 text-sm text-muted">Pick a specialist and start a real-time chat.</p>
          <div className="mt-4 space-y-3 text-sm">
            {suggestedDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center justify-between rounded-xl border border-pink-100/70 bg-pink-50/40 p-4 transition hover:border-accent/25 hover:shadow-sm"
              >
                <div>
                  <p className="font-semibold text-ink">
                    Dr. {doctor.user.first_name || doctor.user.username}
                  </p>
                  <p className="text-xs text-muted">{doctor.specialty}</p>
                  {doctor.hospital ? (
                    <p className="mt-1 text-xs text-ink/80">
                      {doctor.hospital.name} · {doctor.hospital.city}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-muted">Hospital: not linked</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => startConsult(doctor.user.id)}
                  className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accentDeep transition-all duration-200 hover:bg-accent/20 hover:scale-105 active:scale-95"
                >
                  Consult
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {activeConsultation && (
        <section className="dashboard-tile card-3d mt-8 rounded-2xl border border-pink-100/80 bg-white/85 backdrop-blur-sm p-6 shadow-sm transition-all duration-300">
          <h2 className="text-xl font-semibold">Live Chat</h2>
          <p className="mt-2 text-sm text-muted">
            Consultation #{activeConsultation.id} with Dr. {activeConsultation.doctor.first_name || activeConsultation.doctor.username}
          </p>
          <div className="mt-4 h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            {messages.length === 0 && <p className="text-muted">No messages yet.</p>}
            {messages.map((msg) => (
              <div key={msg.id} className="mb-3">
                <p className="text-xs text-muted">{msg.sender.username}</p>
                <p className="text-ink">{msg.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <input
              className="flex-1 rounded-xl border border-slate-200 p-3 text-sm"
              placeholder="Type a message..."
              value={messageDraft}
              onChange={(event) => setMessageDraft(event.target.value)}
            />
            <button
              type="button"
              onClick={sendMessage}
              className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-accentDeep hover:scale-[1.02] active:scale-95"
            >
              Send
            </button>
          </div>
        </section>
      )}
    </RoleShell>
  );
}
