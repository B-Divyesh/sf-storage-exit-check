# Storage Exit Check handoff — independent verification

## Status: FAIL

Candidate `9b1fb7c26abeb42f6231fe411795dd587fd8d716` was independently verified
on 2026-08-28 against <https://storage-exit-check.sociobot.in>. The live
deployment exactly matches a fresh candidate build, so there is no remaining
deployment-only failure.

Do not release this candidate until these contract defects are repaired:

1. **P1:** No inspectable CLI demo sample input ships in `examples/`, despite
   the demo-sandbox contract and `.factory/demo.md` saying that it does.
2. **P1:** Live hashed assets use only `cache-control: public,
   must-revalidate, max-age=30`, not long-lived immutable caching.
3. **P2:** An unknown URL renders the styled not-found page but returns HTTP
   200, rather than a real 404.

## What passed

- All ten exact `.factory/claims.json` commands passed from a clean checkout.
- `cargo fmt --all -- --check`, `cargo clippy --all-targets -- -D warnings`,
  `npm test` (5 Rust + 12 Playwright tests), and `npm run build` passed.
- The release CLI completed a normal check/restore flow and correct boundary
  and recovery exit-code paths. `cargo package` passed; a freshly installed
  packed consumer ran `--help` and the full demo successfully.
- The live first screen plainly explains the task, audience, and first action;
  its one-click sample demo, privacy behavior, mobile layout, keyboard focus,
  reduced motion, axe serious/critical scan, and offline service-worker reload
  passed.
- Live build HTML/JS/CSS/hero hashes match the candidate exactly. Lighthouse
  mobile measured Performance 98 and Accessibility 100 (FCP 0.9 s, LCP 1.3 s,
  CLS 0, TBT 160 ms).

See [verification.md](verification.md) for complete commands, claim-by-claim
results, headers, evidence paths, and required corrections.

## Re-run

```sh
npm ci
npm test
npm run build
npm run pack:cli
```

Then re-check the repaired deployment against the evidence and acceptance
contract in `.factory/verification.md`.
