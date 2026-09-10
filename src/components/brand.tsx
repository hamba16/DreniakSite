import Image from "next/image";
import markPath from "../../public/brand/mark-path.json";
export function Mark({
  className = "",
  stroke = false,
}: {
  className?: string;
  stroke?: boolean;
}) {
  return (
    <svg viewBox="0 0 122 105" aria-hidden="true" className={className}>
      <path
        d={markPath}
        fill={stroke ? "none" : "currentColor"}
        stroke={stroke ? "currentColor" : undefined}
        strokeWidth={stroke ? 0.7 : undefined}
        pathLength="1"
      />
    </svg>
  );
}
export function Logo({
  dark = true,
  className = "",
}: {
  dark?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={`/brand/logo-${dark ? "dark" : "light"}.svg`}
      width={614}
      height={114}
      alt="Dreniak — Live the Future"
      className={`logo ${className}`}
      priority
    />
  );
}
export function Motif({
  className = "",
  density = 250,
}: {
  className?: string;
  density?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`motif ${className}`}
      style={{ backgroundSize: `${density}px auto` }}
    />
  );
}
