# Decoded 01 handoff — 19 November 2026
Status: implementation complete; final browser certification incomplete, as accepted by the user.
Branch: insights/after-the-connection. No merge or deployment performed by this task.

- Kit: public/brand/decoded/ — 12 SVG originals, chart tokens and RULES.md.
- Plates: assets/images/decoded-01/ — 2 generated originals; exact prompts in GENERATION.md.
- Exports: public/images/insights/ and public/newsletter/decoded-01/ — 9 raster assets; dimensions, alt and uses in assets.json.
- Integration: decoded-article.tsx, decoded-article.module.css and decoded-graphics.tsx; existing signup retained.
- Pass 1: non-brand colours 0; primacy violations 0 across 4 lockups; missing SVG descriptions 0.
- Pass 2: generations 2/4, retries 0; text/logos observed in plates 0; dimension mismatches 0; missing alt 0.
- Static graphic checks: incorrect bar lengths 0; contrast failures 0; minimum tested colour-pair contrast 8.34:1.
- Final TypeScript check: 0 errors. Repository lint and subsequent scoped lint: 0 errors.
- Full unit suite: 15 cases passed before one worker exhausted memory; its 2 cases passed in the isolated retry. Total verified: 17 passed, 0 outstanding assertion failures.
- Early browser sweeps observed 0 missing alt, broken images, page overflow, automated axe violations or external requests; these do not constitute final-source certification.
- The current article's 360px delayed-image probe found 0 image-size changes. Existing footer movement during streamed article loading was recorded separately; no claim of zero whole-page CLS.
- Final source verification at 360/768/1280 in both colour schemes remains incomplete after memory crashes and preview restarts. The 6 interaction test cases do not have a completed passing run against the final source.
- Four screenshots were captured and reviewed. Article captures and the mobile listing show the new imagery; listing-1280.png is STALE, from an older build on port 3000. It is retained for transparency, not approval evidence.
- evidence/browser.json is empty because the isolated final-source run did not complete its first context; earlier mixed-build results were deliberately discarded.
- No new package dependency was added. Existing Python fontTools provides Inter outlines; existing sharp creates exports. Brand folders had no index, so existing SVG sources and CSS tokens were used.
- Pass commits bc7e83d and 2992cd5 were created by this task. A concurrent process created f578065 (integration plus pre-existing work), d26749c and 8bb5f35 during verification; these were preserved. This prevents an exact three-commit handoff.
- Preview ports were not reliable at handoff; no verified preview URL is claimed. Production deployment, live Buttondown rendering and manual screen-reader behaviour were not verified.
- Resume: start an isolated local preview, set TEST_BASE_URL, run node scripts/certify-decoded-browser.mjs, then node node_modules/@playwright/test/cli.js test --config=scripts/playwright-decoded.config.mjs. Do not use --capture: the four-capture allowance is exhausted.
