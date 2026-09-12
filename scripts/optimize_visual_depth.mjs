// Usage: node scripts/optimize_visual_depth.mjs <generation-source-manifest.json>
// The manifest contains [{ id, source }]. Originals are preserved.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

async function main() {
  if (!process.argv[2])
    throw new Error("Pass the generation source manifest path.");
  const assets = JSON.parse(await fs.readFile(process.argv[2], "utf8"));
  const output = fileURLToPath(
    new URL("../public/images/visual-depth", import.meta.url),
  );
  await fs.mkdir(output, { recursive: true });
  const results = [];
  for (const asset of assets) {
    if (!/^(engineering|asset)-[a-z-]+$/.test(asset.id))
      throw new Error("Invalid asset ID");
    if (!asset.source) continue;
    const destination = path.join(output, `${asset.id}.webp`);
    await sharp(asset.source)
      .rotate()
      .resize({
        width: 1200,
        height: 800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 6 })
      .toFile(destination);
    const metadata = await sharp(destination).metadata();
    results.push({
      id: asset.id,
      width: metadata.width,
      height: metadata.height,
      bytes: (await fs.stat(destination)).size,
    });
  }
  console.log(JSON.stringify(results, null, 2));
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
