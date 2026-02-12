// R&D Icon - Chevrons as orbital paths around center node
export function ResearchDevelopmentIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <style>
        {`
          @keyframes orbit-1 {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes orbit-2 {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }
          @keyframes pulse-node {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
          .orbit-1 {
            transform-origin: 32px 32px;
            animation: orbit-1 8s linear infinite;
          }
          .orbit-2 {
            transform-origin: 32px 32px;
            animation: orbit-2 12s linear infinite;
          }
          .node {
            animation: pulse-node 2s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .orbit-1, .orbit-2, .node { animation: none !important; }
          }
        `}
      </style>

      {/* Center node */}
      <circle
        cx="32"
        cy="32"
        r="4"
        fill="oklch(0.75 0.12 85)"
        className={active ? "node" : ""}
      />

      {/* Orbital paths */}
      <ellipse
        cx="32"
        cy="32"
        rx="14"
        ry="14"
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1"
        opacity={active ? 0.6 : 0.3}
        style={{ transition: "opacity 0.3s ease" }}
      />
      <ellipse
        cx="32"
        cy="32"
        rx="22"
        ry="22"
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1"
        opacity={active ? 0.4 : 0.2}
        style={{ transition: "opacity 0.3s ease" }}
      />

      {/* Orbiting chevrons (only rotate when active) */}
      <g className={active ? "orbit-1" : ""}>
        <path
          d="M 32 18 L 34 14 L 36 18 L 34 16.5 Z"
          fill="oklch(0.75 0.12 85)"
        />
      </g>

      <g className={active ? "orbit-2" : ""}>
        <path
          d="M 32 54 L 30 50 L 32 52.5 L 34 50 Z"
          fill="oklch(0.75 0.12 85)"
        />
      </g>
    </svg>
  );
}
