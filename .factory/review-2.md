# Adversarial first-read review 2 — Storage Exit Check

**Reviewed:** 2026-08-28 UTC

**Candidate:** `f59242ee4814401753f8742886a0de592e34f91a`

**Live URL:** https://storage-exit-check.sociobot.in

**Verdict:** **FAIL**

The first read, demo, declared claim commands, core CLI flow, routing, visual
identity, and accessibility checks pass. The product does not reach the
required zero-finding standard because two public privacy/write-boundary
statements are broader than their registered tests, one README provenance
claim is unlisted, and three copy/documentation defects remain.

## Cold first read

Fresh Chromium contexts opened the live home page at 390×844 and 1440×900.
Neither context scrolled before this assessment.

- **What does it do?** It checks a cloud-to-local storage move, tests selected
  restored files, and produces evidence to review before cancelling storage.
- **For whom?** People leaving cloud storage for a local disk or NAS.
- **What should I click first?** **Try it with sample data**.

All three answers were available on the first screen at both widths. The exact
copy was “Check your storage move before cancelling,” “For people leaving cloud
storage who need evidence that selected files restore from their local copy,”
and “Try it with sample data.” The adjacent line says what the action does:
“See a complete check and restore test in one click.” The mobile page had no
horizontal overflow, and the action and all three facts appeared before the
first viewport ended.

## Findings

### Blocking

#### F-2-1 — The landing page promises an untested write boundary

**Location/quote:** Home, “Know what this check does not prove”: “The check
reads both input folders and writes only to your report folder.”

**Why this fails:** The registered `read-only` claim snapshots only the source
and replacement folders and checks invalid report locations. It does not trace
a normal `check` process or prove that the process writes nowhere else.
`cli-demo-isolated` does trace writes, but only for the `demo` command. “Writes
only” is therefore a broader privacy and filesystem promise than any listed
claim test. A person deciding whether to run the CLI may rely on it.

**Concrete fix:** Either replace the sentence with the tested sentence, “The
check does not change either input folder,” or add a `check-write-boundary`
claim. Run `check` under the filesystem guard with source, replacement, report,
synthetic home, and unrelated canary folders; assert every write is under the
report folder.

#### F-2-2 — The privacy page makes a whole-site request claim tested only on `/demo`

**Location/quote:** `/privacy`, under “This website”: “It requests only this
site's pages and assets.” The `no-upload` claim is listed at the privacy page,
but its browser test opens only `/demo` and clicks **Reset demo**.

**Why this fails:** The sentence covers the whole website. The registered test
does not visit `/`, `/install`, `/privacy`, `/terms`, the 404, the sample report,
or the download path. This review's independent request log found no outside
requests, but the product's required regression test does not protect the
published scope.

**Concrete fix:** Expand `no-upload` to visit every public route, the real 404,
the sample report, and the evidence download in a fresh context while rejecting
every non-origin request. Alternatively narrow the sentence to “The browser
demo requests only this site's pages and assets.”

### Major

#### F-2-3 — The README's originality claim is absent from `claims.json`

**Location/quote:** README, “Try the sandbox”: “The demo bundles two original
JPEG photos, a household inventory, a checklist, and recipe notes from
`examples/source`.”

**Why this fails:** Tests confirm that the files are JPEGs and that generated
demo evidence matches them. They do not test the public “original” provenance
claim, and no claim entry names it. `.factory/design.md` contains a provenance
record, but that is not the one-test-per-claim contract required by this
review.

**Concrete fix:** Remove “original” from the README sentence. Keep the detailed
provenance in `.factory/design.md`, where it is already recorded. If originality
must remain public, add a checkable signed asset manifest and a corresponding
claim test.

### Minor

#### F-2-4 — “Sandbox” and “demo” are used as names for the same entry point

**Location/quote:** README heading “Try the sandbox”; the following paragraph
calls the same command “The demo,” while the site action says “Try it with
sample data” and the route is “Demo.”

**Why this fails:** A first-time CLI user must infer that sandbox and demo mean
the same try-out. “Sandbox” is also more technical than needed. The plain-words
rule requires one term for one concept.

**Concrete fix:** Change the README heading to “Try the demo.” Reserve
“sandbox folder” for the isolated temporary directory created by the command.

#### F-2-5 — README does not say how deployment is handed off

**Location/quote:** README, “Develop and verify,” ends after build, test, and
package commands. It says the build writes `dist/site/`, but contains no deploy
section or deployment ownership statement.

**Why this fails:** The repository contract requires README instructions for
run, test, and deploy. A maintainer cannot tell whether to publish the static
directory, release the crate, or leave deployment to the factory.

