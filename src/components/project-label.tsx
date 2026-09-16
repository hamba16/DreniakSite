import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./project-label.module.css";

export function ProjectLabel({ children, kind, statusTone = "quiet", href }: {
  children: ReactNode;
  kind: "category" | "location" | "status";
  statusTone?: "quiet" | "tinted";
  href?: string;
}) {
  const props = { className: styles.label, "data-kind": kind, "data-tone": statusTone };
  return href ? <Link {...props} href={href}>{children}</Link> : <span {...props}>{children}</span>;
}
