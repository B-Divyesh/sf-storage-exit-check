# Adversarial first-read review 1 — Storage Exit Check

**Reviewed:** 2026-08-28 UTC

**Candidate:** `10709198c2225b289fad6cea4f0068d3a43fff05`

**Live URL:** https://storage-exit-check.sociobot.in
**Verdict:** **FAIL**

The first screen is clear and all 18 declared claim commands pass. The product
still has blocking demo and claims-contract findings, plus copy, accessibility,
and 404 defects. A PASS requires zero findings and no untested public claim.

## Cold first read

Fresh Chromium contexts opened the live home page at 390×844 and 1440×900.
Neither context scrolled before this assessment.

- **What does it do?** It checks a cloud-to-local storage move, tests a sample
  restore, and produces evidence to review before cancelling cloud storage.
- **For whom?** People moving files from cloud storage to local disks or a NAS.
- **What should I click first?** **Try it with sample data**.

All three answers were visible above the fold at both widths. The exact first
screen text was “Check your storage move before cancelling,” “For people
leaving cloud storage who need proof their local copy can restore,” and “Try it
with sample data.” The clarity gate passes, subject to F-1-2's overclaim.

## Findings

### Blocking

#### F-1-1 — The sample data is placeholder content and the demo withholds the core report

**Location/quote:** `examples/source/Documents/passport-scan.txt` contains
“Sample passport scan placeholder”; both files presented as photos are small
text files containing “Sample coast photo bytes” and “Sample garden photo
bytes.” The one-click `/demo` page shows a hand-written terminal transcript but
does not let the visitor inspect the audit, restore plan, or either printable
report that it says the CLI wrote.

**Why this fails:** The demo contract requires realistic, opinionated sample
data. A five-file all-green tree made from explicit placeholders does not show
how the product handles a believable storage move. The job-to-be-done centers
on cancellation-ready evidence, but the visitor cannot inspect that evidence.
This is both a weak demo and missed leverage implied directly by the brief.

**Concrete fix:** Ship a small, original, realistic tree with valid document,
image, and note files, nested folders, one harmless extra replacement file, and
a timestamp-only difference. Generate the browser transcript and sample report
from the real binary during the build. Add **View sample report** and **Download
sample evidence** actions on `/demo`, and test that their counts and hashes
match a fresh CLI demo run.

#### F-1-2 — The first screen overstates what the restore sample proves

**Location/quote:** Home first screen: “For people leaving cloud storage who
need proof their local copy can restore.”

**Why this fails:** The tool verifies selected files, not the recoverability of
the whole local copy. The later sentence “A sample restore does not prove full
disaster recovery” narrows the promise, but a first-time visitor sees the broad
“proof” claim first. No `claims.json` entry tests the broad claim.

**Concrete fix:** Replace it with: “For people leaving cloud storage who need
evidence that selected files restore from their local copy.” Keep the recovery
caveat adjacent to any report verdict.

#### F-1-3 — The Rust 1.75 compatibility claim is unlisted and untested

**Location/quote:** README and `/install`: “Rust 1.75 or newer is required.”

**Why this fails:** `.factory/claims.json` has no compatibility claim,
`Cargo.toml` has no `rust-version`, and the review environment only proves the
build with Rust 1.98. A visitor may rely on the stated minimum and fail to
install.

**Concrete fix:** Add `rust-version = "1.75"`, add a claim entry, and build and
run the packaged demo under Rust 1.75 in CI. Otherwise remove the exact version.

#### F-1-4 — CLI demo filesystem isolation is an unlisted claim

**Location/quote:** Landing transcript: “Demo — sample data, nothing is saved
outside this folder.” README: “It does not read or write your real data.”

**Why this fails:** `demo-isolated` tests browser cookies and storage only.
`demo-complete` runs the CLI in a supplied temp directory but does not observe
filesystem access outside it. The public CLI isolation promise therefore has
no matching claim entry or sandbox assertion.

**Concrete fix:** Add a `cli-demo-isolated` claim. Run the demo in an OS-level
filesystem sandbox or trace file opens/writes, allow the executable and system
libraries to be read, and assert user-data paths are never opened and writes
stay beneath the printed sandbox directory.

#### F-1-5 — The default demo temp-directory behavior is unlisted

**Location/quote:** `/install`: “The command creates sample folders under your
system temp directory.”

