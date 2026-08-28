# Storage Exit Check handoff — QA repair

## Status: repaired and ready to deploy

This repair starts from independent-verifier candidate
`9b1fb7c26abeb42f6231fe411795dd587fd8d716` and addresses every finding in
`.factory/verification.md`. The implementation repair is commit
`67bb25f5e7c0a89b89d8c6f5d1f906d32b636acb`.

## Corrections

1. The CLI demo now uses the five inspectable fixtures in `examples/source/`.
   Their bytes are embedded with `include_bytes!`, so `storage-exit-check demo`
   uses the same shipped input after `cargo install`; it copies them into both
   temporary audit trees. The Rust test and
   `@regression:inspectable-demo-fixtures` assert every output file matches its
   checked-in fixture. The README and demo contract now say exactly this.
2. Static assets now use safe, content-versioned filenames. The Static Web Apps
   configuration serves `/assets/*` and the two versioned WebP images with
   `Cache-Control: public, max-age=31536000, immutable`; `sw.js`, `index.html`,
   and `404.html` remain `max-age=0, must-revalidate`. The service-worker cache
   name is `storage-exit-check-v2`.
3. The catch-all SPA navigation fallback is gone. Only documented client routes
   (`/demo`, `/install`, `/privacy`, `/terms`) rewrite to `index.html`; the
   `404` response override rewrites to the styled `404.html` and keeps HTTP 404.
   `@regression:static-hosting` locks the routes, headers, and response status.
4. The skip-link target is now programmatically focusable on both the SPA and
   standalone 404 page. Mobile keyboard and axe coverage are part of `npm test`.

## Verification

Ran from a clean dependency installation on 2026-08-28:

```sh
npm ci
npm test
npm run build
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
npm run pack:cli
```

Results: `npm test` passed 6 Rust tests and 15 Playwright tests, including all
ten exact commands in `.factory/claims.json`; `npm run typecheck` runs inside
that suite and passed; release build wrote `target/release/storage-exit-check`
and `dist/site/`; formatting and clippy passed; `cargo package` verified a
56.5 KiB crate containing all ten `examples/` fixture files.

A fresh packed-consumer installation from
`target/package/storage-exit-check-0.1.0` passed `--help` and `demo`; it wrote
both evidence reports and printed `Restore sample: 3 of 3 passed`.

The Static Web Apps CLI served the production `dist/site` locally. It returned
200 for `/demo`, HTTP 404 plus the styled “This trail ends here” page for
`/missing-page`, the immutable asset header for the built JavaScript and WebP,
and the short-lived service-worker header. `verify-url.sh` passed against that
server (title, `lang=en`, one h1, main landmark, image alt text, labelled
buttons, and no console errors; 630 ms observed load). A fresh Chromium context
at 390×844 loaded `/demo`, made no cross-origin requests, reached Skip to
content with Tab, then reloaded the demo successfully offline after service
worker activation. Desktop and mobile axe checks reported zero serious or
critical findings.

Local Lighthouse mobile against the production build: Performance 100,
Accessibility 100, FCP 1.1 s, LCP 1.7 s, CLS 0, TBT 60 ms. The built gzip JS is
4.09 KiB, CSS is 3.07 KiB, and the LCP WebP is 83.7 KiB.

## Deploy

Artifact class and deployment remain unchanged: static site from `dist/site/`
with the release Rust CLI. The checked-in `staticwebapp.config.json` is the
deployment configuration; pushing `main` is the factory deployment handoff.
After the push, recheck `https://storage-exit-check.sociobot.in/missing-page`
returns HTTP 404 and a hashed `/assets/*` response has the immutable header.

## Known limits

The CLI deliberately remains read-only and does not prove full disaster
recovery: it tests a reproducible sample. It does not compare permissions,
ownership, extended attributes, sparse-file allocation, or hard-link identity.
No telemetry, external runtime API, accounts, payments, or third-party assets
were added.
