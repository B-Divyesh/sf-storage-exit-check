# Storage Exit Check handoff — adversarial review 2

## Status

Review complete with verdict **FAIL**. The full report is
`.factory/review-2.md`. No product code was changed.

The first-read, demo, all 23 declared claim commands, full local suite, build,
formatting, Clippy, live routing, dead-link crawl, accessibility, mobile layout,
offline demo, and current live artifact all passed. Six findings remain: two
blocking claim-scope gaps, one unlisted README provenance claim, two README copy
or deployment-documentation defects, and one terms sentence defect.

## Verification performed

- Fresh clone: `/tmp/storage-exit-review2-4oAirc/repo` at
  `f59242ee4814401753f8742886a0de592e34f91a`.
- Every exact `.factory/claims.json` command: 23 passed, 0 failed.
- `npm test`: 10 Rust tests and 32 Playwright tests passed.
- `npm run build`: passed and produced `dist/site/`.
- `cargo fmt --all -- --check`: passed.
- `cargo clippy --all-targets -- -D warnings`: passed.
- Release CLI demo ran in `/tmp/storage-exit-review2-cli-OyTAJe/demo` and wrote
  the complete four-file evidence set.
- Live site checked cold at 390×844 and 1440×900.
- Live Axe scans found zero violations on every route and the 404 at both widths.
- Live demo reset, exit, offline reload, storage isolation, and request origin
  checks passed.
- Live HTML, JavaScript, and CSS hashes match the fresh build.

## Known gaps and next steps

Resolve F-2-1 through F-2-6 in `.factory/review-2.md`. In particular, trace a
normal `check` before promising it writes only to the report folder, and expand
the same-origin browser test to the whole public site or narrow that privacy
sentence. Then remove or test the README originality statement, standardize
“demo,” document deployment ownership, correct the terms sentence, and rerun
the entire review from clean browser contexts and a fresh clone.
