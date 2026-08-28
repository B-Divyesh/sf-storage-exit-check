# Storage Exit Check handoff — adversarial review 1

## Status: FAIL

Completed a read-only adversarial review of candidate
`10709198c2225b289fad6cea4f0068d3a43fff05` and the live deployment at
https://storage-exit-check.sociobot.in. Product code was not modified.

The cold first screen and one-click demo mechanics are clear. All 18 exact
claim commands pass from a clean clone, and the full test/build/format/Clippy
matrix passes. The review still records 23 findings. Blocking items cover weak
placeholder demo data, an overbroad restore-proof message, and public claims
without matching tagged evidence. Other findings cover one moderate Axe issue,
incomplete 404 metadata/shell consistency, metaphorical copy, jargon, and
inconsistent filesystem terms.

See [review-1.md](review-1.md) for exact quotes, evidence, sentence-by-sentence
copy counts, prior-finding confirmation, and concrete fixes.

## How to verify

```sh
npm ci
npm test
npm run build
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
```

The review also ran every command in `.factory/claims.json` separately from a
clean local clone at the candidate commit. Live checks used fresh Chromium
contexts at 390×844 and 1440×900, an Axe 4.10 scan, request/storage logging,
route and link crawling, route-focus/back checks, mobile target measurement,
and direct CLI demo execution in a fresh temp directory.

## Known gaps and next steps

No review step remains unperformed. The product is not acceptance-ready until
all findings in `.factory/review-1.md` are fixed and the full adversarial
checklist is rerun from scratch. The factory owns deployment; this review made
no infrastructure, release, DNS, or billing changes.