**Concrete fix:** Add “Deploy” with the static artifact (`dist/site/`), required
route-rewrite/404 configuration, and the statement that Param Factory owns
production deployment. State separately how a CLI release artifact is built
without implying that this repository publishes it automatically.

#### F-2-6 — A terms sentence uses “recover” as if the file performs the action

**Location/quote:** `/terms`, “A sample result does not guarantee every file can
recover.”

**Why this fails:** Files do not recover themselves. The wording is less direct
than the recovery limitation elsewhere and can be read as a property of a file
rather than the user's ability to restore it.

**Concrete fix:** Use “A sample result does not guarantee that every file can be
recovered.”

## Copy audit

Count method: whitespace-separated words. Commands, bare paths, the build ID,
and hidden accessibility labels are not prose sentences. Headings, labels,
navigation, buttons, facts, captions, terminal result lines, and table entries
are included. No counted unit exceeds 22 words, and no banned marketing word
appears. Flags below are still findings even though they are under the word
cap.

### Landing page

| # | Copy | Words | Flag |
| ---: | --- | ---: | --- |
| 1 | Storage Exit Check | 3 | — |
| 2 | Demo | 1 | — |
| 3 | Install | 1 | — |
| 4 | Privacy | 1 | — |
| 5 | Check your storage move before cancelling | 6 | — |
| 6 | For people leaving cloud storage who need evidence that selected files restore from their local copy. | 16 | — |
| 7 | Try it with sample data | 6 | — |
| 8 | See a complete check and restore test in one click. | 10 | — |
| 9 | No files uploaded | 3 | — |
| 10 | Works without internet | 3 | — |
| 11 | Free under the MIT License | 5 | — |
| 12 | Source and replacement folders, illustrated as paired botanical specimens. | 8 | — |
| 13 | Preview the check and restore results | 6 | — |
| 14 | The command checks content, selects a repeatable sample, and writes a printable report. | 13 | — |
| 15 | Sample result | 2 | — |
| 16 | Demo — sample data, nothing is saved outside this folder | 9 | — |
| 17 | Scanned 5 source files and 6 replacement files | 8 | — |
| 18 | Content check: passed | 3 | — |
| 19 | Findings: 1 harmless extra · 1 timestamp-only difference | 8 | — |
| 20 | Restore sample: 3 of 3 passed | 6 | — |
| 21 | A sample test does not prove full disaster recovery. | 9 | — |
| 22 | How the check works | 4 | — |
| 23 | Compare both folders | 3 | — |
| 24 | Point the command at your source folder and replacement folder. | 10 | — |
| 25 | Restore the sample | 3 | — |
| 26 | Recover the selected files into a separate empty restore folder. | 10 | — |
| 27 | Keep the reports | 3 | — |
| 28 | Verify the restored hashes and print both reports. | 8 | — |
| 29 | Know what this check does not prove | 7 | — |
| 30 | A sample restore does not prove full disaster recovery. | 9 | — |
| 31 | The check reads both input folders and writes only to your report folder. | 13 | F-2-1 |
| 32 | Before you cancel | 3 | — |
| 33 | Review off-site copies. | 3 | — |
| 34 | Keep recovery keys available. | 4 | — |
| 35 | Check retention dates. | 3 | — |
| 36 | Open both reports. | 3 | — |
| 37 | Install the CLI | 3 | — |
| 38 | Run the check on your computer | 6 | — |
| 39 | Read the install guide | 4 | — |
| 40 | Check a storage move before cancelling cloud storage. | 8 | — |
| 41 | Terms | 1 | — |
| 42 | Built by Param Factory | 4 | — |

### README

