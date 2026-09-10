import Link from "next/link";
import { Mark } from "@/components/brand";
export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <Mark />
      <span className="eyebrow">404 / A DIFFERENT DIRECTION</span>
      <h1>
        Let’s find your
        <br />
        way forward.
      </h1>
      <p>This page could not be found.</p>
      <Link href="/#divisions" className="button">
        Explore Dreniak ↗
      </Link>
    </main>
  );
}
