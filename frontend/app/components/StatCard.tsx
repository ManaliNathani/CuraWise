export default function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="dashboard-tile card-3d cursor-default rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold">{value}</p>
        </div>
        <div className="pulse-dot grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accentDeep">
          <span className="text-sm font-semibold">{icon}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">Updated just now</p>
    </div>
  );
}
