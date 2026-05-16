"use client";

import { useEffect, useMemo, useState } from "react";
import RoleShell from "../components/RoleShell";
import { apiGet, apiPost } from "../lib/api";

interface SymptomCheck {
  id: number;
  predicted_condition: string;
}

interface SymptomReport {
  clinical_summary: {
    primary_condition: string;
    confidence_percent: number;
    triage: string;
    red_flags: string[];
    recommended_specialties: string[];
  };
  doctor_recommendations: Array<{
    doctor_name: string;
    specialty: string;
    hospital: string | null;
  }>;
  hospital_recommendations: Array<{
    name: string;
    city: string;
    specialties: string;
  }>;
}

type Step = 1 | 2 | 3 | 4;

const contextOptions = [
  "I recently had fever or chills",
  "I noticed yellow eyes / skin",
  "My urine color looks darker than usual",
  "I have vomiting or nausea",
  "I have loss of appetite",
  "Symptoms are getting worse day by day",
];

export default function UserDashboard() {
  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [ageBand, setAgeBand] = useState("Adult");
  const [gender, setGender] = useState("Not specified");
  const [city, setCity] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("1-3 days");
  const [severity, setSeverity] = useState("Moderate");
  const [selectedContext, setSelectedContext] = useState<string[]>([]);
  const [check, setCheck] = useState<SymptomCheck | null>(null);
  const [report, setReport] = useState<SymptomReport | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    apiGet<{ profile: { role: string } }>("/auth/me/")
      .then((me) => {
        if (me.profile?.role !== "user") window.location.href = "/login";
      })
      .catch(() => (window.location.href = "/login"));
  }, []);

  const progress = useMemo(() => Math.round((step / 4) * 100), [step]);

  const toggleContext = (item: string) => {
    setSelectedContext((prev) =>
      prev.includes(item) ? prev.filter((r) => r !== item) : [...prev, item]
    );
  };

  const canContinueStep1 = fullName.trim().length > 2 && phoneNumber.trim().length >= 8 && city.trim().length > 1;
  const canContinueStep2 = symptoms.trim().length > 4;

  const analyze = async () => {
    setStatus(null);
    setIsLoading(true);
    try {
      const enrichedSymptoms = `Patient: ${fullName}. Phone: ${phoneNumber}. Email: ${email || "not provided"}. ${symptoms}. Duration: ${duration}. Context: ${
        selectedContext.join(", ") || "none"
      }. Age group: ${ageBand}. Gender: ${gender}.`;
      const result = await apiPost<SymptomCheck>("/symptom-checks/", {
        symptoms: enrichedSymptoms,
        severity,
        city,
      });
      setCheck(result);
      const generatedReport = await apiPost<SymptomReport>("/symptom-report/", {
        symptoms: enrichedSymptoms,
        severity,
        city,
      });
      setReport(generatedReport);
      setStep(4);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReportPdf = () => {
    if (!report) return;
    const popup = window.open("", "_blank");
    if (!popup) return;
    const html = `
      <html>
        <head><title>CuraWise Report</title></head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h1>CuraWise Symptom Report</h1>
          <p><strong>Primary:</strong> ${report.clinical_summary.primary_condition}</p>
          <p><strong>Confidence:</strong> ${report.clinical_summary.confidence_percent}%</p>
          <p><strong>Triage:</strong> ${report.clinical_summary.triage}</p>
          <p><strong>Specialties:</strong> ${report.clinical_summary.recommended_specialties.join(", ") || "General Medicine"}</p>
          <p><strong>Red Flags:</strong> ${report.clinical_summary.red_flags.join(", ") || "None"}</p>
          <h3>Doctors</h3>
          ${report.doctor_recommendations.map((d) => `<p>${d.doctor_name} (${d.specialty}) ${d.hospital ? "- " + d.hospital : ""}</p>`).join("")}
          <h3>Hospitals</h3>
          ${report.hospital_recommendations.map((h) => `<p>${h.name} (${h.city})</p>`).join("")}
        </body>
      </html>
    `;
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  return (
    <RoleShell role="user" title="Smart Symptom Interview" subtitle="Step-by-step health assessment and triage report">
      <section className="dashboard-tile rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Interview Progress</p>
            <p className="text-lg font-semibold text-slate-800">Step {step} of 4</p>
          </div>
          <div className="w-full max-w-md">
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="dashboard-tile rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">1) Basic Profile</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="md:col-span-2 rounded-xl border border-slate-200 p-3 text-sm"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <input
                  className="rounded-xl border border-slate-200 p-3 text-sm"
                  placeholder="Phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <input
                  className="rounded-xl border border-slate-200 p-3 text-sm"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <select className="rounded-xl border border-slate-200 p-3 text-sm" value={ageBand} onChange={(e) => setAgeBand(e.target.value)}>
                  <option>Child</option>
                  <option>Adult</option>
                  <option>Senior</option>
                </select>
                <select className="rounded-xl border border-slate-200 p-3 text-sm" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option>Not specified</option>
                  <option>Female</option>
                  <option>Male</option>
                </select>
                <input
                  className="md:col-span-2 rounded-xl border border-slate-200 p-3 text-sm"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <button
                type="button"
                disabled={!canContinueStep1}
                onClick={() => setStep(2)}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">2) Symptoms</h2>
              <textarea
                className="min-h-[140px] w-full rounded-xl border border-slate-200 p-4 text-sm"
                placeholder="Example: yellow eyes, fever, tiredness, dark urine"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <select className="rounded-xl border border-slate-200 p-3 text-sm" value={duration} onChange={(e) => setDuration(e.target.value)}>
                  <option>Less than 24h</option>
                  <option>1-3 days</option>
                  <option>4-7 days</option>
                  <option>More than a week</option>
                </select>
                <select className="rounded-xl border border-slate-200 p-3 text-sm" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                  <option>Mild</option>
                  <option>Moderate</option>
                  <option>Severe</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold">
                  Back
                </button>
                <button
                  type="button"
                  disabled={!canContinueStep2}
                  onClick={() => setStep(3)}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">3) Quick Context Questions</h2>
              <p className="text-sm text-slate-600">Select the statements that match your current situation.</p>
              <div className="grid gap-2 md:grid-cols-2">
                {contextOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleContext(item)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                      selectedContext.includes(item)
                        ? "border-blue-300 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setStep(2)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold">
                  Back
                </button>
                <button
                  type="button"
                  onClick={analyze}
                  disabled={isLoading}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isLoading ? "Generating report..." : "Generate Report"}
                </button>
              </div>
            </div>
          )}

          {step === 4 && report && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">4) Triage Report</h2>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <p><strong>Primary:</strong> {report.clinical_summary.primary_condition}</p>
                <p><strong>Confidence:</strong> {report.clinical_summary.confidence_percent}%</p>
                <p><strong>Triage:</strong> {report.clinical_summary.triage}</p>
                <p><strong>Specialties:</strong> {report.clinical_summary.recommended_specialties.join(", ") || "General Medicine"}</p>
                {report.clinical_summary.red_flags.length > 0 && (
                  <p><strong>Red Flags:</strong> {report.clinical_summary.red_flags.join(", ")}</p>
                )}
              </div>
              <button type="button" onClick={() => setStep(2)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold">
                Edit Symptoms & Re-run
              </button>
              <button type="button" onClick={downloadReportPdf} className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white">
                Download PDF
              </button>
            </div>
          )}

          {status && <p className="mt-4 text-sm text-rose-600">{status}</p>}
        </section>

        <section className="dashboard-tile rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900">Live Guidance</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>We ask questions step-by-step like a structured symptom interview.</p>
            <p>Add more specific symptoms for better accuracy: location, duration, severity.</p>
            <p>Red-flag symptoms will raise emergency triage automatically.</p>
          </div>
          {check && (
            <div className="mt-5 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-900">
              Last inference: {check.predicted_condition}
            </div>
          )}
          {report && (
            <div className="mt-5 space-y-3">
              <h4 className="text-sm font-semibold text-slate-800">Top Doctors</h4>
              {report.doctor_recommendations.slice(0, 3).map((d, idx) => (
                <p key={`${d.doctor_name}-${idx}`} className="text-sm text-slate-700">
                  {d.doctor_name} ({d.specialty}){d.hospital ? ` - ${d.hospital}` : ""}
                </p>
              ))}
              <h4 className="text-sm font-semibold text-slate-800">Top Hospitals</h4>
              {report.hospital_recommendations.slice(0, 3).map((h, idx) => (
                <p key={`${h.name}-${idx}`} className="text-sm text-slate-700">
                  {h.name} ({h.city})
                </p>
              ))}
            </div>
          )}
        </section>
      </div>
    </RoleShell>
  );
}
