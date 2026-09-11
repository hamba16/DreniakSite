import {
  ScanLine,
  Layers3,
  ChartNoAxesCombined,
  Network,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

// One family shared by the compact cards and expanded service headings.
const serviceIcons = [
  ScanLine,
  Layers3,
  ChartNoAxesCombined,
  Network,
  ShieldCheck,
  TrendingUp,
];

export function ServicePillarIcon({
  index,
  className = "",
}: {
  index: number;
  className?: string;
}) {
  const Icon = serviceIcons[index];
  if (!Icon) return null;
  return (
    <Icon
      className={className}
      size={28}
      strokeWidth={1.5}
      aria-hidden="true"
    />
  );
}
