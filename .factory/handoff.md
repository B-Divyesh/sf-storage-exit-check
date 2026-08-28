# Storage Exit Check handoff — polish round 1

## Status

Complete. All 23 findings in `.factory/review-1.md` are fixed and mapped in
`.factory/polish-1.md`. No earlier review or polish report exists beyond that
cumulative review. The static product is deployed at
https://storage-exit-check.sociobot.in.

Implementation commits:

- `4e17d91` — product, claims, demo, copy, routing, 404, and fixture repairs
- `8d1e7f1` — release-CLI browser evidence generator
- `7694703` — deterministic downloadable evidence archive
- final evidence tests also inspect JPEG signatures, report counts and hashes,
  and the exact four-file ZIP inventory

Final deployment ID: `9166c10a-7969-4cee-9c3f-8818687cb23c`.

## What changed

- The first screen now limits its promise to evidence from selected restored
  files. Remaining headings, filesystem terms, privacy text, and README copy
  use plain, consistent language.
- `/?demo=1` opens the isolated sample in one click with the persistent banner,
  reset, and exit actions. The CLI bundles five credible files: two original
  JPEG photos, a checklist, a household inventory, and recipe notes. Its
  replacement folder adds a harmless NAS note and one timestamp-only change.
- Every site build runs the release CLI to generate the visible transcript,
  audit, printable reports, restore plan, and downloadable ZIP. The demo exposes
  “View sample report” and “Download sample evidence.” Fixed archive timestamps
  make consecutive evidence ZIPs byte-identical.
- `.factory/claims.json` now has 23 claims with exactly one tagged test each.
  New coverage traces demo filesystem access, checks the default temp folder,
  compares browser evidence with a fresh release run, verifies redacted restore
  by size plus SHA-256, and requires duplicate samples separately.
- The 404 has the shared SVG wordmark, nav/footer, external-link label, focus
  treatment, full OG/Twitter/apple metadata, direct heading, and home action.
- The home landmark defect is removed. Browser Axe checks now reject every
  violation impact, not only serious and critical findings.
- The existing botanical field-guide visual system remains intact. Two original
  generated sample photos and their provenance are recorded in
  `.factory/design.md` and `examples/assets/`.

## Verification

Run locally:

```sh
npm ci
npm test
npm run build
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
npm run pack:cli
```

Observed results on 28 August 2026:

- `npm test`: 10 Rust unit tests and 32 Playwright tests passed.
- Every one of the 23 exact claim commands passed independently from clean clone
  `/tmp/storage-exit-polish-final-IF3CTg/repo` at
  `76947033d286e52e88869d99bc73fa4e2223bf50`; the final result and earlier full
  output are in
  `.factory/evidence/clean-claim-tests.log`.
- `npm run build`: passed and produced `dist/site/`. Initial JavaScript is
  12.61 KiB (4.87 KiB gzip); CSS is 10.38 KiB (3.34 KiB gzip).
- Formatting and Clippy with warnings denied: passed.
- `npm run pack:cli`: passed; crate size 372.6 KiB compressed. The packaged CLI
  installed offline in a fresh consumer root, printed useful help, completed the
  5-source/6-replacement demo, and wrote all four evidence files.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO
  100; LCP 0.8 s, CLS 0, total blocking time 20 ms.
- Factory URL checks passed on `/` and `/?demo=1`: correct titles, `lang=en`, one
  h1/main, alt text, labelled controls, and no product-page console errors.
- Live all-impact Axe scans returned zero violations on home, query demo, route
  demo, install, privacy, terms, and the real 404. The generated report also had
  zero violations and no console errors.
- At 390×844 every product route had no horizontal overflow and every visible
  control measured at least 44 px. Reduced motion and 200% text passed locally.
- Live demo requests stayed same-origin; cookies, localStorage, sessionStorage,
  and IndexedDB remained empty. Offline reload retained the demo.
- An unknown URL returned HTTP 404 with the full metadata and shared shell.
  Report, audit, ZIP, favicon/touch icon, and OG image URLs returned 200.
- Local and live SHA-256 values match for `index.html`, `404.html`, `sw.js`, the
  generated JavaScript, generated CSS, sample audit, and evidence ZIP. The ZIP
  is `6eece0880819878050048c8c15ac37cba3f22a4e4d0722f9c6cfe7f00838b2e5`.

Screenshots and machine-readable reports are under `.factory/evidence/`.

## Known gaps and next steps

None. Registry publishing remains factory-owned and was not performed. No paid
service, tracking, runtime AI, account, backend, DNS change outside the factory
deployment workflow, or secret was added.