| # | Copy | Words | Flag |
| ---: | --- | ---: | --- |
| 1 | Storage Exit Check | 3 | — |
| 2 | Check a storage move and test a restore sample before cancelling cloud storage. | 13 | — |
| 3 | This local CLI is for people moving files to a NAS or local disks. | 14 | — |
| 4 | Storage Exit Check compares each regular file by size and SHA-256. | 11 | — |
| 5 | It follows each directory tree, meaning every nested item in a folder. | 12 | — |
| 6 | It explains missing, changed, and extra items. | 7 | — |
| 7 | It then selects a repeatable restore sample and writes printable reports. | 11 | — |
| 8 | The check does not change either input folder, and it makes no network requests. | 14 | — |
| 9 | It is evidence for a cancellation decision, not a backup or sync tool. | 13 | — |
| 10 | A sample restore does not prove full disaster recovery. | 9 | — |
| 11 | Try the sandbox | 3 | F-2-4 |
| 12 | The demo bundles two original JPEG photos, a household inventory, a checklist, and recipe notes from `examples/source`. | 17 | F-2-3 |
| 13 | The replacement folder also contains one NAS setup note and one timestamp-only difference. | 13 | — |
| 14 | The demo checks all five source files, restores three selected files, and prints the report folder. | 16 | — |
| 15 | It does not open your files or write outside its sandbox. | 11 | — |
| 16 | The recorded browser demo is at storage-exit-check.sociobot.in/?demo=1. | 7 | — |
| 17 | It shows reports generated by the release CLI and stores no demo records in the browser. | 16 | — |
| 18 | You can inspect the printable report or download all four evidence files there. | 13 | — |
| 19 | Install | 1 | — |
| 20 | Check a storage move | 4 | — |
| 21 | The new report folder contains: | 5 | — |
| 22 | `audit.json`: machine-readable counts, differences, hashes, and sample; | 7 | — |
| 23 | `report.html`: printable migration evidence; | 4 | — |
| 24 | `restore-sample.txt`: the files to recover from the replacement folder. | 9 | — |
| 25 | The report folder must be outside both input folders. | 9 | — |
| 26 | The command follows any folder shortcuts before it checks the report location. | 12 | — |
| 27 | It refuses to write inside either input folder. | 8 | — |
| 28 | Restore the selected files into a separate empty restore folder. | 10 | — |
| 29 | Do not copy them from the source folder. | 8 | — |
| 30 | Then verify them: | 3 | — |
| 31 | The command writes `restore-report.html` beside the audit. | 7 | — |
| 32 | Keep both HTML reports with your cancellation records. | 8 | — |
| 33 | Restore verification refuses an audit whose content check failed. | 9 | — |
| 34 | It also refuses either input folder, a folder inside one, and folder shortcuts before it writes a restore report. | 19 | — |
| 35 | A redacted audit stores non-readable identifiers for the two input folders. | 11 | — |
| 36 | The verifier uses them only to reject those folders as restore locations. | 12 | — |
| 37 | Redact filenames | 2 | — |
| 38 | Redaction removes folder paths and filenames from every evidence file. | 10 | — |
| 39 | The restore verifier then finds samples by size and SHA-256, not size alone. | 13 | — |
| 40 | Restore each sampled copy because identical files at two paths count twice. | 12 | — |
| 41 | Script with JSON | 3 | — |
| 42 | Place the global `--json` flag before the command: | 8 | — |
| 43 | Exit codes are stable: | 4 | — |
| 44 | Code: Meaning | 2 | — |
| 45 | 0: Content check passed, or every restore sample passed. | 9 | — |
| 46 | 1: A path, permission, or evidence file could not be read. | 11 | — |
| 47 | 2: The source and replacement have missing or changed content. | 10 | — |
| 48 | 3: A restore sample failed, or its content audit was incomplete. | 11 | — |
| 49 | 64: The command usage or an option value is invalid. | 10 | — |
| 50 | Extra replacement files are reported but do not fail a check. | 11 | — |
| 51 | An empty source folder, or one without matching regular files, does fail. | 12 | — |
| 52 | Filesystem notes | 2 | — |
| 53 | Symbolic links are recorded as links and never followed. | 9 | — |
| 54 | A filename that is not valid UTF-8 stops the check instead of being merged or rewritten. | 16 | — |
| 55 | Timestamp-only differences are reported but do not fail content checks. | 10 | — |
| 56 | Filesystems round timestamps differently, so SHA-256 decides file equality. | 9 | — |
| 57 | Hashing reads every regular file and can take time in large folders. | 12 | — |
| 58 | Reports contain paths and content hashes unless `--redact` is used. | 10 | — |
| 59 | The check does not modify either input folder. | 8 | — |
| 60 | Develop and verify | 3 | — |
| 61 | `npm test` runs Rust unit tests, builds the site, runs every claim test, and checks all Axe accessibility findings. | 19 | — |
| 62 | `npm run build` compiles the release CLI and writes the static site to `dist/site/`. | 14 | — |
| 63 | Run only one documented claim: | 5 | — |
| 64 | Create the publishable Rust package without publishing it: | 8 | — |
| 65 | The site is Vite with vanilla TypeScript. | 7 | — |
| 66 | The CLI uses Rust and SHA-256. | 6 | — |
| 67 | It records symbolic links without opening their targets. | 8 | — |
| 68 | The CLI sends no usage data and does not call an online service while it runs. | 16 | — |
| 69 | Project records | 2 | — |
| 70 | Product brief | 2 | — |
| 71 | Visual thesis | 2 | — |
| 72 | Demo contract | 2 | — |
| 73 | Tested claims | 2 | — |
| 74 | Handoff | 1 | — |
| 75 | License | 1 | — |
| 76 | MIT. | 1 | — |
| 77 | See LICENSE. | 2 | — |

