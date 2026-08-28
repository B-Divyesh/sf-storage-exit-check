# Independent verification 2 — FAIL

**Candidate:** `cd9436694a588c7e4f338b4b7479418354ba8555`  
**Live URL:** <https://storage-exit-check.sociobot.in>  
**Verified:** 2026-08-28 UTC  
**Verdict:** **FAIL — release-blocking correctness, safety, and claims defects remain.**

The earlier deployment-only concern is not reproducible. The live site is
available, its principal files match this candidate byte-for-byte, and the
previous 404 and caching repairs are deployed. This verdict comes from fresh
CLI boundary testing and the acceptance contract, not deployment state.

## First read — PASS

A cold desktop load says the tool **checks a storage move before cancelling**,
is **for people leaving cloud storage who need proof their local copy can
restore**, and presents **Try it with sample data** as the first action. Its
adjacent sentence says the click shows a complete check and restore test. The
one-click `/demo` route shows a realistic five-file result, the persistent
“Demo — sample data, nothing is saved” banner, **Reset demo**, and **Start for
real**.

## Release-blocking findings

### P1 — distinct Unix filenames collapse and produce a false passing verdict

The manifest key uses `to_string_lossy()` for each path component. Distinct
non-UTF-8 filenames can therefore become the same replacement-character key
and overwrite one another in the manifest map.

Fresh release-binary reproduction:

1. The source contained two files whose one-byte names were hex `80` and `81`.
   Their contents were `source-only` and `shared`.
2. The replacement contained only the hex `81` file with content `shared`.
3. `storage-exit-check --json check SOURCE REPLACEMENT --output REPORT`
   returned exit **0**, status `ready_for_restore_test`, `complete: true`, one
   source entry, one replacement entry, and zero missing files.
4. The real source directory had two files and the replacement had one. The
   audit exposed the collapsed path as `�`.

Evidence sandbox: `/tmp/storage-exit-check-nonutf8-EAb52M`. This is dangerous
for the core job: a missing source file can be hidden behind a cancellation-
ready result.

**Required correction:** represent native path bytes without lossy collisions
on Unix (and equivalent lossless identity on each platform), reject paths that
cannot be represented if necessary, and add a regression/claim case proving
two distinct names cannot collapse.

### P1 — `--output` can modify an input tree despite the read-only claim

The CLI accepts an output folder nested inside the source or replacement. In a
fresh matching one-file case:

```text
storage-exit-check check SOURCE REPLACEMENT --output SOURCE/evidence
exit: 0
result: content check passed
```

The command added `SOURCE/evidence/audit.json`, `report.html`, and
`restore-sample.txt`. A before/after tree diff shows all four new entries. This
directly falsifies declared claim `read-only` (“The check does not change
either directory tree”) and the same unconditional README promise. The tagged
test passes only because it chooses an output outside both inputs.

Evidence sandbox: `/tmp/storage-exit-check-readonly-Cpsbei`.

**Required correction:** canonicalize the proposed output, reject output equal
to or nested within either input tree (and consider input nested inside an
existing output), then broaden the tagged claim test to cover these aliases.

### P1 — material published claims are absent from `claims.json`

The claim registry contains ten entries, but published copy adds material
promises with no corresponding claim entry and tagged sandbox test. Examples:

- README and `/privacy`: “The CLI … makes/sends no network requests.” The
  `offline-cli` test only supplies invalid proxy variables; it does not observe
  or block all CLI network activity. The `no-upload` test covers the browser.
- `/privacy`: “This static site sets no cookies and stores no personal data.”
  `demo-isolated` checks localStorage, sessionStorage, and IndexedDB, but not
  cookies or this broader promise.
- README: stable exit-code meanings, symlinks are never followed, and
  timestamp-only differences do not fail.
- `/demo`: the quantitative “10 file copies hashed / 0 content differences”
  result is not asserted by the claim test.

The claims contract says any unlisted claim fails review. Add exact entries and
observable tests or narrow/remove the copy.

## Other findings

### P2 — documented exit code 2 also means invalid command input

The README table says exit 2 means source/replacement missing or changed
content. `check ... --sample-size 0` is a command-line validation error, yet
clap also exits **2**. A script cannot rely on the documented meaning.

### P2 — multiple mobile touch targets are below 44×44 CSS pixels

