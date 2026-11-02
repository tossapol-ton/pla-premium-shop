export function LoadingPanel({ label = "กำลังโหลด…" }: { label?: string }) {
  return (
    <div role="status" className="rounded-card border border-line bg-white px-6 py-16 text-center text-sm text-muted">
      {label}
    </div>
  );
}
