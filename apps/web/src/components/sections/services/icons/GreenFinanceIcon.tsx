// Green Finance Icon - Chevron as upward growth arrow with cascading dots
export function GreenFinanceIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <style>
        {`
          @keyframes cascade {
            0% { opacity: 0; transform: translateY(4px); }
            50% { opacity: 1; }
            100% { opacity: 0; transform: translateY(-4px); }
          }
          .dot-1 { animation: cascade 2s ease-in-out infinite 0s; }
          .dot-2 { animation: cascade 2s ease-in-out infinite 0.3s; }
          .dot-3 { animation: cascade 2s ease-in-out infinite 0.6s; }
          .dot-4 { animation: cascade 2s ease-in-out infinite 0.9s; }
          @media (prefers-reduced-motion: reduce) {
            .dot-1, .dot-2, .dot-3, .dot-4 { animation: none !important; }
          }
        `}
      </style>

      {/* Upward chevron arrow */}
      <path
        d="M 20 36 L 32 12 L 44 36 L 40 36 L 32 20 L 24 36 Z"
        fill={active ? "oklch(0.75 0.12 85)" : "none"}
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1.5"
        strokeLinejoin="miter"
        style={{ transition: "fill 0.3s ease" }}
      />

      {/* Stem line */}
      <line
        x1="32"
        y1="36"
        x2="32"
        y2="52"
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1.5"
        opacity={active ? 1 : 0.5}
        style={{ transition: "opacity 0.3s ease" }}
      />

      {/* Growth dots cascading up (only animate when active) */}
      {active && (
        <>
          <circle cx="32" cy="48" r="2" fill="oklch(0.75 0.12 85)" className="dot-1" />
          <circle cx="32" cy="42" r="2" fill="oklch(0.75 0.12 85)" className="dot-2" />
          <circle cx="32" cy="36" r="2" fill="oklch(0.75 0.12 85)" className="dot-3" />
          <circle cx="32" cy="30" r="2" fill="oklch(0.75 0.12 85)" className="dot-4" />
        </>
      )}

      {/* Base platform */}
      <line
        x1="24"
        y1="52"
        x2="40"
        y2="52"
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
