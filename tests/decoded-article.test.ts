import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { decodedArticle, decodedCitations } from "../src/content/decoded-01";

async function textFilesUnder(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await textFilesUnder(entryPath)));
    } else if (/\.(css|html|js|json|svg|txt|xml)$/i.test(entry.name)) {
      files.push(await readFile(entryPath, "utf8"));
    }
  }
  return files;
}

test("merged article citations cover each numbered source", () => {
  const references = new Set(
    Object.values(decodedCitations).flatMap((citation) => citation.sources),
  );
  assert.deepEqual([...references].sort(), [1, 2, 3, 4, 5, 6]);
  assert.equal(decodedArticle.slug, "after-the-connection-africa-electricity");
});

test("internal production notes and page artifacts are absent from public content", async () => {
  const forbidden = [
    "WEBSITE PRODUCTION NOTES",
    "INTERNAL",
    "page 2",
    "CMS. Publish through References",
    "Design. Use a credited",
    "Interaction. Present A and B",
    "Approval. Engineering and Asset Management",
    "Make the decision on page 2",
    "Log the question, geography and decision",
    "ISSUE 01 /",
  ];
  const content = JSON.stringify(decodedArticle);
  for (const phrase of forbidden) assert.equal(content.includes(phrase), false);

  const publicText = (await textFilesUnder(path.resolve("public"))).join("\n");
  for (const phrase of forbidden) assert.equal(publicText.includes(phrase), false);
});
