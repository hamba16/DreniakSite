import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import mark from "../../../../public/brand/mark-path.json";
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return ["parent", "engineering", "asset-management"].map(brand => ({ brand }));
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ brand: string }> },
) {
  const { brand } = await params;
  if (!["parent", "engineering", "asset-management"].includes(brand))
    return new Response("Not found", { status: 404 });
  const color =
    brand === "asset-management"
      ? "#0d3251"
      : brand === "engineering"
        ? "#991923"
        : "#101010";
  const logo = await readFile(
    path.join(
      process.cwd(),
      'public',
      'brand',
      brand === "engineering"
        ? "logo-white.svg"
        : "logo-dark.svg",
    ),
    "utf8",
  );
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 70px",
        background: color,
        color: "white",
        position: "relative",
      }}
    >
      <svg
        viewBox="0 0 122 105"
        width="650"
        height="560"
        style={{ position: "absolute", right: -160, top: 10, opacity: 0.07 }}
      >
        <path d={mark} fill="white" />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`}
        width={290}
        height={54}
        alt="Dreniak — Live the Future"
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 16, letterSpacing: 3, marginBottom: 25 }}>
          {brand === "parent"
            ? "ONE ORIGIN. TWO DISCIPLINES."
            : brand === "engineering"
              ? "DRENIAK ENGINEERING"
              : "DRENIAK ASSET MANAGEMENT"}
        </div>
        <div
          style={{
            fontSize: 66,
            lineHeight: 1.05,
            letterSpacing: -3,
            maxWidth: 900,
          }}
        >
          {brand === "parent"
            ? "Engineering the Longevity of Civilisation."
            : brand === "engineering"
              ? "Build. Connect. Deliver."
              : "Infrastructure understood. Value multiplied."}
        </div>
      </div>
      <div style={{ fontSize: 15, letterSpacing: 2 }}>
        DRENIAK.COM · UK / EAST AFRICA
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