### Terminology check

| Concept | Public term | Result |
| --- | --- | --- |
| Original exported copy | source folder | Consistent |
| New local copy | replacement folder | Consistent |
| Recovered test location | restore folder | Consistent |
| Generated output location | report folder | Consistent |
| Recursive filesystem shape | directory tree, defined once | Consistent |
| One-click sample experience | demo / sandbox | **Inconsistent: F-2-4** |

All landing actions name their result or destination. No landing or README
sentence exceeds 22 words. F-2-6 is on `/terms`, outside the requested landing
and README sentence inventory, but remains public copy and is therefore listed
as a finding.

## Demo and sandbox verification

- One click on **Try it with sample data** navigated to `/?demo=1` and focused
  “Inspect a complete sample check.”
- The first 390 px screen showed the persistent “Demo — sample data, nothing
  is saved” banner, **Reset demo**, **Start for real**, the product heading, the
  release-CLI provenance sentence, and the beginning of the real terminal run.
- The recording showed 5 source files, 6 replacement files, one extra, one
  timestamp-only difference, a passing content check, and 3 of 3 restored files.
- The page exposes the three selected filenames and hashes below the recording,
  a printable sample report, and a four-file evidence download.
- **Reset demo** announced “Demo reset. The original sample evidence is shown.”
  and restored the replay. **Start for real** returned to `/`.
- Sentinel cookie, localStorage, and sessionStorage values placed before entry
  remained unchanged through demo, reset, and exit. No product cookie, local,
  session, or IndexedDB record appeared.
- Browser requests during the demo stayed on
  `https://storage-exit-check.sociobot.in`. An offline reload retained the
  complete demo from `storage-exit-check-v4`.
- A direct release CLI run in
  `/tmp/storage-exit-review2-cli-OyTAJe/demo` produced both sample folders, the
  restored sample, `audit.json`, `report.html`, `restore-sample.txt`, and
  `restore-report.html`; its content and restore checks passed.
- The declared filesystem and network guards also passed. F-2-1 and F-2-2 are
  claim-scope defects, not observed live leaks.

## Declared claims

Every exact `test` command in `.factory/claims.json` ran independently from
fresh clone `/tmp/storage-exit-review2-4oAirc/repo`. Every claim ID occurs in
exactly one tagged test.

| Claim | Result |
| --- | --- |
| `demo-complete` | PASS |
| `browser-demo-provenance` | PASS |
| `no-upload` | PASS, but narrower than F-2-2's public sentence |
| `offline-cli` | PASS |
| `mit-free` | PASS |
| `demo-isolated` | PASS |
| `cli-demo-isolated` | PASS |
| `default-demo-temp` | PASS |
| `read-only` | PASS, but narrower than F-2-1's public sentence |
| `hash-differences` | PASS |
| `redacted-report` | PASS |
| `redacted-restore` | PASS |
| `duplicate-file-restore` | PASS |
| `repeatable-sample` | PASS |
| `printable-report` | PASS |
| `path-identity` | PASS |
| `incomplete-audit` | PASS |
| `separate-restore` | PASS |
| `symlink-policy` | PASS |
| `timestamp-policy` | PASS |
| `content-outcomes` | PASS |
| `exit-semantics` | PASS |
| `json-output` | PASS |

Result: 23 passed, 0 failed. F-2-1 through F-2-3 are the unlisted or
under-scoped public claims found by the required copy cross-check.

## Earlier-finding audit

Every finding in `.factory/review-1.md` was checked against the live site and
the current code, not accepted from `.factory/polish-1.md` or the handoff.

