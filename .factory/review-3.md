# Adversarial first-read review 3 — Storage Exit Check

**Reviewed:** 2026-08-28 UTC

**Candidate:** `2cd90c54145eb294bee04ba3c5bf8cb88a12c149`

**Live URL:** https://storage-exit-check.sociobot.in

**Verdict:** **PASS**

The review found zero blocking, major, or minor findings. The live first screen,
one-click demo, CLI sandbox, all 24 declared claims, prior-finding repairs,
routing, copy, accessibility, and product-specific visual identity pass from
fresh contexts. No public claim remains untested.

## Cold first read

Fresh Chromium contexts opened the live home page at 390×844 and 1440×900.
Neither context scrolled before this assessment.

- **What does it do?** It checks a move from cloud storage to a local copy,
  tests selected restored files, and produces evidence to review before
  cancelling cloud storage.
- **For whom?** People leaving cloud storage for local disks or a NAS.
- **What should I click first?** **Try it with sample data**.

All three answers were visible on the first screen at both widths. The exact
copy was “Check your storage move before cancelling,” “For people leaving
cloud storage who need evidence that selected files restore from their local
copy,” and “Try it with sample data.” The adjacent sentence, “See a complete
check and restore test in one click,” states the result of the action. The
mobile viewport also showed all three privacy, offline, and price facts.

## Findings

None. There are no `F-3-k` entries because the zero-finding PASS condition is
met.

## Copy audit

Count method: whitespace-separated words. Commands, bare paths, build IDs, and
hidden accessibility labels are not prose sentences. Headings, labels,
navigation, actions, facts, captions, terminal result lines, list entries, and
table entries are included. No item exceeds 22 words. No banned marketing
word, unexplained marketing adjective, metaphor heading, mood heading,
inconsistent product term, or non-result-naming landing action was found.

### Landing page

| # | Copy | Words | Flag |
| ---: | --- | ---: | --- |
| 1 | Storage Exit Check | 3 | — |
| 2 | Demo | 1 | — |
| 3 | Install | 1 | — |
| 4 | Privacy | 1 | — |
| 5 | Check your storage move before cancelling | 6 | — |
| 6 | For people leaving cloud storage who need evidence that selected files restore from their local copy. | 16 | — |
| 7 | Try it with sample data | 5 | — |
| 8 | See a complete check and restore test in one click. | 10 | — |
| 9 | No files uploaded | 3 | — |
| 10 | Works without internet | 3 | — |
| 11 | Free under the MIT License | 5 | — |
| 12 | Source and replacement folders, illustrated as paired botanical specimens. | 9 | — |
| 13 | Preview the check and restore results | 6 | — |
| 14 | The command checks content, selects a repeatable sample, and writes a printable report. | 13 | — |
| 15 | Sample result | 2 | — |
| 16 | Demo — sample data, nothing is saved outside this folder | 10 | — |
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
| 31 | The check reads both input folders and writes only to your report folder. | 13 | — |
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
| 11 | Try the demo | 3 | — |
| 12 | The demo bundles two JPEG photos, a household inventory, a checklist, and recipe notes from `examples/source`. | 16 | — |
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
| 69 | Deploy | 1 | — |
| 70 | `npm run build` creates the static site in `dist/site/`. | 9 | — |
| 71 | Deploy that directory with the included `staticwebapp.config.json`, which preserves app routes and serves the designed 404 page. | 17 | — |
| 72 | Param Factory owns production deployment. | 5 | — |
| 73 | Build a CLI release artifact with `npm run pack:cli`; this repository does not publish it automatically. | 16 | — |
| 74 | Project records | 2 | — |
| 75 | Product brief | 2 | — |
| 76 | Visual thesis | 2 | — |
| 77 | Demo contract | 2 | — |
| 78 | Tested claims | 2 | — |
| 79 | Handoff | 1 | — |
| 80 | License | 1 | — |
| 81 | MIT. | 1 | — |
| 82 | See LICENSE. | 2 | — |

### Terminology

| Concept | Public term | Result |
| --- | --- | --- |
| Original exported copy | source folder | Consistent |
| New local copy | replacement folder | Consistent |
| Recovered test location | restore folder | Consistent |
| Generated output location | report folder | Consistent |
| Recovery exercise | restore test / restore sample | Distinct grammatical uses, no conflicting object name |
| Recursive filesystem shape | directory tree, defined once | Consistent |
| One-click sample experience | demo | Consistent; “sandbox” names only its isolated folder |

## Demo and sandbox verification

