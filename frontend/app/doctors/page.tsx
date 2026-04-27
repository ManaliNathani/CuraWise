import React from "react";

export default function DoctorsPage() {
  const doctors = [
    { name: "Dr. Arjun", specialty: "Cardiology", city: "Mumbai" },
    { name: "Dr. Neha", specialty: "Neurology", city: "Mumbai" },
    { name: "Dr. Kabir", specialty: "General Medicine", city: "Mumbai" },
    { name: "Dr. Priya", specialty: "Pediatrics", city: "Delhi" },
    { name: "Dr. Rohan", specialty: "Orthopedics", city: "Pune" },
    { name: "Dr. Aisha", specialty: "Psychiatry", city: "Bangalore" },
  ];

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 max-w-6xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-accentBlue">
          Our Specialists
        </h1>
        <p className="mt-4 text-muted max-w-2xl mx-auto">
          Connect with top-rated medical professionals across various specialties and locations.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {doctors.map((doc, idx) => (
          <div key={idx} className="card-3d rounded-2xl bg-white/80 p-6 border border-slate-200 backdrop-blur-md transition-all hover:-translate-y-2 cursor-pointer shadow-sm hover:shadow-xl group">
            <div className="w-16 h-16 bg-gradient-to-tr from-accent/20 to-accentDeep/20 rounded-full mb-4 flex items-center justify-center text-accentDeep font-bold text-xl group-hover:scale-110 transition-transform">
              {doc.name.charAt(4)}
            </div>
            <h3 className="text-xl font-bold text-ink mb-1">{doc.name}</h3>
            <p className="text-accent text-sm font-semibold mb-2">{doc.specialty}</p>
            <p className="text-muted text-sm">{doc.city}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
