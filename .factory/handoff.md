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
  clone after `npm ci`.
- Build output: `dist/site/`; initial JavaScript is 12.62 kB (4.88 kB gzip)
  and CSS is 10.38 kB (3.34 kB gzip).
- Accessibility: the full route suite has zero Axe violations, keyboard
  navigation, visible focus, 44 px mobile controls, reduced-motion behavior,
  one h1/main, route titles, legal links, and static 404 metadata coverage.
- Visual evidence: `.factory/evidence/polish-2-home-mobile.png`,
  `.factory/evidence/polish-2-demo-mobile.png`, and
  `.factory/evidence/polish-2-terms-desktop.png`.

## Deploy and handoff

The work order builds `dist/site/` with `npm ci && npm run build:site`. Param
Factory owns production deployment; the repository includes the required
`staticwebapp.config.json` route and 404 configuration. The final commit and
post-deploy cold live checks are recorded below once push/deployment completes.

## Known gaps

None.
