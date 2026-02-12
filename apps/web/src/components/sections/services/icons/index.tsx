// Service icon switcher component
import { EnergyEfficiencyIcon } from "./EnergyEfficiencyIcon";
import { RenewableEnergyIcon } from "./RenewableEnergyIcon";
import { PlantEngineeringIcon } from "./PlantEngineeringIcon";
import { InnovativeBuildingIcon } from "./InnovativeBuildingIcon";
import { ResearchDevelopmentIcon } from "./ResearchDevelopmentIcon";
import { GreenFinanceIcon } from "./GreenFinanceIcon";

interface ServiceIconProps {
  iconId: string;
  active: boolean;
}

export function ServiceIcon({ iconId, active }: ServiceIconProps) {
  switch (iconId) {
    case "energy-efficiency":
      return <EnergyEfficiencyIcon active={active} />;
    case "renewable-energy":
      return <RenewableEnergyIcon active={active} />;
    case "plant-engineering":
      return <PlantEngineeringIcon active={active} />;
    case "innovative-building":
      return <InnovativeBuildingIcon active={active} />;
    case "research-development":
      return <ResearchDevelopmentIcon active={active} />;
    case "green-finance":
      return <GreenFinanceIcon active={active} />;
    default:
      // Fallback: simple chevron
      return (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M 20 40 L 32 20 L 44 40 L 40 40 L 32 28 L 24 40 Z"
            fill={active ? "oklch(0.75 0.12 85)" : "none"}
            stroke="oklch(0.75 0.12 85)"
            strokeWidth="1.5"
          />
        </svg>
      );
  }
}