- One click on **Try it with sample data** navigated to `/?demo=1`, changed the
  title to “Demo — Storage Exit Check,” and focused “Inspect a complete sample
  check.”
- The first 390 px screen already showed the persistent “Demo — sample data,
  nothing is saved” banner, **Reset demo**, **Start for real**, the real CLI
  provenance sentence, and the recorded command with realistic sample data.
- The recording showed 5 source files, 6 replacement files, one extra, one
  timestamp-only difference, a passed content check, and 3 of 3 restored files.
  The page also exposed selected filenames and hashes, a printable report, and
  the four-file evidence archive.
- **Reset demo** restored the replay and announced “Demo reset. The original
  sample evidence is shown.” **Start for real** returned to `/`.
- A sentinel cookie, localStorage value, and sessionStorage value remained
  unchanged through entry, reset, and exit. No product storage appeared in
  cookies, localStorage, sessionStorage, or IndexedDB.
- The fresh-context request log contained only
  `https://storage-exit-check.sociobot.in` requests. No third-party request or
  console error occurred during the demo flow.
- After the service worker controlled `/demo`, an offline reload retained the
  complete demo, its heading, and its banner.
- The release CLI ran directly in
  `/tmp/storage-exit-review3-cli-w26OqM/demo`. It produced realistic source,
  replacement, and restored sample trees plus `audit.json`, `report.html`,
  `restore-sample.txt`, and `restore-report.html`; both checks passed. The
  registered filesystem and network guards independently passed as well.

## Declared claims

The 24 exact `test` commands in `.factory/claims.json` ran separately after
`npm ci` from clean clone `/tmp/storage-exit-review3-clean-TyePNX/repo` at the
candidate commit. Each claim ID occurs in exactly one tagged test.

| Claim | Result |
| --- | --- |
| `demo-complete` | PASS |
| `browser-demo-provenance` | PASS |
| `no-upload` | PASS |
| `check-write-boundary` | PASS |
| `offline-cli` | PASS |
| `mit-free` | PASS |
| `demo-isolated` | PASS |
| `cli-demo-isolated` | PASS |
| `default-demo-temp` | PASS |
| `read-only` | PASS |
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

The live landing, demo, install, privacy, and terms copy and the README were
cross-checked against these entries. The registered claims cover the demo
counts and provenance, local/network boundaries, offline and license facts,
input and output safety, hashing and redaction, sampling and reports,
filesystem edge cases, outcome and exit semantics, and JSON output. No
claim-like public sentence is absent from the registry.

## Earlier-finding audit

Every finding in `.factory/review-1.md` and `.factory/review-2.md` was checked
against the live site and current implementation. The polish files and prior
handoff were read as context, not accepted as proof.

| Earlier finding | Independent confirmation | Status |
| --- | --- | --- |
| F-1-1 | Real JPEG, CSV, Markdown, and text fixtures ship; the live report and ZIP resolve and match a fresh release run. | Fixed |
| F-1-2 | The first screen limits evidence to selected restored files and keeps the recovery caveat beside results. | Fixed |
| F-1-3 | README and `/install` make no unsupported Rust-version promise. | Fixed |
| F-1-4 | `cli-demo-isolated` traced the demo against synthetic user data and passed. | Fixed |
| F-1-5 | `default-demo-temp` ran without `--output`, resolved the printed path, and passed. | Fixed |
| F-1-6 | `browser-demo-provenance` matched transcript, counts, manifest, paths, hashes, report, and archive to a fresh release run. | Fixed |
| F-1-7 | No future release-binary promise appears in README or `/install`. | Fixed |
| F-1-8 | `redacted-restore` proves renamed samples require both size and SHA-256. | Fixed |
| F-1-9 | `duplicate-file-restore` proves two identical paths require two restored copies. | Fixed |
| F-1-10 | Public copy uses the tested input-folder boundary; `read-only` passed. | Fixed |
| F-1-11 | The unsupported host-log retention sentence is absent from live privacy copy and source. | Fixed |
| F-1-12 | The checklist is no longer a nested complementary landmark; live Axe found zero violations. | Fixed |
| F-1-13 | The live and static 404 include description, canonical, OG, Twitter, favicon, and apple-touch metadata. | Fixed |
| F-1-14 | The 404 uses the product wordmark, navigation, footer, build line, and external-site disclosure. | Fixed |
| F-1-15 | The live 404 h1 is “Page not found.” | Fixed |
| F-1-16 | The live 404 action is “Return home.” | Fixed |
| F-1-17 | The landing heading is “Preview the check and restore results.” | Fixed |
| F-1-18 | The installation label is “Install the CLI.” | Fixed |
| F-1-19 | Instructions consistently use source, replacement, restore, and report folder; directory tree is defined once. | Fixed |
| F-1-20 | README explains the redacted input-folder identifiers without the former jargon. | Fixed |
| F-1-21 | README removes `clap` and the directory-walker implementation phrase. | Fixed |
| F-1-22 | README and privacy use the direct no-usage-data and no-online-service statement. | Fixed |
| F-1-23 | Instructions use “folder shortcuts,” and the relevant refusal tests pass. | Fixed |
| F-2-1 | `check-write-boundary` traced a normal check and confined every write to the report folder. | Fixed |
| F-2-2 | `no-upload` visited all routes, both 404 forms, report, and archive and found no outside request. | Fixed |
| F-2-3 | “Original” is absent from public README copy; provenance remains in `.factory/design.md`. | Fixed |
| F-2-4 | README uses “Try the demo”; “sandbox” names only the isolated filesystem location. | Fixed |
| F-2-5 | README documents `dist/site/`, route/404 configuration, Factory deployment ownership, and CLI packaging. | Fixed |
| F-2-6 | Live terms and source say, “A sample result does not guarantee that every file can be recovered.” | Fixed |

