# Independent verification — FAIL

**Candidate:** `9b1fb7c26abeb42f6231fe411795dd587fd8d716`  
**Live URL:** <https://storage-exit-check.sociobot.in>  
**Verified:** 2026-08-28  
**Verdict:** **FAIL — release-blocking contract defects remain.**

The previous deployment-only concern is not reproducible. Fresh production
build artifacts match the live deployment byte-for-byte. The failure is based
on the defects below, not an unavailable or stale deployment.

## First read

Opened the live landing page in a fresh browser context. It says it **checks a
storage move before cancelling**, is **for people leaving cloud storage who
need proof their local copy can restore**, and tells the visitor to **Try it
with sample data**. The one-click link opens `/demo`, which shows the
five-file CLI recording, the persistent “Demo — sample data, nothing is saved”
banner, Reset demo, and Start for real. This acceptance check passes.

## Release-blocking findings

### P1 — required CLI sample input is not shipped in `examples/`

The CLI demo runs successfully, but the CLI demo-sandbox contract requires
the sample input to ship in the repository under `examples/`. There is no
`examples/` directory in this candidate (`find . -type d -name examples`
returned no result). `.factory/demo.md` and the prior handoff both state that
the five fixtures are visible under `examples/`, which is false. The current
demo creates hard-coded files only at runtime.

**Required correction:** ship the realistic five-file input fixture under
`examples/`, have `storage-exit-check demo` use that shipped fixture (or
otherwise make it inspectable), and correct the docs/tests accordingly.

### P1 — hashed static assets do not have immutable, long-lived cache headers

The live hashed JavaScript, CSS, and image responses all return:

```
cache-control: public, must-revalidate, max-age=30
```

For example, this applies to `/assets/index-0Nx08--w.js`,
`/assets/index-MVr-3iab.css`, and `/field-guide-roots.webp`. The repository's
`staticwebapp.config.json` does not set cache headers for `/assets/*` or other
versioned static resources. This fails the performance contract requiring
long-lived immutable caching for hashed assets.

**Required correction:** configure deployment routes/headers so content-hashed
assets are served with a long `max-age` and `immutable`; keep HTML and
`sw.js` short-lived so updates remain discoverable.

## Other defects

### P2 — unknown paths return HTTP 200 instead of a real HTTP 404

`curl -I https://storage-exit-check.sociobot.in/missing-page` returns 200.
The SPA renders its attractive “This trail ends here” content, but the server
does not return a real 404 status because navigation fallback handles the
unknown path before the configured 404 override. This violates the site
structure contract's real 404 requirement and weakens crawler/error handling.

**Required correction:** configure fallback/route exclusions so unknown
paths serve the styled 404 document with HTTP 404 while documented SPA routes
continue to deep-link correctly.

## Claims: all declared commands passed

`npm ci` completed from the clean candidate checkout. Every exact test command
listed in `.factory/claims.json` passed. Each command uses the product's demo
entry point; captured command logs are in `/tmp/storage-exit-check-claim-*.log`.

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `demo-complete` | `npm test -- --grep @claim:demo-complete` | PASS |
| `no-upload` | `npm test -- --grep @claim:no-upload` | PASS |
| `offline-cli` | `npm test -- --grep @claim:offline-cli` | PASS |
| `mit-free` | `npm test -- --grep @claim:mit-free` | PASS |
| `demo-isolated` | `npm test -- --grep @claim:demo-isolated` | PASS |
| `read-only` | `npm test -- --grep @claim:read-only` | PASS |
| `hash-differences` | `npm test -- --grep @claim:hash-differences` | PASS |
| `redacted-report` | `npm test -- --grep @claim:redacted-report` | PASS |
| `repeatable-sample` | `npm test -- --grep @claim:repeatable-sample` | PASS |
| `printable-report` | `npm test -- --grep @claim:printable-report` | PASS |

## Build and CLI verification

- `cargo fmt --all -- --check`: PASS.
- `cargo clippy --all-targets -- -D warnings`: PASS.
- `npm test`: PASS — 5 Rust unit tests and 12 Playwright tests.
- `npm run build`: PASS — release binary at
  `target/release/storage-exit-check`; static deployment at `dist/site/`.
- `npm run pack:cli`: PASS — verified 55.4 KiB crate.
- Installed the packed crate into a new consumer root, ran `--help`, then
  `storage-exit-check demo --output …`: PASS; the demo wrote `audit.json` and
  `restore-report.html` and reported 3 of 3 restored files passed.
- Independent release-binary flow: two matching files checked cleanly and a
  two-file restore passed; changed content returned exit 2; same source and
  replacement returned exit 1 with recovery guidance; empty source returned
  exit 2; a missing restore returned exit 3.

## Live deployment and privacy evidence

- Fresh `dist/site/index.html`, JS, CSS, and hero image SHA-256 values exactly
  match their live counterparts. The deployed build is therefore this
  candidate, not a deployment-only failure.
- Cold live load made only same-origin requests: HTML, hashed JS, hashed CSS,
  and `field-guide-roots.webp`. No console or page errors occurred.
- Demo mode had no localStorage, sessionStorage, or IndexedDB records. No
  third-party scripts, fonts, trackers, cookies, sign-in, or server API exists.
  Rate-limit testing is not applicable: the product exposes no server-side API
  endpoint.
- HSTS, `nosniff`, strict-origin referrer policy, permissions policy, and a
  same-origin CSP are present on the live response.
- The service worker controlled the live page and an offline reload of `/demo`
  after an online visit rendered the demo successfully with HTTP 200.

## UI, accessibility, and performance evidence

- Desktop and 390×844 mobile live checks: no horizontal overflow, no console
  or page errors, first Tab reaches Skip to content, and the focus outline is
  a visible 3 px ochre ring. Keyboard Enter on Start for real routes home and
  moves focus to the new h1.
- Live axe scans of desktop and mobile demo flows found zero serious or
  critical violations. The full local Playwright suite likewise passed its axe
  route scan.
- `prefers-reduced-motion: reduce` reduces animation/transition duration to
  `0.01ms`, turns smooth scroll off, and leaves the hero fully visible.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ …`: PASS: title,
  `lang=en`, one h1, main landmark, image alt, labelled buttons, and no
  console errors; local observed load was 595 ms.
- Lighthouse 12.8.2, live mobile: Performance **98**, Accessibility **100**,
  FCP **0.9 s**, LCP **1.3 s**, CLS **0**, TBT **160 ms**. Initial transfer
  total was 90 KiB; built gzip JS was 4.1 KiB and CSS 3.1 KiB; hero WebP was
  83.7 KiB. All are within the stated bundle budgets.

## Evidence locations

- Live screenshots: `/tmp/storage-exit-live-desktop.png`,
  `/tmp/storage-exit-live-mobile-qa.png`.
- Local URL verification: `/tmp/storage-exit-verify-url-Gqny2Z/verify.json`.
- Lighthouse JSON: `/tmp/storage-exit-lighthouse.json`.
- CLI normal-flow sandbox: `/tmp/storage-exit-success-tvxIrD`.
- Packed-consumer sandbox: `/tmp/storage-exit-consumer-fe5Mnf`.
