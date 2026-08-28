# Independent verification 2 — FAIL

**Candidate:** `cd9436694a588c7e4f338b4b7479418354ba8555`

**Live URL:** <https://storage-exit-check.sociobot.in>

**Verified:** 2026-08-28 UTC

**Verdict:** **FAIL — release-blocking correctness, safety, and claims defects remain.**

The earlier deployment-only concern is not reproducible. The live site is
available, and all deployable files checked match this candidate byte for byte.
The failure comes from fresh CLI behavior and incomplete claim coverage, not
deployment state.

## First-read gate — PASS

A cold load says the tool **checks a storage move before cancelling**, is **for
people leaving cloud storage who need proof their local copy can restore**, and
presents **Try it with sample data** as the first action. All three answers and
the action are visible without scrolling at 1440×900 and 390×844. One click
opens `/demo`, which shows the completed five-file check, restore result, demo
notice, **Reset demo**, and **Start for real**.

## Release-blocking findings

### P1 — distinct Unix filenames collapse and produce a false pass

The manifest key uses lossy Unicode conversion. Distinct non-UTF-8 filenames
can become the same replacement-character key and overwrite one another.

Fresh release-binary reproduction used source filenames with raw one-byte names
`80` and `81`; the replacement contained only `81`. Source `80` held
`source-only`; both `81` files held `shared`. The tool returned:

```text
NONUTF_EXIT=0 SOURCE_REAL_COUNT=2 REPLACEMENT_REAL_COUNT=1
status: ready_for_restore_test
complete: true
source_entries: 1
replacement_entries: 1
missing: 0
sample path: �
```

Evidence sandbox: `/tmp/storage-exit-check-nonutf8-confirm-dbCDr5`.

This hides a missing source file behind cancellation-ready evidence. Preserve
native filename identity losslessly on each platform, or reject names that
cannot be represented, and add a regression/claim test.

### P1 — the read-only claim is false for an accepted output path

`check` permits `--output` inside the source or replacement tree. The invocation
exits 0 but changes an input tree by adding the evidence files. This contradicts
the brief, README, landing copy, and claim `read-only` (“does not change either
directory tree”). The tagged test only puts output outside both inputs.

```text
storage-exit-check check SOURCE REPLACEMENT --output SOURCE/evidence
OUTPUT_INSIDE_SOURCE_EXIT=0 BEFORE_FILES=1 AFTER_FILES=4
evidence/audit.json
evidence/report.html
evidence/restore-sample.txt
user-file.txt
```

Evidence sandbox: `/tmp/storage-exit-check-qa-Mf5mQH/inside`.

Canonicalize the proposed output and reject it when equal to or beneath either
input root. Cover aliases and the default relative output when run from inside
an input tree in the `read-only` claim test.

### P1 — an incomplete migration can produce a passing restore report

A source with one matching file and one missing file correctly makes `check`
exit 2 and records `complete: false`, `missing: 1`. Its audit still contains the
matching file as a sample. Restoring only that file makes `verify-restore` exit
0 and write **“Restore sample passed”** without carrying forward the failed
content verdict.

```text
INCOMPLETE_CHECK_EXIT=2 INCOMPLETE_RESTORE_EXIT=0
{"complete":false,"missing":1,"sample":1}
Restore sample passed
1 passed · 0 failed
```

Evidence sandbox: `/tmp/storage-exit-check-qa-Mf5mQH/incomplete`.

This can create cancellation-ready-looking evidence for a known incomplete
replacement. Refuse restore verification for an incomplete audit, or fail and
label both command and report unmistakably. Add an end-to-end regression test.

### P1 — material published claims are absent from `claims.json`

All ten listed claim commands pass, but the registry omits public assertions
that a visitor can rely on. Examples include:

- the CLI makes/sends no network requests (`offline-cli` sets bad proxies but
  does not observe or block all network activity; `no-upload` is browser-only);
- the website sets no cookies and stores no personal data;
- symbolic links are recorded as links and never followed;
- timestamp-only differences are reported and do not fail;
- extra replacement files do not fail, while empty/no-match sources do;
- exit codes have the documented stable meanings;
- the demo's quantitative 10-copy, zero-difference result.

The claims contract makes every unlisted claim release-blocking. Add one
observable tagged sandbox test per promise or narrow/remove the copy.

## Other findings

### P2 — documented exit code 2 also means invalid command input

The README says code 2 means missing or changed content. Clap also returns 2 for
invalid `--sample-size 0`, so scripts cannot rely on the documented meaning.

### P2 — several mobile targets are smaller than 44×44 CSS pixels

At 390 px, measured targets include the home wordmark at 142×35, `Demo` and
`Install` at about 42×44, footer `Privacy` at 51×22, footer `Terms` at 41×22,
the factory link at 158×22, and demo `Start for real` at 89×22. This misses the
attached accessibility/design baseline even though axe reports no serious or
critical violations.

