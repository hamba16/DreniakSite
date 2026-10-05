import markPath from "../../../public/brand/mark-path.json";

/** Partner identities displayed without decorative frames or clipping. */
export function PartnerEmblem({ name, id }: { name: string; id: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(word => Array.from(word)[0]).join("").toUpperCase();
  return (
    <svg viewBox="0 0 240 180" fill="none" aria-hidden="true" focusable="false" data-partner-emblem={id}>
      {id === "ag-rosa" ? <>
        <rect x="50" y="20" width="140" height="140" rx="3" fill="#080808" />
        {/* The pale original mark needs a dark backing to remain legible. */}
        <image href="/partners/ag-luxury.svg" x="67" y="36" width="106" height="108" preserveAspectRatio="xMidYMid meet" />
      </> : id === "nk-udada-foundation" ? (
        <image href="/partners/nk-udada-foundation.png" x="30" y="0" width="180" height="180" preserveAspectRatio="xMidYMid meet" />
      ) : id === "dbam" ? (
        <image href="/partners/dbam-social-care-enhanced.png" x="0" y="41" width="240" height="98" preserveAspectRatio="xMidYMid meet" />
      ) : <>
        <path d={markPath} transform="translate(86 25) scale(.6)" fill="currentColor" />
        <text x="120" y="126" textAnchor="middle" fill="currentColor" fontSize="24" letterSpacing="4">{initials}</text>
      </>}
    </svg>
  );
}
