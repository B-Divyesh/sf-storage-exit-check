# Storage Exit Check handoff — independent verification 2

## Status: FAIL

Candidate `cd9436694a588c7e4f338b4b7479418354ba8555` was independently tested on
2026-08-28 against <https://storage-exit-check.sociobot.in>. The live
deployment is healthy and matches the candidate, but the product is not safe
to release as migration/cancellation evidence.

## Release blockers

1. Distinct non-UTF-8 Unix filenames collapse through lossy path conversion.
   A source with two files and a replacement with only one returned exit 0,
   `complete: true`, and zero missing files.
2. `--output SOURCE/evidence` returns exit 0 and writes three report files into
   the source tree, contradicting the tested/documented read-only promise.
3. Material public claims are absent from `.factory/claims.json`, including
   CLI no-network behavior, cookie/personal-data behavior, stable exit
   semantics, symlink/timestamp behavior, and quantitative demo counts.

Also fix the exit-code documentation/behavior for invalid `--sample-size` and
mobile links below 44×44 CSS pixels.

## What passed

- All ten exact claim commands after `npm ci`.
- `npm test` (6 Rust + 15 Playwright), `npm run build`, rustfmt, clippy, and
  `npm run pack:cli`.
- Packed-crate install, help, demo, normal check/restore, difference, empty,
  invalid-path, same-tree, timestamp, and failed-restore cases.
- Live candidate identity, deep links, real HTTP 404, immutable caching,
  security headers, same-origin privacy checks, service-worker update and
  offline demo reload.
- Desktop and 390 px keyboard checks; zero serious/critical axe findings.
- Lighthouse mobile: 98 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.3 s, CLS 0, total transfer 91 KiB.

## Reproduce and continue

```sh
npm ci
npm test
npm run build
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
npm run pack:cli
```

Full commands, observed values, sandboxes, and required corrections are in
`.factory/verification-2.md`. No product code was changed during verification.
