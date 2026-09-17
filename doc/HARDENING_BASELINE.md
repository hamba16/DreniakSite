# Performance & Quality Hardening Baseline

Recorded 2026-09-17 from commit `main` before application fixes.

## Environment and scope

- `npm install`: completed successfully; 419 packages audited, 0 vulnerabilities.
- `.env.local` contains Supabase URL, publishable key, service-role key, and TOTP master key. Secret values are intentionally not recorded.
- The checkout is not linked to a Vercel project, so production environment variables, deployed-preview Lighthouse results, Supabase region, and Vercel function region could not be queried.
- The second requested build with production credentials could not be independently reproduced: Next automatically loads the repository `.env.local`, and no linked Vercel project is available for a production-env export.
- Existing unrelated worktree changes at baseline: `package-lock.json` modified before this pass; `PERFORMANCE_HARDENING_PASS.md` supplied as an untracked task document.

## TypeScript

Command:

```text
npx tsc --noEmit
```

Output:

```text
(no output; exit code 0)
```

## ESLint

Command:

```text
npx eslint .
```

Output:

```text
D:\PROBOOK\DreniakSite\src\app\admin\[resource]\structured-editor.tsx
  28:26  error    Error: Calling setState synchronously within an effect can trigger cascading renders
  28:37  warning  React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

D:\PROBOOK\DreniakSite\src\app\admin\media\media-library.tsx
  16:26  error    Error: Calling setState synchronously within an effect can trigger cascading renders
  16:37  warning  React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
  45:81  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images.

D:\PROBOOK\DreniakSite\src\app\api\admin\[resource]\route.ts
  29:17  warning  '_id' is assigned a value but never used  @typescript-eslint/no-unused-vars

D:\PROBOOK\DreniakSite\src\components\division-pages.tsx
  37:3  warning  'insights' is defined but never used  @typescript-eslint/no-unused-vars

✖ 6 problems (2 errors, 4 warnings)
```

Exit code: 1.

## Unit tests

Command:

```text
npm test
```

Result: 7 passed, 1 failed.

The failing test is `tests/engineering-content.test.ts`: it reads the missing `ENGINEERING_UPDATE_BRIEF.md` and exits with `ENOENT`.

## Production build and route table

Command:

```text
npx next build
```

Output:

```text
▲ Next.js 16.3.4 (Turbopack)
- Environments: .env.local
✓ Running next.config.ts took 127ms
✓ Compiled successfully in 9.4s
Running TypeScript ... Finished TypeScript in 11.7s
Collecting page data using 7 workers
Generating static pages using 7 workers (38/38) in 4.2s

Route (app)
┌ ƒ /
├ ○ /_not-found
├ ƒ /[division]
├ ƒ /[division]/[page]
├   /[division]/[page]
│ ├ ● /engineering/about
│ ├ ● /engineering/approach
│ ├ ● /engineering/services
│ └ ● [+13 more paths]
├ ƒ /[division]/insights/[slug]
├ ƒ /[division]/projects/[slug]
├ ƒ /admin
├ ƒ /admin/[resource]
├ ƒ /admin/authenticators
├ ○ /admin/login
├ ƒ /admin/media
├ ƒ /api/admin/[resource]
├ ƒ /api/admin/auth/[action]
├ ƒ /api/admin/media/delete
├ ƒ /api/admin/media/upload
├ ƒ /api/enquiry
├ ƒ /api/newsletter
├ ○ /design-review
├ ƒ /og/[brand]
├ ○ /portal
├ ○ /privacy
├ ○ /robots.txt
├ ƒ /sitemap.xml
└ ○ /story

ƒ Proxy (Middleware)

○  (Static) prerendered as static content
●  (SSG) prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic) server-rendered on demand
```

The comparison build without Supabase process variables produced the same route table because Next loaded `.env.local` automatically. A clean no-env comparison therefore remains a blocked production check.

## End-to-end tests

Command:

```text
npx playwright test
```

The first invocation without a running server failed all 38 tests with `ERR_CONNECTION_REFUSED`. After starting the built app with `npm run start`, the meaningful baseline was:

```text
6 failed
32 passed (3.1m)
```

The six failures were:

- two Engineering content assertions expecting the absent `ENGINEERING_UPDATE_BRIEF.md`;
- two route/asset checks reporting browser-console errors;
- two conceptual-image checks expecting a direct static WebP URL while Next emitted an optimizer URL.

## Build output sizes

Measured after the baseline build:

```text
.next: 658,522,407 bytes (628.02 MB)
public: 6,852,716 bytes (6.54 MB)
assets: 109,462,654 bytes (104.39 MB)
doc: 47,594,357 bytes (45.39 MB)
image.png: 358,240 bytes
```

Root shared JavaScript:

```text
root shared JS (gz): 127KB
```

Largest emitted JavaScript chunks (gzip):

```text
33wmmxu2kkyqh.js gz=70KB
1q8qyxb2y3up8.js gz=53KB
2e_lrwr-bf1eq.js gz=43KB
0cz1d0mv5g_q7.js gz=39KB
```

## Lighthouse and deployed preview

Not recorded: Lighthouse requires a deployed preview URL and the repository contains no Lighthouse dependency or linked Vercel project. The six requested routes and mobile-throttled metrics must be captured once a preview URL is supplied or the Vercel project is linked.

## Baseline commit gate

This file is the pre-fix baseline and must be committed before application changes. The pre-existing `package-lock.json` modification and supplied `PERFORMANCE_HARDENING_PASS.md` are intentionally not included in that baseline commit.