No earlier finding is unfixed, half-fixed, or regressed.

## Structure, routing, accessibility, and identity

| Check | Result |
| --- | --- |
| Titles | PASS: home follows “Product — what it does”; demo, install, privacy, terms, and 404 have route-specific titles. |
| Metadata | PASS: every route has a description, canonical, OG/Twitter fields, 1200×630 product image, favicon, apple-touch icon, and theme color. |
| Semantics | PASS: `lang=en`, one h1, one main, ordered headings, and header/nav/main/footer on every route. |
| Deep links and history | PASS: real routes load directly; in-app navigation and Back update title and focus the destination h1. |
| 404 | PASS: an unknown live URL returns HTTP 404 with the designed botanical shell and **Return home**. |
| Links | PASS: every discovered product and Factory link returned 200; the intentional unknown route returned 404; mail links are valid schemes. |
| Header/footer | PASS: consistent shell with Privacy, Terms, Factory attribution, and version/build on all routes and the 404. |
| Mobile and keyboard | PASS: no overflow at 390 px, controls are at least 44 px, skip link works, focus is visible, and 200% text remains usable. |
| Accessibility | PASS: 12 live Axe scans across six routes at mobile and desktop widths found zero violations. |
| Motion and offline | PASS: reduced-motion behavior is tested; the current demo reloads offline. |
| Security/privacy headers | PASS: CSP, `frame-ancestors`, nosniff, referrer, permissions, and HSTS are response headers. |
| Console | PASS: no normal-route errors; the browser reports only the expected main-document 404 on the intentional unknown URL. |
| Assets | PASS: initial JavaScript is 12.62 kB, 4.88 kB gzip; no third-party font or script loads. |
| Visual identity | PASS: botanical field-guide art, paper palette, asymmetric specimen layout, serif/sans pairing, rules, and restrained motion match `.factory/design.md` and do not resemble a generic SaaS template. |
| Site skeleton | PASS: header, clear first screen, product preview, three steps, limits/privacy, install action, and footer appear in the required order. |

## Missed leverage

No missing AI, import/export, or sync feature is implied by the brief. The job
requires deterministic, offline, local file comparison and reproducible restore
evidence. Runtime AI would reduce determinism and privacy without helping that
job. The CLI already exports JSON, HTML, and text evidence; the demo provides a
downloadable four-file archive. The README correctly states that the product is
not a backup or sync tool.

## Quality-gate evidence

- Full `npm test`: PASS — 10 Rust tests and 33 Playwright tests.
- Every one of 24 exact claim commands: PASS from the clean clone.
- `npm run build`: PASS; produced `dist/site/`.
- Live request/storage/offline demo audit: PASS.
- Live route and link crawl: PASS, including the intentional HTTP 404.
- Live mobile and desktop Axe: zero violations on `/`, `/demo`, `/install`,
  `/privacy`, `/terms`, and the designed 404.
- Live normal routes emitted no console or page errors.

## What would make this perfect

Nothing remains to change for the reviewed brief and contract. The product is
clear on first read, tryable in one click, honest about the limits of a sample
restore, isolated from real data, fully claim-tested, accessible, and complete
for its defined local CLI job.