**Why this fails:** Every tagged demo test passes `--output`; none invokes the
documented default and confirms the resulting path is beneath the operating
system temp directory.

**Concrete fix:** Add this behavior to a claim and run `storage-exit-check demo`
without `--output`; parse the printed sandbox path and assert its canonical
parent is the system temp directory.

#### F-1-6 — The browser recording's claimed provenance is not tested

**Location/quote:** `/demo`: “This recording comes from the real CLI using five
bundled sample files.”

**Why this fails:** `@claim:demo-complete` executes the CLI, but it never opens
the browser page or compares the rendered transcript with the CLI result. The
browser transcript is separately hard-coded in `site/src/app.ts`, so it can
drift while the claim test remains green.

**Concrete fix:** Generate a checked demo-result fixture from the release
binary, render `/demo` from that fixture, and make the tagged test compare the
page's file counts, verdict, sample count, and report names with the fresh CLI
output.

#### F-1-7 — README promises future release binaries without a claim or current artifact

**Location/quote:** README: “The factory publishes release binaries after this
repository is accepted.”

**Why this fails:** This is a future distribution promise that a user may rely
on, but it has no claim entry or observable release URL. The current install
instructions require a source build.

**Concrete fix:** Remove the sentence until a tested release artifact and URL
exist. Once published, add a claim that installs the current release in a fresh
consumer environment and runs `demo`.

#### F-1-8 — Redacted restore lookup behavior is unlisted

**Location/quote:** README: “The restore verifier then finds samples by size
and SHA-256.”

**Why this fails:** `redacted-report` tests that names and roots disappear, but
its tagged test never completes a restore from a redacted audit. The sentence
promises additional behavior absent from the claim text and tagged evidence.

**Concrete fix:** Add a redacted-restore claim and test a successful restore
from a redacted audit, including a wrong same-size file that must fail its
SHA-256 check.

#### F-1-9 — Duplicate-file handling is unlisted

**Location/quote:** README: “Restore each sampled copy because identical files
are counted separately.”

**Why this fails:** No claim entry or tagged test creates two identical files
at different paths and confirms that both remain distinct samples during
redacted restore verification.

**Concrete fix:** Add a duplicate-file claim and a two-path fixture that proves
both copies are counted and required, or remove the public assertion.

#### F-1-10 — The absolute no-removal/no-cancellation promise exceeds its claim test

**Location/quote:** README: “The tool never removes source files or cancels a
storage subscription.”

**Why this fails:** `read-only` covers the `check` command's input trees. It
does not state or test the broader promise across every command, and nothing in
the claims registry names subscription cancellation.

**Concrete fix:** Replace the sentence with the tested scope: “The check does
not modify either input folder.” If the broader promise is retained, list it
and exercise every subcommand under filesystem and network guards.

#### F-1-11 — The host-log privacy statement is vague and untested

**Location/quote:** `/privacy`: “Our host may keep short security logs for
abuse prevention.”

**Why this fails:** “Short” gives no retention period, and neither the request
log test nor any claim entry can confirm server-side retention. A privacy
visitor cannot determine what is logged or for how long.

**Concrete fix:** Name the data fields, host/controller, and exact retention
period from an authoritative hosting policy. Link that policy and list the
documented exception in the privacy claim; otherwise remove the unsupported
retention adjective.

### Major and minor

#### F-1-12 — The home page has a moderate Axe landmark violation

**Location/quote:** Home `<aside><h3>Before you cancel</h3>…</aside>` inside
`<main>`. Axe 4.10 reports `landmark-complementary-is-top-level` at both
390 px and 1440 px.

**Why this fails:** The element becomes a complementary landmark nested inside
another landmark. The local suite filters out moderate findings, so it passes
without detecting this semantic defect.

**Concrete fix:** Use a normal `<div>` for content that belongs to the current
section, or give it the correct labeled region semantics. Add an Axe assertion
for all impacts, with explicit reviewed exceptions if necessary.

#### F-1-13 — The real 404 omits required metadata

**Location/quote:** Live unknown route returns 404, but `site/public/404.html`
has no Open Graph fields, Twitter card fields, OG image, or apple-touch icon.

**Why this fails:** The site-structure contract requires the metadata set per
route. Shared product links can therefore produce an incomplete preview on the
error route.

**Concrete fix:** Add the same product-derived OG/Twitter image metadata and
apple-touch icon used by app routes, with the 404-specific title and
description.

