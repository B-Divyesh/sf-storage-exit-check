# Storage Exit Check handoff — polish round 2

## Status

All 29 cumulative findings are closed. The repair preserves the local Rust CLI
and botanical field-guide static site. The closure map is in
`.factory/polish-2.md`.

## What changed

- Added `check-write-boundary`, a Linux `LD_PRELOAD` trace that proves `check`
  writes only under its selected report folder and does not touch synthetic
  home or unrelated canary data.
- Broadened `no-upload` from the demo alone to every public app route, routed
  and static 404s, the printable report, and the evidence download.
- Removed the untestable README originality claim, standardized the public
  name as “demo,” added deployment ownership/instructions, and corrected the
  recovery limitation in Terms.
- Updated the catalog sentence to a verb-first, 75-character description.

## Verification

- Local: `npm test` passed (10 Rust + 33 Playwright tests); `npm run build`,
  `cargo fmt --all -- --check`, `cargo clippy --all-targets -- -D warnings`,
  and `npm run pack:cli` passed.
- Claims: all 24 exact commands from `.factory/claims.json` passed in a clean
  clone after `npm ci` at `4c540278a1fc908e6c9a2e03c357930c360e41a1`. See
  `.factory/evidence/clean-claim-tests-round2.log`.
- Build output: `dist/site/`; initial JavaScript is 12.62 kB (4.88 kB gzip)
  and CSS is 10.38 kB (3.34 kB gzip).
- Accessibility: the full route suite has zero Axe violations, keyboard
  navigation, visible focus, 44 px mobile controls, reduced-motion behavior,
  one h1/main, route titles, legal links, and static 404 metadata coverage.
- Live visual evidence: `.factory/evidence/polish-2-live-home-mobile.png`,
  `.factory/evidence/polish-2-live-demo-mobile.png`, and
  `.factory/evidence/polish-2-live-terms-desktop.png`.

## Deploy and handoff

The work order builds `dist/site/` with `npm ci && npm run build:site`. Param
Factory owns production deployment; the repository includes the required
`staticwebapp.config.json` route and 404 configuration. Commit `48e823a` was
pushed to `main`, and Static Web Apps deployment
`22cad997-1447-4f0f-bd8e-95c9b4e93d36` succeeded. Cold live checks then passed
at 390 px for `/`, `/?demo=1`, `/demo`, `/install`, `/privacy`, `/terms`, and
the intentional HTTP 404. They found one h1/main, zero Axe violations, no
overflow, same-origin requests only, empty browser storage, and working demo
reset/report/download actions. The deployed JS SHA-256 matches `dist/site`.

## Known gaps

None.
