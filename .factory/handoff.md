# Storage Exit Check handoff — independent verification 2

## Status: FAIL

Candidate `cd9436694a588c7e4f338b4b7479418354ba8555` was independently tested on
2026-08-28 against <https://storage-exit-check.sociobot.in>. The deployment is
healthy and matches the candidate, but this product is not safe to release as
migration/cancellation evidence.

## Release blockers

1. Distinct non-UTF-8 Unix filenames collapse through lossy path conversion. A
   source with two files and a replacement with one returned exit 0,
   `complete: true`, and zero missing files.
2. `check` accepts an output directory inside an input tree. It exits 0 while
   adding three evidence files to that input, contradicting the read-only
   contract and declared claim.
3. An audit with `complete: false` and a known missing file can still yield
   `verify-restore` exit 0 and a report headed “Restore sample passed.”
4. `.factory/claims.json` omits tagged tests for material public promises,
   including complete CLI no-network coverage, cookie/personal-data behavior,
   symlink/timestamp rules, exit semantics, and quantitative demo counts.

Secondary defects: invalid `--sample-size` shares documented content-difference
exit code 2; multiple mobile links are below 44×44 CSS pixels; and
`.factory/demo.md` gives the wrong destination for **Start for real**.

## What passed

- All ten exact claim commands after `npm ci`.
- `npm test` (6 Rust + 15 Playwright), `npm run build`, rustfmt, clippy, and
  `npm run pack:cli`.
- Packed-crate install, help, demo, normal check/restore, difference, boundary,
  invalid-input, JSON, wrong-restore, and missing-restore cases.
- Live candidate identity, deep links, HTTP 404, immutable caching, security
  headers, same-origin privacy checks, service-worker update, and offline demo.
- Desktop and 390 px keyboard checks; zero serious/critical axe findings.
- Lighthouse mobile: 96 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.3 s, CLS 0, total transfer 92,796 bytes.

## Reproduce and continue

```sh
npm ci
# Run each command in .factory/claims.json independently.
npm test
npm run build
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
npm run pack:cli
```

Full commands, observed values, sandboxes, and required corrections are in
`.factory/verification-2.md`. No product code was changed during verification.