| Earlier finding | Independent live/code confirmation | Status |
| --- | --- | --- |
| F-1-1 | Shipped fixtures are substantive JPEG, CSV, Markdown, and text files; live report and ZIP return 200 and match a fresh release run. | Fixed |
| F-1-2 | First screen now limits evidence to selected restored files; recovery caveats remain adjacent to results. | Fixed |
| F-1-3 | README and `/install` contain no Rust 1.75 claim. | Fixed |
| F-1-4 | `cli-demo-isolated` exists once and its guarded temp-directory run passed. | Fixed |
| F-1-5 | `default-demo-temp` ran without `--output` and passed. | Fixed |
| F-1-6 | `browser-demo-provenance` compared the live-style artifact with a fresh release CLI run and passed. | Fixed |
| F-1-7 | No future release-binary promise remains. | Fixed |
| F-1-8 | `redacted-restore` tests size plus SHA-256 lookup and passed. | Fixed |
| F-1-9 | `duplicate-file-restore` requires both identical-path samples and passed. | Fixed |
| F-1-10 | Public copy uses the narrower “does not modify either input folder” statement. | Fixed; F-2-1 is a different remaining output-boundary claim |
| F-1-11 | The unsupported host-log retention sentence is absent. | Fixed |
| F-1-12 | Home uses a normal checklist container; live Axe found zero violations. | Fixed |
| F-1-13 | Live 404 has description, canonical, OG, Twitter, favicon, and apple-touch metadata. | Fixed |
| F-1-14 | Live 404 duplicates the product wordmark, navigation, footer, build line, and external-site label. | Fixed |
| F-1-15 | Live 404 h1 is “Page not found.” | Fixed |
| F-1-16 | Live 404 action is “Return home.” | Fixed |
| F-1-17 | Home heading is “Preview the check and restore results.” | Fixed |
| F-1-18 | Home label is “Install the CLI.” | Fixed |
| F-1-19 | Source, replacement, restore, and report folder names are consistent; directory tree is defined once. | Fixed |
| F-1-20 | README explains non-readable input-folder identifiers without “opaque root fingerprints.” | Fixed |
| F-1-21 | README removes `clap` and “non-following directory walker” jargon. | Fixed |
| F-1-22 | README and privacy copy use the direct no-usage-data/no-online-service wording. | Fixed |
| F-1-23 | Instructions say folder shortcuts and explain the refusal directly. | Fixed |

No earlier finding is half-fixed or regressed, so no F-1 identifier is reopened.

## Structure, routing, accessibility, and identity

| Check | Result |
| --- | --- |
| Titles | PASS: home uses “Product — what it does”; every other route has its own direct title |
| Metadata | PASS: description, canonical, OG/Twitter, 1200×630 image, favicon, apple-touch, and theme color present |
| Semantics | PASS: `lang=en`, one h1, one main, ordered headings, header/nav/main/footer on every route |
| Deep links and history | PASS: all real routes return 200; in-app navigation and Back focus the new h1 and update the live region |
| 404 | PASS: unknown URL returns HTTP 404 with the designed botanical shell and a home action |
| Links | PASS: every product and Factory link returned 200; mail links were explicitly excluded from HTTP crawling |
| Header/footer | PASS: consistent on app routes and the static 404, with Privacy, Terms, Factory, and version/build |
| Mobile | PASS: no overflow at 390×844 and no visible action below 44×44 px |
| Accessibility | PASS: live Axe returned zero violations on all routes and the 404 at mobile and desktop widths |
| Motion/offline | PASS: reduced-motion regression passes; the live demo reloads offline |
| Security/privacy headers | PASS: same-origin CSP, `frame-ancestors 'none'`, nosniff, referrer and permissions policies are response headers |
| Assets | PASS: 12.61 kB JS (4.87 kB gzip), 10.38 kB CSS (3.34 kB gzip); no third-party font or script |
| Visual identity | PASS: botanical field-guide art, asymmetric plate layout, paper palette, serif/sans type, and specimen rules are product-specific |
| Site skeleton | PASS: header, first screen, live preview, three steps, limits/privacy, install action, and footer appear in the required order |

The current clean build's HTML, JS, and CSS SHA-256 hashes match the live
deployment byte-for-byte.

## Missed leverage

No missing AI feature, sync, or import/export feature is warranted. The brief
calls for a deterministic local comparison, repeatable restore sample, and
printable evidence; the CLI provides those. Runtime AI would weaken the local,
offline, reproducible job. Evidence export already exists as HTML, JSON, text,
and a downloadable sample archive.

## Quality-gate evidence

- Full `npm test`: PASS — 10 Rust tests and 32 Playwright tests.
- Every one of 23 exact claim commands: PASS from the fresh clone.
- `npm run build`: PASS; produced `dist/site/`.
- `cargo fmt --all -- --check`: PASS.
- `cargo clippy --all-targets -- -D warnings`: PASS.
- Live route and link crawl: PASS, including the intentional HTTP 404.
- Live mobile/desktop Axe: zero violations on `/`, `/demo`, `/install`,
  `/privacy`, `/terms`, and the real 404.
- Live demo request log: same-origin only; no product storage records.

## What would make this perfect

Close all six findings, then rerun the claim cross-check from a fresh clone.
The decisive work is to make the check write boundary and whole-site request
scope either exactly tested or exactly narrowed, remove the untestable README
originality adjective, use “demo” consistently, document deployment ownership,
and correct the recovery sentence. A PASS requires zero remaining findings and
no untested public claim.
