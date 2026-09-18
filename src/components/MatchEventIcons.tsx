export function GoalIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8.8 15.04 11.01 13.88 14.59 10.12 14.59 8.96 11.01Z" fill="currentColor" stroke="none" />
      <path d="M12 8.8 12 3M15.04 11.01 20.56 9.22M13.88 14.59 17.29 19.28M10.12 14.59 6.71 19.28M8.96 11.01 3.44 9.22" />
    </svg>
  );
}

export function CardIcon({
  type,
  className = "h-4 w-4",
}: {
  type: "YELLOW" | "RED";
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2.5"
        transform="rotate(-8 12 12)"
        fill={type === "YELLOW" ? "#eab308" : "#ef4444"}
      />
    </svg>
  );
}

export function SubstitutionIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 5v11" stroke="#ef4444" />
      <path d="M5 13l3 3 3-3" stroke="#ef4444" />
      <path d="M16 19V8" stroke="#22c55e" />
      <path d="M19 11l-3-3-3 3" stroke="#22c55e" />
    </svg>
  );
}
