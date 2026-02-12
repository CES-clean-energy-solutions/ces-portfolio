// Plant Engineering Icon - Chevrons as rising steam/flow
export function PlantEngineeringIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <style>
        {`
          @keyframes float-up {
            0% { transform: translateY(0); opacity: 0.3; }
            50% { opacity: 1; }
            100% { transform: translateY(-12px); opacity: 0; }
          }
          .steam-1 { animation: float-up 2.5s ease-in-out infinite; }
          .steam-2 { animation: float-up 2.5s ease-in-out infinite 0.8s; }
          .steam-3 { animation: float-up 2.5s ease-in-out infinite 1.6s; }
          @media (prefers-reduced-motion: reduce) {
            .steam-1, .steam-2, .steam-3 { animation: none !important; }
          }
        `}
      </style>

      {/* Base structure (pipes) */}
      <rect
        x="20"
        y="40"
        width="8"
        height="16"
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1.5"
        fill="none"
      />
      <rect
        x="36"
        y="40"
        width="8"
        height="16"
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Floating chevrons (steam) - only animate when active */}
      {active && (
        <>
          <path
            d="M 22 32 L 24 28 L 26 32 Z"
            fill="oklch(0.75 0.12 85)"
            className="steam-1"
          />
          <path
            d="M 30 36 L 32 32 L 34 36 Z"
            fill="oklch(0.75 0.12 85)"
            className="steam-2"
          />
          <path
            d="M 38 32 L 40 28 L 42 32 Z"
            fill="oklch(0.75 0.12 85)"
            className="steam-3"
          />
        </>
      )}

      {/* Top chevron indicator */}
      <path
        d="M 28 18 L 32 12 L 36 18 L 32 16 Z"
        fill={active ? "oklch(0.75 0.12 85)" : "none"}
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1.5"
        style={{ transition: "fill 0.3s ease" }}
      />
    </svg>
  );
}
