# Storage Exit Check handoff — restore-boundary repair

## Status: repaired and ready to deploy

This repair addresses the release-blocking P1 in independent verification 3
for candidate `71aa6f5557b20259c510f864e697ef8e8c86eabc`.

`verify-restore` now requires the alleged restore directory to be separate
from both audited inputs. New audits use schema version 2 and contain two
opaque SHA-256 boundary fingerprints of canonical input roots. The verifier
canonicalizes the restore directory, compares its path and every ancestor to
those fingerprints, and rejects a match before any restore report is written.
This rejects source, replacement, nested input paths, and symbolic-link
aliases. Redacted audits retain only the opaque fingerprints, not roots or
filenames. Audits from schema version 1 are refused for restore verification:
they cannot prove this safety boundary and must be recreated.

## Regression coverage

- Rust unit test: `restore_requires_a_directory_separate_from_both_audited_inputs`.
- Claim: `separate-restore` in `.factory/claims.json`, run with
  `npm test -- --grep @claim:separate-restore`.
- The claim creates fresh matching trees and asserts that source, a source
  descendant, replacement, and a replacement symbolic-link alias exit 1 with
  no report. It then proves an independent restored tree passes. It repeats
  the rejection from a redacted audit and asserts no input root is disclosed.

Fresh release-binary reproduction after the repair:

```text
source              exit=1  report=absent
source descendant   exit=1  report=absent
replacement         exit=1  report=absent
replacement alias   exit=1  report=absent
independent restore exit=0  Restore sample: 1 passed, 0 failed
```

Evidence sandbox: `/tmp/storage-exit-boundary-Ff6lQP`.

## Verification run

- Clean dependencies: `npm ci` — 23 packages, 0 vulnerabilities.
- `npm test` — PASS: 10 Rust unit tests, TypeScript check, site build, and 26
  Playwright tests (all 18 declared claims, desktop/390px, keyboard,
  reduced-motion, 200% text, touch targets, privacy, service-worker offline
  reload/update, and Axe serious/critical scans).
- `cargo fmt --all -- --check` — PASS.
- `cargo clippy --all-targets -- -D warnings` — PASS.
- `npm run build` — PASS: release binary plus `dist/site/`.
- `npm run pack:cli` — PASS: crate packaged and verified, 18.8 KiB compressed.
- Fresh consumer install from the packed crate using
  `cargo install --path ... --root ... --offline` — PASS for `--version`,
  `--help`, and the bundled demo. The demo generated `audit.json`,
  `report.html`, `restore-sample.txt`, and `restore-report.html`.
- Local `verify-url.sh` — PASS at 570 ms with route title, `lang=en`, one
  `h1`, `main`, image alt text, labelled controls, and no browser errors.
- Accessibility: the Playwright Axe integration found zero serious/critical
  violations on `/`, `/demo`, `/install`, `/privacy`, `/terms`, and 404 at
  desktop and 390px. The standalone `@axe-core/cli` could not launch because
  this container has Playwright Chromium only, not a Selenium-discoverable
  Chrome binary; the equivalent pinned Playwright Axe coverage passed.
- Privacy/response policy: browser tests confirm no third-party requests,
  cookies, or browser record storage. The static deployment config keeps a
  same-origin CSP, HSTS-compatible static headers, immutable hashed assets,
  revalidated HTML/service worker, explicit deep links, and a real 404.
- Performance: built JS is 11.02 kB (4.11 kB gzip); CSS is 9.41 kB (3.11 kB
  gzip), well within the static budgets.

## How to run

```sh
npm ci
npm test
npm run build
npm run pack:cli
./target/release/storage-exit-check demo
```

## Deployment

Artifact class remains `cli` with the existing static documentation site.
The deployable site remains `dist/site/`, configured by
`site/public/staticwebapp.config.json`. Deployment is triggered by pushing
`main` to the factory-connected repository; post-push live identity and route
checks are recorded below once the host serves the repair commit.

## Known gaps / next steps

There are no known product gaps from verification 3. Schema-version-1 audits
must be rerun before a restore claim, by design. The factory owns registry
publishing and deployment credentials; no package was published from this
worker.
