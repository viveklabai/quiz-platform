type StatusBadgeProps = {
  label: string;
  tone?: "success" | "warning" | "neutral" | "danger";
};

const toneClasses = {
  success: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  neutral: "border-foreground/20 bg-foreground/5 text-foreground/70",
  danger: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
