# Storage Exit Check handoff

## Shipped

Version 0.1.0 is a complete read-only storage migration audit flow.

- `storage-exit-check check SOURCE REPLACEMENT` walks both trees without
  following symbolic links. It compares regular files by size and SHA-256.
- The check explains missing, changed, extra, type-changed, and link-changed
  items. Timestamp-only differences are counted without failing content.
- Each evidence packet contains `audit.json`, `report.html`, and
  `restore-sample.txt`. The sample is derived from the matching manifest and is
  repeatable for the same content.
- `storage-exit-check verify-restore AUDIT RESTORED` verifies the sampled paths,
  sizes, and hashes. Redacted audits find restored samples by size and hash
  without exposing paths.
- `--redact` removes source roots, replacement roots, filenames, and directory
  paths from every evidence file.
- `--json` provides scriptable check and restore results. Exit codes distinguish
  tool errors, migration differences, and restore failures.
- `storage-exit-check demo` creates a temporary five-file sandbox, runs the real
  audit engine, restores three samples, and writes both reports.
- The static site includes the landing page, direct `/demo` and `?demo=1`
  sandbox entries, install guide, privacy, terms, and a styled 404.
- The botanical field-guide identity uses original generated art, an archival
  palette, specimen labels, a responsive 390 px layout, and reduced-motion
  fallbacks. Asset provenance and the exact prompt are in `.factory/design.md`.

## Run and build

```sh
npm install
npm test
npm run build
```

The exact deployment build command is `npm run build`. The static deployment
root is `dist/site/`, with `index.html` at that root. The release CLI is
`target/release/storage-exit-check`.

Package without publishing:

```sh
npm run pack:cli
```

This creates `target/package/storage-exit-check-0.1.0.crate`. Factory registry
credentials were not used.

## Verification completed

- `cargo fmt --all`: passed.
- `cargo clippy --all-targets -- -D warnings`: passed.
- `npm test`: passed, with 5 Rust tests and 12 Playwright tests.
- Every ID in `.factory/claims.json` has one tagged sandbox test.
- Playwright axe checks found no serious or critical issues across home, demo,
  install, privacy, terms, and not-found routes.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ …`: passed. It found one
  title, `lang="en"`, one h1, a main landmark, no missing alt text, no unlabeled
  buttons, and no console errors. Observed local load time was 538 ms.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100. FCP 1.0 s, LCP 1.7 s, CLS 0, TBT 0 ms. Lab Lighthouse does not
  report INP without field interactions.
- Initial compressed assets: JS 4.08 KB, CSS 3.07 KB, hero WebP 83.7 KB.
- `npm audit --omit=dev`: 0 vulnerabilities.
- `cargo package`: verified a 55.4 KiB package.
- A fresh `git archive` checkout passed `npm ci`, `npm test`, and
  `npm run build`; `dist/site/index.html` was present.
- Desktop and 390×844 screenshots were reviewed manually.

## Privacy and safety

The CLI has no networking dependency, telemetry, credential handling, delete
command, or subscription integration. It writes only to an explicit evidence
directory or its demo temp directory. Reports can expose filenames and hashes,
so the install guide and CLI document `--redact`.

The site loads no third-party runtime scripts, fonts, trackers, or analytics. It
uses no cookies or demo storage. Its service worker caches only static site
assets. CSP, referrer, content-type, and permissions headers are included in the
Static Web Apps configuration.

## Known gaps

- Hashing is deliberately thorough and can take time on large trees. Version
  0.1.0 does not cache hashes or show a progress bar.
- The manifest does not compare permissions, ownership, extended attributes,
  sparse-file allocation, or hard-link identity.
- Path matching follows each platform's normal filename rules. Moving between
  case-sensitive and case-insensitive filesystems can still require review.
- A sampled restore is evidence, not proof of full disaster recovery. Every
  generated report says this.
- Release binaries and the static site still need factory publication. No
  registry package, release, infrastructure, DNS, or billing state was changed.

## Next steps

The factory can publish release binaries, deploy `dist/site/`, and add links to
the release artifacts. A later version could add hash caching and progress
output without changing the evidence schema.