#### F-1-14 — The 404 header/footer are not the shared shell

**Location/quote:** At 390 px the 404 wordmark omits the sprout mark, uses a
different header layout, and “Built by Param Factory” lacks the normal
screen-reader suffix “(external site).”

**Why this fails:** The contract requires consistent header/footer content and
external-link disclosure on every route. The error page looks related, but it
is a separate reduced implementation.

**Concrete fix:** Reuse or faithfully duplicate the standard shell, including
the SVG wordmark, external-site label, spacing, focus treatment, and footer.

#### F-1-15 — The 404 headline is a metaphor, not the page name

**Location/quote:** 404 `<h1>`: “This trail ends here.”

**Why this fails:** Heard out of context in a heading list, it does not say that
the page was not found. It violates the plain-words heading rule.

**Concrete fix:** Use “Page not found.” Keep the field-guide phrase only as
optional supporting copy.

#### F-1-16 — The 404 action names a metaphorical destination

**Location/quote:** 404 action: “Return to the field guide.”

**Why this fails:** The destination is the home page, not a feature called a
field guide. A visitor should not need the visual metaphor to predict the
result.

**Concrete fix:** Use “Return home.”

#### F-1-17 — A landing heading does not name its section

**Location/quote:** Home `<h2>`: “See the evidence before you trust it.”

**Why this fails:** In a heading list, “it” has no referent and the wording does
not identify the CLI preview.

**Concrete fix:** Use “Preview the check and restore results.”

#### F-1-18 — A landing label is mood copy

**Location/quote:** Home section label: “Ready for your files?”

**Why this fails:** It asks a rhetorical question instead of identifying the
installation section.

**Concrete fix:** Use “Install the CLI.”

#### F-1-19 — The same filesystem concepts use inconsistent terms

**Location/quote:** Landing and README alternate among “trees,” “folders,”
“directory,” “input tree,” “restore directory,” and “output folder.”

**Why this fails:** A first-time CLI user must infer which terms are synonyms
and which identify different paths.

**Concrete fix:** Use **source folder**, **replacement folder**, **restore
folder**, and **report folder** in user instructions. Define **directory tree**
once only when explaining recursive comparison.

#### F-1-20 — “Opaque root fingerprints” is unexplained jargon

**Location/quote:** README: “Redacted audits keep opaque root fingerprints only
for this boundary check; they do not reveal directory paths.”

**Why this fails:** A reader cannot tell what a fingerprint is or whether it
exposes the path.

**Concrete fix:** Use: “A redacted audit stores non-readable identifiers for
the two input folders. The verifier uses them only to reject those folders as
restore locations.”

#### F-1-21 — The implementation summary uses internal jargon

**Location/quote:** README: “The CLI uses Rust, clap, SHA-256, and a
non-following directory walker.”

**Why this fails:** “clap” and “non-following directory walker” describe
implementation internals without telling the reader what behavior they get.

**Concrete fix:** Use: “The CLI uses Rust and SHA-256. It records symbolic
links without opening their targets.”

#### F-1-22 — The no-network sentence uses unexplained jargon

**Location/quote:** README: “There is no telemetry or runtime cloud API.”

**Why this fails:** “Telemetry” and “runtime cloud API” are less direct than the
observable privacy behavior.

**Concrete fix:** Use: “The CLI sends no usage data and does not call an online
service while it runs.” Keep it mapped to `no-upload`.

#### F-1-23 — “Symbolic-link aliases” is not introduced in plain words

**Location/quote:** README: “The command resolves symbolic-link aliases and
stops before writing if the output is inside either tree.”

**Why this fails:** A user can follow the safety instruction without the
specialist term, but the current sentence assumes they know it.

**Concrete fix:** Use: “The command follows any folder shortcuts before it
checks the report location. It refuses to write inside either input folder.”
Define “symbolic link” separately in the filesystem notes.

## Demo and sandbox evidence

- One click on **Try it with sample data** navigated to `/demo` and focused
  “Inspect a complete sample check.”
- The first mobile screen showed the persistent demo banner, five source files,
  five replacement files, a passed content check, and a 3-of-3 restore result.
- **Reset demo** reapplied the terminal replay state and announced “Demo reset.”
- **Start for real** returned to `/`.
- Fresh browser storage remained empty: no cookies, localStorage,
  sessionStorage, or IndexedDB records.
