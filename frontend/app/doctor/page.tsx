"use client";

import { useEffect, useState } from "react";
import RoleShell from "../components/RoleShell";
import ChartCard from "../components/ChartCard";
import StatCard from "../components/StatCard";
import { apiGet, apiPost } from "../lib/api";

interface Consultation {
  id: number;
  user: { username: string; first_name: string; last_name: string };
  symptom_check?: { symptoms: string; predicted_condition: string } | null;
}

interface Message {
  id: number;
  content: string;
  sender: { username: string };
  created_at: string;
}

const demoQueue: Consultation[] = [
  {
    id: 12,
    user: { username: "user_aisha", first_name: "Aisha", last_name: "" },
    symptom_check: { symptoms: "Fever, cough", predicted_condition: "Likely viral infection" }
  },
  {
    id: 14,
    user: { username: "user_maya", first_name: "Maya", last_name: "" },
    symptom_check: { symptoms: "Chest tightness", predicted_condition: "Possible cardiac/respiratory concern" }
  }
];

export default function DoctorDashboard() {
  const [queue, setQueue] = useState<Consultation[]>([]);
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [approved, setApproved] = useState<boolean | null>(null);
  const [filter, setFilter] = useState("All");
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ profile: { role: string } }>("/auth/me/")
      .then((me) => {
        if (me.profile?.role !== "doctor" && me.profile?.role !== "admin") {
          window.location.href = "/login";
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });
    apiGet<{ is_approved: boolean }>("/doctor/me/")
      .then((profile) => setApproved(profile.is_approved))
      .catch(() => setApproved(false));
    apiGet<Consultation[]>("/doctor/queue/")
      .then((data) => setQueue(data.length ? data : demoQueue))
      .catch(() => setQueue(demoQueue));
  }, []);

  useEffect(() => {
    setChatError(null);
  }, [activeConsultation]);

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
    setChatError(null);
    const text = messageDraft.trim();
    setMessageDraft("");
    try {
      const msg = await apiPost<Message>(`/consultations/${activeConsultation.id}/messages/`, { content: text });
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Failed to send");
      setMessageDraft(text);
    }
  };

  const visibleQueue = queue.filter((item) => {
    if (filter === "All") return true;
    const text = item.symptom_check?.predicted_condition?.toLowerCase() || "";
    if (filter === "Critical") return text.includes("cardiac") || text.includes("respiratory");
    if (filter === "Moderate") return text.includes("viral");
    return true;
  });

  return (
    <RoleShell title="Doctor dashboard" subtitle="Live consults and triage">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Queue" value={queue.length} icon="Q" />
        <StatCard label="Urgent" value={2} icon="U" />
        <StatCard label="Avg wait" value="8m" icon="T" />
        <StatCard label="Resolved" value={12} icon="R" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Live Consult Volume" subtitle="Last 7 days" data={[20, 30, 22, 45, 38, 55, 60]} accent="#ec4899" />
        <ChartCard title="Critical Alerts" subtitle="Today" data={[12, 18, 10, 25, 30, 22, 28]} accent="#f472b6" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="dashboard-tile card-3d rounded-2xl border border-pink-100/80 bg-white/85 backdrop-blur-sm p-6 shadow-sm transition-all duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Patient Queue</h2>
            <div className="flex items-center gap-2 text-xs">
              {["All", "Critical", "Moderate"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-3 py-1 transition-all active:scale-95 ${
                    filter === item
                      ? "bg-accent text-white shadow-md shadow-pink-200/40"
                      : "bg-pink-50 text-muted hover:bg-pink-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          {approved === false ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Your account is pending admin approval. You will receive access once approved.
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-sm">
              {visibleQueue.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveConsultation(item)}
                  className="w-full rounded-xl border border-pink-100/70 bg-pink-50/40 p-4 text-left transition-all hover:border-accent/35 hover:bg-white hover:shadow-md active:scale-[0.99]"
                >
                  <p className="font-semibold text-ink">{item.user.first_name || item.user.username}</p>
                  <p className="text-xs text-muted">
                    {item.symptom_check?.predicted_condition || "No AI summary"}
                  </p>
                </button>
              ))}
              {visibleQueue.length === 0 && <p className="text-muted">No active consultations.</p>}
            </div>
          )}
        </section>

        <section className="dashboard-tile card-3d rounded-2xl border border-pink-100/80 bg-white/85 backdrop-blur-sm p-6 shadow-sm transition-all duration-300">
          <h2 className="text-xl font-semibold">Live Chat</h2>
          {approved === false ? (
            <p className="mt-4 text-sm text-muted">Chat unlocks after admin approval.</p>
          ) : activeConsultation ? (
            <>
              <p className="mt-2 text-sm text-muted">
                Chatting with {activeConsultation.user.first_name || activeConsultation.user.username}
              </p>
              <div className="mt-4 h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                {messages.map((msg) => (
                  <div key={msg.id} className="mb-3">
                    <p className="text-xs text-muted">{msg.sender.username}</p>
                    <p className="text-ink">{msg.content}</p>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-muted">No messages yet.</p>}
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
                  className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-accentDeep hover:shadow-md active:scale-95"
                >
                  Send
                </button>
                {chatError && <p className="mt-2 text-sm text-red-600">{chatError}</p>}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted">Select a consultation to open chat.</p>
          )}
        </section>
      </div>
    </RoleShell>
  );
}
