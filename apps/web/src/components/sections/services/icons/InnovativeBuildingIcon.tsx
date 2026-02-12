// Innovative Building Icon - Chevron as building roofline with grid
export function InnovativeBuildingIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Building outline */}
      <path
        d="M 16 52 L 16 28 L 32 16 L 48 28 L 48 52 Z"
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Chevron roof */}
      <path
        d="M 12 28 L 32 14 L 52 28 L 48 28 L 32 18 L 16 28 Z"
        fill={active ? "oklch(0.75 0.12 85)" : "none"}
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1.5"
        strokeLinejoin="miter"
        style={{ transition: "fill 0.3s ease" }}
      />

      {/* Grid lines (illuminate when active) */}
      <line
        x1="32"
        y1="28"
        x2="32"
        y2="52"
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1"
        opacity={active ? 1 : 0.3}
        style={{ transition: "opacity 0.3s ease" }}
      />
      <line
        x1="24"
        y1="32"
        x2="24"
        y2="52"
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1"
        opacity={active ? 0.8 : 0.2}
        style={{ transition: "opacity 0.3s ease" }}
      />
      <line
        x1="40"
        y1="32"
        x2="40"
        y2="52"
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1"
        opacity={active ? 0.8 : 0.2}
        style={{ transition: "opacity 0.3s ease" }}
      />
      <line
        x1="16"
        y1="38"
        x2="48"
        y2="38"
        stroke="oklch(0.75 0.12 85)"
        strokeWidth="1"
        opacity={active ? 1 : 0.3}
        style={{ transition: "opacity 0.3s ease" }}
      />
    </svg>
  );
}
