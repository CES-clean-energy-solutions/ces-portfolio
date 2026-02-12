// Energy Efficiency Icon - Chevron as energy bolt with pulse rings
export function EnergyEfficiencyIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <style>
        {`
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          .pulse-ring {
            animation: pulse-ring 2s ease-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .pulse-ring { animation: none !important; }
          }
        `}
      </style>

      {/* Pulse rings (active state only) */}
      {active && (
        <>
          <circle
            cx="32"
            cy="32"
            r="16"
            stroke="oklch(0.75 0.12 85)"
            strokeWidth="1"
            fill="none"
            className="pulse-ring"
            style={{ animationDelay: "0s" }}
          />
          <circle
            cx="32"
            cy="32"
            r="16"
            stroke="oklch(0.75 0.12 85)"
            strokeWidth="1"
            fill="none"
            className="pulse-ring"
            style={{ animationDelay: "0.6s" }}
          />
        </>
      )}

      {/* Chevron as energy bolt */}
      <path
        d="M 32 12 L 40 28 L 34 28 L 36 40 L 24 28 L 30 28 L 32 12 Z"
        fill={active ? "oklch(0.75 0.12 85)" : "none"}
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1.5"
        strokeLinejoin="miter"
        style={{
          transition: "fill 0.3s ease",
        }}
      />

      {/* Meter arc */}
      <path
        d="M 14 38 A 18 18 0 0 1 50 38"
        stroke={active ? "oklch(0.75 0.12 85)" : "oklch(0.75 0.12 85 / 0.5)"}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        style={{ transition: "stroke 0.3s ease" }}
      />
    </svg>
  );
}
