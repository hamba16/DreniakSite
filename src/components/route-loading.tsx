import { LoaderCircle } from "lucide-react";

export function RouteLoading({ label = "Loading page content" }: { label?: string }) {
  return (
    <main id="main" className="page-container" aria-busy="true">
      <div className="page-intro">
        <span className="eyebrow">DRENIAK</span>
        <h1>{label}</h1>
        <p role="status">
          Please wait <LoaderCircle className="spin" size={18} aria-hidden="true" />
        </p>
      </div>
    </main>
  );
}