### P2 — demo documentation gives the wrong exit destination

`.factory/demo.md` says **Start for real** returns to the install path. The
candidate and live link go to `/`; keyboard activation confirmed that route.

## Declared claims

After `npm ci`, every exact command in `.factory/claims.json` passed from the
candidate checkout through the documented demo entry point.

| Claim | Result |
| --- | --- |
| `demo-complete` | PASS |
| `no-upload` | PASS |
| `offline-cli` | PASS |
| `mit-free` | PASS |
| `demo-isolated` | PASS |
| `read-only` | PASS narrowly; contradicted by the P1 boundary above |
| `hash-differences` | PASS |
| `redacted-report` | PASS |
| `repeatable-sample` | PASS |
| `printable-report` | PASS |

Each exact command also reran Rust tests, typecheck, the site build, and its
selected Playwright test. No listed command failed after dependency install.

## Build, package, and CLI matrix

- `npm ci`: PASS; 23 packages installed and 0 npm vulnerabilities reported.
- `npm test`: PASS; 6 Rust tests and 15 Playwright tests.
- TypeScript check: PASS through `npm test`.
- `npm run build`: PASS; optimized CLI and `dist/site/` produced.
- `cargo fmt --all -- --check`: PASS.
- `cargo clippy --all-targets -- -D warnings`: PASS.
- `npm run pack:cli`: PASS; 20 files, 56.5 KiB unpacked/16.6 KiB compressed.
- The packed crate installed into a fresh Cargo root. `--version`, `--help`,
  and `demo` passed; demo produced four evidence files and a 3-of-3 restore.
- Independent matching, missing/changed/extra, empty-file, symlink,
  timestamp-only, missing-path, same-root, nonempty-output, sample-size bound,
  JSON, wrong restore, and missing restore cases were exercised.
- Normal results and documented exit codes behaved as expected apart from the
  findings above. Wrong and missing restores exited 3.

## Live deployment, privacy, and policies

- `index.html`, hashed JS/CSS, both versioned WebP images, `sw.js`, and
  `404.html` match local production output by SHA-256.
- `/`, `/demo`, `/install`, `/privacy`, and `/terms` return 200. An unknown path
  returns the styled document with HTTP 404. All linked HTTP pages return 200.
- Hashed JS, CSS, and images return
  `Cache-Control: public, max-age=31536000, immutable`; HTML and service-worker
  responses are revalidated.
- Live responses include HSTS, `nosniff`, strict-origin referrer policy,
  permissions policy, and a restrictive same-origin CSP. No cookies were set.
- A complete demo flow made only same-origin document, JS, CSS, and image
  requests. Browser storage stayed empty. No telemetry, authentication,
  billing, AI, unlock, or server API endpoint was found. Rate limiting, Entra
  authority, backend concurrency, and persistence checks are not applicable.
- The active service worker was `sw.js`, cache `storage-exit-check-v2`. An
  explicit update check left no waiting worker; `/demo` reloaded offline with
  status 200 and the correct heading.

## Accessibility and performance

- Desktop and 390×844 live routes have one h1, one main landmark, `lang=en`,
  route-specific titles, no horizontal overflow, and no unexpected errors.
- Playwright axe scans across all five routes at both sizes found zero serious
  or critical violations. The styled 404 also had none.
- Keyboard checks passed for the skip link, demo reset, SPA navigation, browser
  back, heading focus, and live-region update. The focus ring is 3 px and its
  measured contrast against paper is 4.61:1.
- Reduced motion produces 0.01 ms animation/transition duration, instant
  scrolling, and a visible hero. A 200% text-size smoke test had no page
  overflow; the undersized-target finding remains.
- `verify-url.sh`: PASS; 665 ms observed load and no console errors.
- Lighthouse 12.8.2 live mobile: Performance 96, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.8 s, LCP 1.3 s, CLS 0, TBT 230 ms.
- Initial transfer was 92,796 bytes: JS 4,105, CSS 3,191, image 83,816. Built
  gzip JS is 4.09 KiB and CSS is 3.07 KiB. All stated budgets pass.

## Evidence locations

- Non-UTF-8 collision: `/tmp/storage-exit-check-nonutf8-confirm-dbCDr5`
- CLI matrix and blockers: `/tmp/storage-exit-check-qa-Mf5mQH`
- Packed consumer: `/tmp/storage-exit-check-consumer-mFOjjV`
- Cold desktop screenshot: `/tmp/storage-exit-check-first-read.png`
- Mobile screenshot: `/tmp/storage-exit-live-mobile.png`
- URL verifier: `/tmp/storage-exit-verify-url-woC6pI/verify.json`
- Lighthouse: `/tmp/storage-exit-check-lighthouse.json`

## Final decision

**FAIL.** Do not release this candidate as cancellation evidence. Fix the three
CLI correctness/safety paths and close the claim-registry gaps, then rerun the
full claim, package-consumer, boundary, and live-deployment matrix.