- Requests during home and demo use were same-origin only. No console or page
  errors occurred on the product routes.
- The release CLI ran in `/tmp/storage-exit-review1-demo-cYfxCX`; it wrote its
  sample trees and four evidence files there and reported 5/5 files, zero
  differences, and 3/3 restored files.
- The demo mechanics pass, but F-1-1, F-1-4, F-1-5, and F-1-6 prevent demo
  acceptance.

## Declared claims

Every exact command in `.factory/claims.json` ran after `npm ci` from clean
clone `/tmp/storage-exit-review1-clone-UKzxph` at the candidate commit.

| Claim | Result |
| --- | --- |
| `demo-complete` | PASS |
| `no-upload` | PASS |
| `offline-cli` | PASS |
| `mit-free` | PASS |
| `demo-isolated` | PASS |
| `read-only` | PASS |
| `hash-differences` | PASS |
| `redacted-report` | PASS |
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

No listed command failed. F-1-2 through F-1-11 identify public claims that are
overbroad, absent from the registry, or not asserted at their published
location. Those claims remain untested even though every listed command passes.

## Copy audit

Count method: whitespace-separated words. Headings, labels, navigation,
buttons, facts, captions, and terminal result lines are included. Code blocks,
bare paths, and the build identifier are not prose sentences. No counted unit
exceeds 22 words, and no banned marketing adjective appears.

### Landing page

| Copy | Words | Flag |
| --- | ---: | --- |
| Storage Exit Check | 3 | — |
| Demo | 1 | — |
| Install | 1 | — |
| Privacy | 1 | — |
| Field note 01 · migration evidence | 6 | — |
| Check your storage move before cancelling | 6 | — |
| For people leaving cloud storage who need proof their local copy can restore. | 13 | F-1-2 |
| Try it with sample data | 6 | — |
| See a complete check and restore test in one click. | 10 | — |
| No files uploaded | 3 | — |
| Works without internet | 3 | — |
| Free under the MIT License | 5 | — |
| Plate A. | 2 | — |
| Two file trees, checked at the root. | 7 | F-1-19 |
| Observed result | 2 | — |
| See the evidence before you trust it | 7 | F-1-17 |
| The command checks content, selects a repeatable sample, and writes a printable report. | 13 | — |
| sample audit | 2 | — |
| Demo — sample data, nothing is saved outside this folder | 9 | F-1-4 |
| Scanned 5 source files and 5 replacement files | 8 | — |
| Content check: passed | 3 | — |
| Restore sample: 3 of 3 passed | 6 | — |
| A sample test does not prove full disaster recovery. | 9 | — |
| Method | 1 | — |
| How the check works | 4 | — |
| Compare both trees | 3 | F-1-19 |
| Point the command at your source and replacement folders. | 9 | F-1-19 |
| Restore the sample | 3 | — |
| Recover the selected files into a separate empty folder. | 9 | F-1-19 |
| Keep the report | 3 | — |
| Verify the restored hashes and print the evidence. | 8 | — |
| Boundary notes | 2 | — |
| Know what this check does not prove | 7 | — |
| A sample restore does not prove full disaster recovery. | 9 | — |
| The check reads both trees and writes only to your output folder. | 12 | F-1-19 |
| Before you cancel | 3 | — |
| Review off-site copies. | 3 | — |
| Keep recovery keys available. | 4 | — |
| Check retention dates. | 3 | — |
| Open the printed report. | 4 | — |
| Ready for your files? | 4 | F-1-18 |
| Run the check on your computer | 6 | — |
| Read the install guide | 4 | — |
| Evidence before you leave cloud storage. | 6 | — |
| Privacy | 1 | — |
| Terms | 1 | — |
| Built by Param Factory | 4 | — |

### README

