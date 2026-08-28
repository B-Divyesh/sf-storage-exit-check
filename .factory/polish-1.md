# Polish round 1 — finding closure

**Base review:** `346002713869cc62a47bbda59de174dae0aaaccf`  
**Repaired candidate:** `e043292a6db441c6356d39411c1e4b616e2c8bb7` plus this final evidence update  
**Live URL:** https://storage-exit-check.sociobot.in  
**Result:** all 23 findings closed; no known unresolved finding.

The live home and demo screenshots are
[`evidence/live-home/screenshot-mobile.png`](evidence/live-home/screenshot-mobile.png)
and
[`evidence/live-demo/screenshot-mobile.png`](evidence/live-demo/screenshot-mobile.png).
Desktop captures sit beside them. The full independent claim-command log is
[`evidence/clean-claim-tests.log`](evidence/clean-claim-tests.log).

| Finding | Change made | Test evidence | Live evidence |
| --- | --- | --- | --- |
| F-1-1 | Replaced five placeholder text files with two valid original JPEGs, a checklist, inventory, and recipe notes. The replacement adds a benign NAS note and one timestamp-only difference. Build output now includes the CLI-generated audit, printable reports, restore plan, and ZIP with visible view/download actions. | `@regression:inspectable-demo-fixtures`; `@claim:demo-complete`; `@claim:browser-demo-provenance` | `/?demo=1`; demo screenshots; `/sample-evidence/report.html` and ZIP returned 200. |
| F-1-2 | First-screen sentence now says the tool provides evidence that selected files restore. Every verdict keeps the disaster-recovery caveat adjacent. | `landing page has the required structure at 390px`; `@claim:printable-report` | Home screenshot shows the narrowed sentence; demo screenshot shows the scope note. |
| F-1-3 | Removed the unsupported Rust 1.75 minimum from README and `/install`; no exact compiler minimum remains. | `@regression:routing-metadata`; repository copy search | Live `/install` contains no version promise. |
| F-1-4 | Added `cli-demo-isolated`; an LD_PRELOAD trace checks file opens and writes against a synthetic user-data folder. | `@claim:cli-demo-isolated` | Deployed demo banner and transcript use the tested sandbox wording. |
| F-1-5 | Added the default no-`--output` contract and verifies the printed canonical path is beneath the OS temp folder. | `@claim:default-demo-temp` | Live `/install` documents the tested default. |
| F-1-6 | `scripts/generate-demo.mjs` runs the release binary and generates the transcript, audit, reports, restore plan, and ZIP. The browser comparison checks counts, manifest, paths, and hashes against a fresh release run. | `@claim:browser-demo-provenance` | Live audit SHA-256 matches `dist/site`; live report and ZIP returned 200. |
| F-1-7 | Removed the future release-binary promise. Source installation remains the only advertised install path. | repository copy search; `npm run pack:cli` | Live `/install` contains no future distribution promise. |
| F-1-8 | Added redacted restore coverage with a correct renamed file and a wrong same-size file. | `@claim:redacted-restore` | README publishes only the tested size-and-SHA-256 behavior. |
| F-1-9 | Added a two-path identical-content fixture; one restored copy fails one sample and two copies pass both. | `@claim:duplicate-file-restore` | README states identical files at two paths count twice. |
| F-1-10 | Replaced the absolute deletion/cancellation promise everywhere with “The check does not modify either input folder.” | `@claim:read-only`; repository copy search | Live boundary copy uses the tested scope. |
| F-1-11 | Removed the unsupported “short security logs” sentence. The privacy page now states only client-observable request and storage behavior. | `@claim:no-upload`; `@claim:demo-isolated` | Live `/privacy`; live audit recorded zero outside requests, cookies, or browser records. |
| F-1-12 | Replaced the nested complementary landmark with a normal `.cancel-checklist` container and made the suite fail on Axe findings of every impact. | `all routes are keyboard reachable and have no Axe findings` | Live Axe scan found zero violations on all product routes and 404. |
| F-1-13 | Added apple-touch, Open Graph, Twitter card, image dimensions, canonical, description, and 404-specific title metadata. | `@regression:static-hosting preserves app deep links, asset caching, and HTTP 404` | Unknown live URL returned 404; [`evidence/live-404.html`](evidence/live-404.html) contains the complete metadata. |
| F-1-14 | Static 404 now duplicates the normal SVG wordmark, nav, footer, external-site suffix, spacing, targets, focus, and botanical surface. | static-hosting regression; mobile target regression | Live 404 returned one h1/main, zero Axe violations, no overflow, and 44 px minimum target. |
| F-1-15 | Changed 404 h1 to “Page not found.” | static-hosting regression | Live unknown URL contains `<h1>Page not found</h1>`. |
| F-1-16 | Changed the 404 action to “Return home.” | static-hosting regression | Live unknown URL contains the home action. |
| F-1-17 | Changed the landing heading to “Preview the check and restore results.” | copy audit; landing structure test | Live home screenshot shows the new section heading. |
| F-1-18 | Changed the installation label to “Install the CLI.” | copy audit | Live home screenshot shows the direct label. |
| F-1-19 | Standardized public instructions on source folder, replacement folder, restore folder, and report folder; “directory tree” is defined once in README. | `.factory/copy-audit.md`; CLI help consumer run | Live home, install, privacy, and terms copy use the same terms. |
| F-1-20 | Replaced “opaque root fingerprints” with a plain explanation of non-readable input-folder identifiers and their boundary use. | `@claim:separate-restore`; copy audit | README contains the plain explanation. |
| F-1-21 | Replaced implementation jargon with “The CLI uses Rust and SHA-256. It records symbolic links without opening their targets.” | `@claim:symlink-policy`; copy audit | Published README contains the revised summary. |
| F-1-22 | Replaced telemetry/API jargon with “The CLI sends no usage data and does not call an online service while it runs.” | `@claim:no-upload`; `@claim:offline-cli` | Live `/privacy` contains the plain tested statement. |
| F-1-23 | Replaced “symbolic-link aliases” in instructions with folder-shortcut behavior and a direct refusal message. | `@claim:read-only`; `@claim:separate-restore` | Live `/install` and published README use the revised wording. |

## Final evidence

- Full local suite: `npm test` — 10 Rust tests and 32 Playwright tests passed.
- Clean clone: all 23 exact `.factory/claims.json` commands passed at
  `e043292a6db441c6356d39411c1e4b616e2c8bb7`.
- Packaging: `cargo package` produced a 372.6 KiB crate; an offline install into
  a fresh consumer root completed the demo and wrote all four evidence files.
- Static build: initial JS 12.61 KiB (4.87 KiB gzip); CSS 10.38 KiB (3.34 KiB
  gzip); `dist/site/` produced.
- Live Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 0.8 s, CLS 0, TBT 20 ms. Full result:
  [`evidence/lighthouse-live.json`](evidence/lighthouse-live.json).
- Live browser audit: all routes had one h1/main, zero Axe violations, no
  overflow, and 44 px minimum controls. Demo storage and outside requests were
  empty; offline reload passed. See
  [`evidence/live-browser-audit.json`](evidence/live-browser-audit.json).
- Deployed artifact hashes: [`evidence/deployed-hashes.txt`](evidence/deployed-hashes.txt).
