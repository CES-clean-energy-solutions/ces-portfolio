// Renewable Energy Icon - Chevron repeated as sun rays
export function RenewableEnergyIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <style>
        {`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .sun-rays {
            transform-origin: 32px 32px;
            animation: spin-slow 20s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .sun-rays { animation: none !important; }
          }
        `}
      </style>

      {/* Center circle */}
      <circle
        cx="32"
        cy="32"
        r="8"
        fill={active ? "oklch(0.75 0.12 85)" : "none"}
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1.5"
        style={{ transition: "fill 0.3s ease" }}
      />

      {/* Sun rays as chevrons (rotate when active) */}
      <g className={active ? "sun-rays" : ""}>
        {/* 8 chevron rays around center */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const length = active ? 18 : 14;
          const startR = 12;
          const endR = startR + length;

          return (
            <path
              key={i}
              d={`M 32 ${32 - startR} L 30 ${32 - endR} L 32 ${32 - endR + 3} L 34 ${32 - endR} Z`}
              fill="oklch(0.75 0.12 85)"
              opacity={active ? 1 : 0.5}
              style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: "32px 32px",
                transition: "opacity 0.3s ease",
              }}
            />
          );
        })}
      </g>
    </svg>
  );
}