| Copy | Words | Flag |
| --- | ---: | --- |
| Storage Exit Check | 3 | — |
| Check a storage move and test a restore sample before cancelling cloud storage. | 13 | — |
| This local CLI is for people moving files to a NAS or local disks. | 14 | — |
| Storage Exit Check compares each regular file by size and SHA-256. | 11 | — |
| It explains missing, changed, and extra items. | 7 | — |
| It then selects a repeatable restore sample and writes a printable evidence packet. | 13 | — |
| The check does not change either input tree, and it makes no network requests. | 14 | F-1-19 |
| It is evidence for a cancellation decision, not a backup or sync tool. | 13 | — |
| A sample restore does not prove full disaster recovery. | 9 | — |
| Try the sandbox | 3 | — |
| The demo copies the five inspectable fixtures in `examples/source` into a new system temp directory for both trees. | 18 | F-1-1, F-1-19 |
| It checks their content, restores three selected files, and prints the evidence path. | 13 | — |
| It does not read or write your real data. | 9 | F-1-4 |
| The recorded browser demo is at storage-exit-check.sociobot.in/demo. | 7 | — |
| Its sample data is bundled and it stores no demo records in the browser. | 14 | — |
| Install | 1 | — |
| Rust 1.75 or newer is required. | 6 | F-1-3 |
| The factory publishes release binaries after this repository is accepted. | 10 | F-1-7 |
| The worker does not publish packages or releases. | 8 | — |
| Check a storage move | 4 | — |
| The new output directory contains: | 5 | F-1-19 |
| `audit.json`: machine-readable counts, differences, hashes, and sample; | 7 | — |
| `report.html`: printable migration evidence; | 4 | — |
| `restore-sample.txt`: the files to recover from the replacement backup. | 9 | — |
| The output must be outside both input trees. | 8 | F-1-19 |
| The command resolves symbolic-link aliases and stops before writing if the output is inside either tree. | 16 | F-1-19, F-1-23 |
| Restore the selected files into a separate empty directory. | 9 | F-1-19 |
| Do not copy them from the source tree. | 8 | F-1-19 |
| Then verify them: | 3 | — |
| The command writes `restore-report.html` beside the audit. | 7 | — |
| Keep both HTML reports with your cancellation records. | 8 | — |
| Restore verification refuses an audit whose content check failed. | 9 | — |
| It also refuses either audited input tree, a directory inside one, and symbolic-link aliases, before it writes a restore report. | 20 | F-1-19, F-1-23 |
| Redacted audits keep opaque root fingerprints only for this boundary check; they do not reveal directory paths. | 17 | F-1-20 |
| Redact filenames | 2 | — |
| Redaction removes roots, filenames, and directory paths from every evidence file. | 11 | — |
| The restore verifier then finds samples by size and SHA-256. | 10 | F-1-8 |
| Restore each sampled copy because identical files are counted separately. | 10 | F-1-9 |
| Script with JSON | 3 | — |
| Place the global `--json` flag before the command: | 8 | — |
| Exit codes are stable: | 4 | — |
| Code: Meaning | 2 | — |
| 0: Content check passed, or every restore sample passed. | 9 | — |
| 1: A path, permission, or evidence file could not be read. | 11 | — |
| 2: The source and replacement have missing or changed content. | 10 | — |
| 3: A restore sample failed, or its content audit was incomplete. | 11 | — |
| 64: The command usage or an option value is invalid. | 10 | — |
| Extra replacement files are reported but do not fail a check. | 11 | — |
| An empty source, or a tree without matching regular files, does fail. | 12 | F-1-19 |
| Filesystem notes | 2 | — |
| Symbolic links are recorded as links and never followed. | 9 | — |
| A filename that is not valid UTF-8 stops the check instead of being merged or rewritten. | 16 | — |
| Timestamp-only differences are reported but do not fail content checks. | 10 | — |
| Filesystems round timestamps differently, so SHA-256 decides file equality. | 9 | — |
| Hashing reads every regular file and can take time on large trees. | 12 | F-1-19 |
| Reports contain paths and content hashes unless `--redact` is used. | 10 | — |
| The tool never removes source files or cancels a storage subscription. | 11 | F-1-10 |
| Develop and verify | 3 | — |
| `npm test` runs Rust unit tests, builds the site, runs every claim test, and checks serious accessibility findings. | 18 | — |
| `npm run build` compiles the release CLI and writes the static site to `dist/site/`. | 14 | — |
| Run only one documented claim: | 5 | — |
| Create the publishable Rust package without publishing it: | 8 | — |
| The site is Vite with vanilla TypeScript. | 7 | — |
| The CLI uses Rust, clap, SHA-256, and a non-following directory walker. | 11 | F-1-21 |
| There is no telemetry or runtime cloud API. | 8 | F-1-22 |
| Project records | 2 | — |
| Product brief | 2 | — |
| Visual thesis | 2 | — |
| Demo contract | 2 | — |
| Tested claims | 2 | — |
| Handoff | 1 | — |
| License | 1 | — |
| MIT. | 1 | — |
| See LICENSE. | 2 | — |

