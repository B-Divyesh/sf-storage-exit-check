# Independent verification 4 — PASS

**Candidate:** `ff8612ca69494643f57f51c4ad233bf8e81d77ae` on `main`  
**Live URL:** https://storage-exit-check.sociobot.in  
**Verified:** 2026-08-28 (UTC)  
**Scope:** clean checkout, publishable CLI package, and the live static site.

## Verdict

**PASS.** No release-blocking defects were found. The live deployment matches
the candidate's locally built static artifact byte-for-byte for the page shell,
service worker, two generated WebP assets, and hashed JavaScript and CSS.

## First read and demo

Cold load of the live home page showed, above the fold:

- **What:** “Check your storage move before cancelling.”
- **For whom:** “For people leaving cloud storage who need proof their local
  copy can restore.”
- **First action:** “Try it with sample data,” linking directly to `/demo`;
  its adjacent copy says a complete check and restore test is shown in one
  click.

This satisfies the plain-words first-read requirement. `/demo` is an isolated,
one-click recording of the shipped `storage-exit-check demo` data. It has the
required persistent “Demo — sample data, nothing is saved” banner, Reset demo,
and Start for real actions.

## Clean-checkout quality gates

`npm ci` installed 23 packages with 0 reported vulnerabilities. (As expected
for a clean clone before dependencies are installed, an initial claim-command
probe could not find `tsc`; all required commands below were then run after the
locked install.)

- Every exact command in `.factory/claims.json` passed after `npm ci`:
  `demo-complete`, `no-upload`, `offline-cli`, `mit-free`, `demo-isolated`,
  `read-only`, `hash-differences`, `redacted-report`, `repeatable-sample`,
  `printable-report`, `path-identity`, `incomplete-audit`,
  `separate-restore`, `symlink-policy`, `timestamp-policy`,
  `content-outcomes`, `exit-semantics`, and `json-output`.
- `npm test` — PASS: 10 Rust unit tests and 26 Playwright tests, including all
  claims, desktop/mobile, keyboard, touch-target, reduced-motion, text-zoom,
  privacy, service-worker offline reload, and Axe coverage.
- `cargo fmt --all -- --check` — PASS.
- `cargo clippy --all-targets -- -D warnings` — PASS.
- `npm run build` — PASS; produced release CLI and `dist/site/`.
- `npm run pack:cli` — PASS; package verification passed (18.8 KiB compressed).
- `.factory/copy-audit.md` is present: average 5.3 words, longest landing
  sentence 13 words, no flagged banned wording.

## CLI consumer exercise

Installed the packaged crate into a fresh consumer root with:

```sh
cargo install --path target/package/storage-exit-check-0.1.0 --root <fresh-root> --offline
```

The installed `storage-exit-check 0.1.0` completed `demo --output <fresh-dir>`
and generated `audit.json`, `report.html`, `restore-sample.txt`, and
`restore-report.html`. Independent normal/error/recovery checks observed:

- changed file: JSON result reported one changed file and exited `2`;
- `--sample-size 0`: rejected with a useful validation message and exited `64`;
- attempting restore verification against the audited source: rejected before
  a report was written and exited `1`;
- copying matching files into a separate restore directory then verified both
  samples successfully (`passed: 2`, `failed: 0`).

The executable has useful `--help`, `check --help`, `verify-restore --help`,
global `--json`, and stable documented exit semantics.

## Live-site checks

- Factory `verify-url.sh` — PASS in
  `/tmp/storage-exit-verify-url-OZioyZ`: HTTP 200, 626 ms cold browser load,
  title, `lang=en`, one `h1`, `main`, image alt text, labelled controls, and no
  console/page errors.
- Live routes `/`, `/demo`, `/install`, `/privacy`, and `/terms` each returned
  200. An unknown route returned a styled HTTP 404. The one external Factory
  link returned 200; mailto links are explicit exceptions.
- Playwright Axe scans on `/`, `/demo`, `/install`, `/privacy`, `/terms`, and
  the 404 found **0 serious or critical** violations. At 390 px, `/demo` had
  no horizontal overflow; Reset demo was 104×55 px and Start for real 89×44 px.
- Keyboard: the visible 3 px ochre focus ring was measured on the skip link;
  Tab order reached all header, primary, and footer controls. Enter on Skip to
  content moved focus to `#main`. Reduced-motion and 200% text tests passed in
  the local production suite.
- Privacy: a fresh Playwright demo flow (load plus Reset demo) made only
  same-origin requests (`/demo` and two local assets), set no cookies, and
  logged no console/page errors. A fresh home-page load likewise requested only
  the product origin. No sign-in, analytics, third-party request, or product
  server-side endpoint exists; therefore no API rate allowance applies.
- Service worker: registration/update succeeded; after activation controlled
  `/demo`, an offline reload returned 200 with the demo heading intact.
- Headers: all checked HTML routes had CSP limited to `self`, nosniff,
  strict-origin referrer policy, permissions policy, and HSTS. HTML and
  `sw.js` revalidate; the hashed JavaScript is `public, max-age=31536000,
  immutable`.
- Budgets: built JavaScript 11.02 kB (4.11 kB gzip), CSS 9.41 kB (3.11 kB
  gzip); both are below the specified budgets.

## Deployment identity

Fresh local build and live SHA-256 matched for `index.html`, `404.html`,
`sw.js`, `field-guide-roots-fb69c545.webp`, `og-image-b1a471d6.webp`,
`assets/index-DEtE1hI_.js`, and `assets/index-CX7SP9FP.css`. This is direct
evidence that production is candidate `ff8612c`, not merely a prior repair
deployment.

## Defects

None found (P0/P1/P2/P3: 0).