At 390 px, measured examples include **Start for real** at 88.9×21.7,
footer **Privacy** at 50.7×21.7, footer **Terms** at 41.2×21.7, and the
wordmark at 142×35.2. Header Demo and Install are 44 px tall but only 41.6 and
42.2 px wide. This misses the attached accessibility/design baseline even
though axe reports no serious or critical violations.

## Claims gate

`npm ci` completed in the clean candidate checkout. Every exact command from
`.factory/claims.json` then passed through the documented demo entry point:

| Claim | Result |
| --- | --- |
| `demo-complete` | PASS |
| `no-upload` | PASS |
| `offline-cli` | PASS |
| `mit-free` | PASS |
| `demo-isolated` | PASS |
| `read-only` | PASS in its narrow sandbox; broader promise falsified above |
| `hash-differences` | PASS |
| `redacted-report` | PASS |
| `repeatable-sample` | PASS |
| `printable-report` | PASS |

The exact command form for each was
`npm test -- --grep @claim:<id>`. The initial untouched checkout had no
installed Node dependencies; after the required `npm ci`, all ten commands
exited 0.

## Build, package, and CLI matrix

- `npm test`: PASS — 6 Rust tests and 15 Playwright tests.
- `npm run build`: PASS — release CLI and `dist/site/` produced.
- `npm run typecheck`: PASS within the test suite.
- `cargo fmt --all -- --check`: PASS.
- `cargo clippy --all-targets -- -D warnings`: PASS.
- `npm run pack:cli`: PASS — 20 files, 56.5 KiB unpacked crate.
- Packed crate installed into a fresh Cargo root; `--help` and bundled `demo`
  passed and produced both reports plus a 3-of-3 restore result.
- Independent normal two-file check: exit 0; two-file restore: exit 0.
- Changed restore: exit 3 with one passed and one failed sample.
- Missing + changed + extra comparison: exit 2 with counts 1/1/1.
- Empty source: exit 2. Same input tree: exit 1 with recovery text. Missing
  input path: exit 1 with recovery text. Timestamp-only difference: exit 0 and
  count 1.

Matrix sandbox: `/tmp/storage-exit-check-matrix-LiZK45`.

## Live identity, privacy, response policy, and PWA checks

- Candidate and live SHA-256 matched for `index.html`, hashed JS, hashed CSS,
  versioned hero WebP, `sw.js`, and `404.html`.
- `/`, `/demo`, `/install`, `/privacy`, and `/terms` return 200. An unknown
  path returns HTTP 404 with the styled page. All linked HTTP pages returned
  200; robots and sitemap list the public routes.
- Hashed JS/CSS and the versioned hero return
  `Cache-Control: public, max-age=31536000, immutable`; HTML and `sw.js` are
  immediately revalidated.
- Live responses include HSTS, `nosniff`, strict-origin referrer policy,
  permissions policy, and a restrictive same-origin CSP.
- Cold landing and demo flows made only same-origin requests. No third-party
  scripts, fonts, trackers, cookies, sign-in, payment, or server API was found.
  Rate-limit and Entra checks are not applicable because there is no endpoint
  or authentication flow.
- The service worker reached `activated`, an explicit update check left no
  waiting worker, and `/demo` reloaded offline with status 200 and correct
  content.

## Accessibility and performance

- Desktop and 390×844 mobile: no horizontal overflow or unexpected page/
  console errors on normal routes. First Tab reaches the skip link; Enter moves
  focus to `main`. Keyboard activation of Reset demo announces “Demo reset.”
- Live axe scans across all five app routes found zero serious/critical issues;
  the styled 404 also had zero serious/critical findings.
- Reduced-motion emulation matched, changed terminal animation duration to
  `0.01ms`, and disabled smooth scrolling.
- `verify-url.sh`: PASS — title, `lang=en`, one h1, main, image alt text,
  labelled buttons, and no load errors; measured 1,681 ms in that run.
- Lighthouse 12.8.2 live mobile: Performance **98**, Accessibility **100**,
  Best Practices **100**, SEO **100**; FCP **1.0 s**, LCP **1.3 s**, TBT
  **160 ms**, CLS **0**, total transfer **91 KiB**.
- Built gzip JS is 4.1 KiB, CSS 3.1 KiB, and hero WebP 83.7 KiB. Budgets pass.

## Final decision

**FAIL.** Do not release this candidate as cancellation evidence. Fix the two
CLI correctness/safety defects and close the claim-registry gaps, then rerun
all boundary, package-consumer, and live-deployment checks.
