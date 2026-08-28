# Storage Exit Check handoff — QA repair 2

## Status: repaired, verified, and ready to deploy

This repair starts from verifier report commit
`5ed0a96aad469a87d08e66a32536f177bbf89890` for candidate
`cd9436694a588c7e4f338b4b7479418354ba8555`. Every release-blocking and
secondary finding in `.factory/verification-2.md` is addressed. The artifact
remains a Rust CLI with a static Vite documentation/demo site.

## Corrections and regression evidence

1. Manifest paths no longer use lossy Unicode conversion. The CLI rejects a
   non-UTF-8 filename or link target with exit 1 and a rename instruction,
   before it writes evidence. Rust and `@claim:path-identity` regressions use
   the verifier's distinct raw-byte `80`/`81` filename case.
2. `check` resolves the proposed output through existing symbolic-link aliases
   before any snapshot or write. It rejects an output equal to or beneath
   either input. `@claim:read-only` covers both trees, an equal path, nested
   paths, a symlink alias, and the default relative output while the process is
   inside the source.
3. `verify-restore` refuses every audit with `complete: false`. It exits 3,
   prints `Restore verification blocked`, and writes the same unmistakable
   verdict into the HTML report. `@claim:incomplete-audit` recreates the
   verifier's matching-plus-missing case end to end.
4. `.factory/claims.json` now lists 17 material promises. Each ID occurs in
   exactly one tagged test. New coverage observes CLI socket/DNS attempts,
   cookies and browser stores, exact demo counts, symlink traversal, timestamp
   handling, extra/empty/no-match outcomes, all exit classes, JSON output, path
   identity, and incomplete-audit refusal. Default path/hash disclosure is
   also checked alongside redaction.
5. Invalid command syntax now exits 64, distinct from content differences at
   exit 2. The README and install guide document all five exit classes.
6. Mobile header, demo, footer, prose, and standalone-404 links now have at
   least 44 by 44 CSS pixel targets. The 390 px regression measures every
   visible link and button on all application routes.
7. `.factory/demo.md` now correctly says **Start for real** returns home. The
   service-worker cache advanced to `storage-exit-check-v3` so old static shell
   entries are removed on activation.

## Verification performed

The original three P1 behaviors were reproduced before repair in
`/tmp/storage-exit-repro-R0z169`: the two raw filenames collapsed to one and
exited 0; output inside source added three files and exited 0; and an incomplete
audit produced `Restore sample passed` with exit 0.

From a clean `npm ci` (23 packages, zero vulnerabilities), these passed on
2026-08-28:

```sh
npm test
npm run build
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
npm run pack:cli
```

`npm test` passed 9 Rust tests and 25 Playwright tests. This includes desktop
and 390×844 routes, keyboard focus, 44 px targets, reduced-motion behavior,
service-worker update/offline reload, and axe scans with zero serious or
critical findings. TypeScript checking and the production site build also
passed. Every exact command in `.factory/claims.json` passed independently;
logs are `/tmp/storage-exit-claim-1.log` through
`/tmp/storage-exit-claim-17.log`.

The release build produced `target/release/storage-exit-check` and
`dist/site/`. The packed crate is 18,417 bytes and contains both five-file
`examples/` trees. A fresh consumer install at
`/tmp/storage-exit-consumer-5Dr5D9` passed `--help`, `--version`, and the real
demo; it wrote both reports and verified 3 of 3 restored files.

The Static Web Apps emulator returned 200 for `/demo`, HTTP 404 for an unknown
path, one-year immutable caching for hashed assets, and revalidation for HTML
and `sw.js`. `/opt/fleet/lib/verify-url.sh` passed with no console errors in
590 ms; desktop and mobile screenshots plus JSON are in
`/tmp/storage-exit-verify-local`. Local Lighthouse 12.8.2 mobile scored 100 for
performance, accessibility, best practices, and SEO: FCP 0.9 s, LCP 1.6 s,
CLS 0, and TBT 0 ms. Built gzip size is 4.11 KiB JavaScript and 3.11 KiB CSS;
the LCP image is 83,712 bytes.

## Deploy

Deployment remains the existing static class. Build with `npm run build`, then
run `/opt/fleet/lib/deploy-static.sh storage-exit-check dist/site`. After
deployment, verify live artifact hashes, response policies, routes, privacy,
offline behavior, and the production identity at
`https://storage-exit-check.sociobot.in`.

## Known limits

The report is evidence for a decision, not proof of disaster recovery. The CLI
does not compare permissions, ownership, extended attributes, sparse-file
allocation, or hard-link identity. It intentionally rejects non-UTF-8 names so
it cannot misidentify them. No telemetry, external runtime API, account,
payment, or third-party asset was added.
