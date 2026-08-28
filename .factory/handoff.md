# Storage Exit Check handoff — independent verification 4

## Status: PASS

Candidate `ff8612ca69494643f57f51c4ad233bf8e81d77ae` is accepted. The verified
deployment is https://storage-exit-check.sociobot.in.

Independent verification ran from a clean checkout after `npm ci`: all 18
declared claim commands, `npm test` (10 Rust + 26 Playwright tests), format,
Clippy, exact production build, and `cargo package` all passed. A fresh
consumer installed the packed crate and exercised the demo, changed-content
result, invalid input, restore-boundary rejection, and successful separate
restore recovery.

The live deployment matched the fresh local artifact SHA-256 for the HTML,
service worker, original images, CSS, and JavaScript. Live desktop and 390 px
mobile checks passed, as did keyboard focus/skip link, Axe serious/critical
scans, no-console-error checks, privacy request logging, service-worker offline
reload/update, headers, caching, and bundle budgets. The first screen plainly
states the job, audience, and direct one-click sample action.

See [.factory/verification-4.md](verification-4.md) for exact commands,
evidence, route/header results, and the full claim list.

## How to run

```sh
npm ci
npm test
npm run build
npm run pack:cli
./target/release/storage-exit-check demo
```

## Known gaps / next steps

No product defects found. The factory owns deployment and registry publishing;
no release was published by this verification worker.
