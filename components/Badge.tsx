type BadgeProps = {
  children: React.ReactNode;
  /** solid = orange fill (product tags); soft = light orange (statuses). */
  variant?: "solid" | "soft";
};

// Orange is an accent: the text on it is always deep navy / dark brown, never orange on white.
export function Badge({ children, variant = "solid" }: BadgeProps) {
  const tone =
    variant === "solid"
      ? "bg-orange-500 text-navy-900"
      : "border border-orange-200 bg-orange-100 text-orange-ink";
  return (
    <span className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-bold ${tone}`}>
      {children}
    </span>
  );
}
