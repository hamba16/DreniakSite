import Image from "next/image";
import markPath from "../../public/brand/mark-path.json";
import { FlowMark } from "./flow-mark";
export function Mark({
  className = "",
  stroke = false,
  flow = false,
}: {
  className?: string;
  stroke?: boolean;
  flow?: boolean;
}) {
  if (flow) return <FlowMark className={className} stroke={stroke} />;
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
  priority = false,
}: {
  dark?: boolean;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={`/brand/logo-${dark ? "dark" : "light"}.svg`}
      width={614}
      height={114}
      alt="Dreniak — Live the Future"
      className={`logo ${className}`}
      unoptimized
      priority={priority}
    />
  );
}
export function Motif({
  className = "",
  density = 250,
  flow = false,
}: {
  className?: string;
  density?: number;
  flow?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`motif ${flow ? "motif-flow" : ""} ${className}`}
      style={{ backgroundSize: `${density}px auto` }}
    >{flow && <FlowMark stroke />}</div>
  );
}
