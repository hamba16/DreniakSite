import markPath from "../../../public/brand/mark-path.json";

/** Dreniak catalogue artwork; supplied company identities are preserved within the frame. */
export function PartnerEmblem({ name, id }: { name: string; id: string }) {
  const clipId = `emblem-${Array.from(id).map(char => char.codePointAt(0)?.toString(16)).join("-")}`;
  const rosa = id === "ag-rosa";
  const udada = id === "nk-udada-foundation";
  const dbam = id === "dbam";
  const initials = name.trim().split(/\s+/).slice(0, 2).map(word => Array.from(word)[0]).join("").toUpperCase();
  return (
    <svg viewBox="0 0 360 360" fill="none" aria-hidden="true" focusable="false" data-partner-emblem={id}>
      <circle cx="180" cy="180" r="165" fill={rosa ? "#eee4de" : udada ? "#e9e5ed" : "#eadfdd"} />
      <circle cx="180" cy="180" r="164" stroke="currentColor" strokeOpacity=".15" />
      <path d="M180 5v18M180 337v18M5 180h18M337 180h18" stroke="currentColor" strokeOpacity=".35" />
      {rosa ? <>
        <circle cx="180" cy="173" r="130" fill="#080808" />
        <circle cx="180" cy="173" r="137" stroke="#b49a81" strokeOpacity=".65" />
        {/* Original asset from https://agluxurydev.com/ag-logo.svg. */}
        <image href="/partners/ag-luxury.svg" x="96" y="70" width="168" height="172" preserveAspectRatio="xMidYMid meet" />
        <path d="M128 251h104" stroke="#d7bba0" strokeOpacity=".45" />
        <text x="180" y="276" textAnchor="middle" fill="#f3e7d7" fontSize="16" letterSpacing="3">AG ROSA</text>
        <path d={markPath} transform="translate(169 316) scale(.18)" fill="#781e2c" />
      </> : udada ? <>
        <defs><clipPath id={clipId}><circle cx="180" cy="171" r="113" /></clipPath></defs>
        <rect x="75" y="75" width="210" height="210" rx="62" transform="rotate(45 180 180)" fill="#302a42" />
        <circle cx="180" cy="171" r="125" stroke="#c7adc0" strokeWidth="1" />
        <image href="/partners/nk-udada-foundation.png" x="35" y="26" width="290" height="290" clipPath={`url(#${clipId})`} />
        <path d={markPath} transform="translate(167 298) scale(.21)" fill="#c7adc0" />
      </> : dbam ? <>
        <circle cx="180" cy="180" r="137" fill="#fff" />
        <circle cx="180" cy="180" r="145" stroke="currentColor" strokeOpacity=".15" />
        {/* Enhanced from the official DBAM Social Care website logo. */}
        <image href="/partners/dbam-social-care-enhanced.png" x="26" y="117" width="308" height="126" preserveAspectRatio="xMidYMid meet" />
        <path d={markPath} transform="translate(169 306) scale(.18)" fill="#781e2c" />
      </> : <>
        <circle cx="180" cy="180" r="137" fill="#602130" />
        <circle cx="180" cy="180" r="126" stroke="#cfac98" strokeOpacity=".5" />
        <circle cx="180" cy="180" r="117" stroke="#cfac98" strokeOpacity=".25" strokeDasharray="2 7" />
        <path d={markPath} transform="translate(113 86) scale(1.17)" fill="#e4c7ab" />
        <path d="M109 230h142" stroke="#cfac98" strokeOpacity=".6" />
        <text x="180" y="267" textAnchor="middle" fill="#f4e9dd" fontSize="25" letterSpacing="5">{initials}</text>
        <text x="180" y="288" textAnchor="middle" fill="#f4e9dd" fontSize="10" textLength={name.length > 23 ? 170 : undefined} lengthAdjust="spacingAndGlyphs">{name}</text>
      </>}
      <path d="m306 56 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="currentColor" />
    </svg>
  );
}