### Terminology decision needed

| Concept | Current words | Recommended word |
| --- | --- | --- |
| Compared filesystem location | tree, folder, directory, input tree | folder |
| Original exported copy | source, source tree | source folder |
| New local copy | replacement, replacement backup, local copy | replacement folder |
| Recovered test location | restore directory, restored sample, separate empty folder | restore folder |
| Generated output location | output directory, output folder, evidence packet | report folder |
| Recovery exercise | restore sample, sample restore, restore test | restore test |

## Structure, routing, privacy, and accessibility

| Check | Result |
| --- | --- |
| Route titles | PASS for `/`, `/demo`, `/install`, `/privacy`, `/terms`, and 404 |
| One h1, one main, heading order | PASS on every route |
| Meta description and canonical | PASS on app routes and 404 |
| OG/Twitter/favicon/apple-touch | PASS on app routes; FAIL on 404 per F-1-13 |
| Deep links | PASS; documented routes returned 200 |
| Browser back and route focus | PASS; h1 focus and live announcement restored |
| Unknown route | PASS HTTP status/design; returns a styled 404 |
| Link crawl | PASS after retry; all internal links and Factory link returned 200 |
| Header/footer | PASS on app routes; FAIL on 404 per F-1-14 |
| Mobile overflow and targets | PASS; no overflow and every live app control measured at least 44×44 px |
| Reduced motion | PASS in the production suite |
| Contrast | PASS Axe color-contrast checks |
| Axe | FAIL; one moderate home-page violation, F-1-12 |
| Request privacy | PASS; same-origin only, no cookies or browser records |
| Visual identity | PASS; botanical field-guide system is distinct and matches `.factory/design.md` |
| Initial JavaScript | PASS; 4.11 KiB gzip |
| AI | Not warranted; deterministic local hashing is the appropriate implementation |

## Earlier-finding audit

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files.
The prior handoff and all four independent verification records were checked.

| Earlier finding | Live and code confirmation | Status |
| --- | --- | --- |
| Missing inspectable `examples/` fixtures | Files now exist; CLI embeds them; regression test passes | Fixed, but realism now fails F-1-1 |
| Hashed assets lacked immutable caching | Live JS, CSS, and both hashed WebPs return one-year immutable caching | Fixed |
| Unknown paths returned 200 | Live unknown route returned HTTP 404 | Fixed |
| Non-UTF-8 filenames collapsed | `path-identity` rejects them and passed from the clean clone | Fixed |
| Output could be written inside an input | `read-only` covers descendants, aliases, and default output; passed | Fixed |
| Failed content audit could produce a passing restore | `incomplete-audit` blocks it; passed | Fixed |
| Public behavior claims were absent | The previously named behaviors now have entries and passing tests | Fixed; new gaps are F-1-2–F-1-11 |
| Invalid usage returned code 2 | `exit-semantics` confirms code 64 | Fixed |
| Mobile targets were below 44 px | Live controls measured at least 44×44 px | Fixed |
| Demo docs named the wrong exit destination | `.factory/demo.md` now says home; live action returns to `/` | Fixed |
| Restore verification accepted original input trees | `separate-restore` rejects roots, descendants, and aliases; passed | Fixed |

No earlier finding regressed.

## Quality-gate evidence

- `npm test`: PASS — 10 Rust tests and 26 Playwright tests.
- `npm run build`: PASS — release CLI and `dist/site/` produced.
- `cargo fmt --all -- --check`: PASS.
- `cargo clippy --all-targets -- -D warnings`: PASS.
- Live pages had one h1, one main, `lang=en`, no horizontal overflow, and no
  product-route console errors.
- Live asset, security-header, sitemap, robots, service-worker, and dead-link
  checks passed except for findings already listed.

## What would make this perfect

Resolve every finding above, then rerun the review from a fresh clone and fresh
browser contexts. In particular, make the one-click demo show realistic files
and the actual generated evidence; align every public claim with one tagged
sandbox test; clear all Axe violations; use the shared shell and full metadata
on the 404; and replace the remaining metaphor, jargon, and inconsistent path
terms. There is no PASS-adjacent shortcut: all 23 findings must reach zero.
