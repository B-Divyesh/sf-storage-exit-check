# Independent verification 3 — FAIL

**Candidate:** `71aa6f5557b20259c510f864e697ef8e8c86eabc`  
**Live URL:** <https://storage-exit-check.sociobot.in>  
**Verified:** 2026-08-28 UTC

## Verdict: FAIL — sampled-restore evidence can be falsely passed without a restore

The prior deployment-only concern is not reproducible. The live static site is
available and its deployable files match this candidate byte for byte. The
candidate nevertheless fails the product contract because `verify-restore`
accepts either original input tree as its restored directory. It can produce a
passing printable restore report while testing only the still-existing source
or replacement copy, rather than a recovered copy in a separate directory.

## First-read gate — PASS

On a cold 1440px and 390px load, the first screen says it **checks a storage
move before cancelling**, identifies **people leaving cloud storage who need
proof their local copy can restore**, and presents **Try it with sample data**
as the primary first action. The adjacent text says that it will show a
complete check and restore test. The one-click `/demo` page shows the five-file
comparison, zero content differences, three verified files, and the persistent
`Demo — sample data, nothing is saved` banner with Reset demo and Start for
real controls.

## Release-blocking finding

### P1 — restore verification accepts the original source or replacement tree

The real job is to prove a **sampled restore**, not to rehash a file that was
never recovered. The README explicitly instructs users to restore into a
separate empty directory and not copy from the source. The CLI does not enforce
that boundary even though its unredacted audit records both canonical input
roots.

Fresh release-binary reproduction (`target/release/storage-exit-check`):

```text
CHECK_EXIT=0
VERIFY_USING_ORIGINAL_SOURCE_EXIT=0
VERIFY_USING_REPLACEMENT_EXIT=0

Restore sample: 2 passed, 0 failed
Report: .../evidence/restore-report.html
```

The source and replacement each contained two matching files. I ran `check`,
then supplied `source` as the `restored` argument, without creating a restore
directory or copying any files. The command returned 0 and the generated HTML
report says `Restore sample passed` and `2 passed · 0 failed`. Supplying the
replacement tree returned 0 as well. Evidence sandbox:
`/tmp/storage-exit-source-as-restore-UM1HQI`.

This can create cancellation-ready-looking evidence without exercising the
recovery step that the brief makes central. Refuse a canonical restored path
that equals, is beneath, or aliases either audited input tree. Redacted audits
need a non-disclosing way to preserve the same boundary, or a safe explicit
workflow that cannot claim a sampled restore without a separate tree. Add a
tagged claim test that demonstrates rejection of source, replacement, and
symbolic-link aliases before a success report can be emitted.

## Claims contract

`.factory/claims.json` exists and declares 17 claims. From this clean candidate
checkout, `npm ci` succeeded (23 packages, 0 npm vulnerabilities), then every
listed exact `npm test -- --grep @claim:<id>` command was run. All passed:

| Claim IDs | Result |
| --- | --- |
| `demo-complete`, `no-upload`, `offline-cli`, `mit-free`, `demo-isolated` | PASS |
| `read-only`, `hash-differences`, `redacted-report`, `repeatable-sample` | PASS |
| `printable-report`, `path-identity`, `incomplete-audit`, `symlink-policy` | PASS |
| `timestamp-policy`, `content-outcomes`, `exit-semantics`, `json-output` | PASS |

The P1 behavior above is not a declared claim test. It contradicts the public
restore instruction and the brief's requirement for recoverability evidence.

## Local build, package, and CLI QA

- `npm test`: **PASS** — 9 Rust unit tests and 25 Playwright tests.
- `npm run build`: **PASS** — release binary and `dist/site/` produced.
- `cargo fmt --all -- --check`: **PASS**.
- `cargo clippy --all-targets -- -D warnings`: **PASS**.
- `npm run pack:cli`: **PASS** — `target/package/storage-exit-check-0.1.0.crate`, 18 KiB.
- Fresh consumer: unpacked that crate, installed it with `cargo install --path
  ... --root ... --offline`, and exercised `--version`, `--help`, and `demo`.
  The installed `0.1.0` binary completed a five-file comparison and a 3-of-3
  restore sample, producing `audit.json`, `report.html`, `restore-sample.txt`,
  and `restore-report.html`. Consumer evidence:
  `/tmp/storage-exit-consumer-Eepcru`.
- Independent boundary flow: a matching-plus-missing-plus-extra tree returned
  check exit 2; its restore verification returned 3 and wrote
  `Restore verification blocked`. Output inside the source was rejected with
  exit 1; `--sample-size 0` returned 64. Redacted evidence did not contain the
  private filename or either temp-root path. Evidence:
  `/tmp/storage-exit-independent-nzOFmr`.

## Live deployment, privacy, accessibility, and performance

- **Candidate match:** SHA-256 values matched local `dist/site/` for
  `index.html`, hashed JS/CSS, both WebP assets, `sw.js`, and `404.html`.
- `/`, `/demo`, `/install`, `/privacy`, and `/terms` return 200; an unknown
  route returns the styled 404 with HTTP 404. All internal links and the Param
  Factory link returned 200.
- Headers include HSTS, `X-Content-Type-Options: nosniff`, strict-origin
  referrer policy, permissions policy, and same-origin CSP. HTML and `sw.js`
  revalidate; hashed assets are one-year immutable. No response set a cookie.
- Fresh Playwright contexts, through the demo/reset flow on desktop and 390px
  mobile, made no third-party requests, had no cookies/localStorage/
  sessionStorage/IndexedDB records, and had no console or page errors on
  product routes. There are no server endpoints, sign-in, billing, or unlock
  calls, so rate-limit and Entra checks are not applicable.
- Axe found zero serious/critical violations on `/`, `/demo`, `/install`,
  `/privacy`, `/terms`, and the 404 at both sizes. No horizontal overflow was
  observed. First Tab reaches the visibly outlined Skip to content link;
  keyboard activation focuses `main`; Reset demo works. Reduced-motion and
  200%-text browser regressions pass in the suite.
- The service worker controls `/demo`, has no waiting update, uses only
  `storage-exit-check-v3`, and reloads the demo offline successfully.
- Production build sizes: JS 11.02 kB (4.11 kB gzip), CSS 9.41 kB (3.11 kB
  gzip), LCP image 83,712 bytes; comfortably within static budgets.

## Required disposition

**Do not release this candidate.** Fix P1 and add its observable claim test,
then rerun the complete claims, fresh-consumer, restore-boundary, and live
deployment matrix.
