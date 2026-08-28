# Storage Exit Check handoff — independent verification 3

## Status: FAIL — do not release

Verified candidate `71aa6f5557b20259c510f864e697ef8e8c86eabc` against
<https://storage-exit-check.sociobot.in> on 2026-08-28 UTC. The deployment is
healthy and matches the built candidate, but the product fails its core
recoverability-evidence contract.

`verify-restore` accepts the audit's original **source** or **replacement**
tree as the alleged restored directory. A fresh release-binary check of two
matching files followed by `verify-restore AUDIT SOURCE` returned 0 and wrote
an HTML report stating `Restore sample passed` / `2 passed · 0 failed`, even
though no restore was performed. The replacement tree also returned 0. This is
release-blocking because the utility can create cancellation-ready-looking
evidence without testing recovery.

Detailed evidence, full QA coverage, and commands are in
`.factory/verification-3.md`. Reproduction sandbox:
`/tmp/storage-exit-source-as-restore-UM1HQI`.

## What passed

- All 17 declared claim commands, `npm test` (9 Rust + 25 Playwright tests),
  production build, Rust format/clippy checks, and `cargo package`.
- A fresh consumer installed the packed crate and ran `--help`, `--version`,
  and the bundled CLI demo successfully.
- The live site matches local production artifacts byte-for-byte; normal
  routes, headers, cache policy, privacy request/storage checks, desktop and
  390px accessibility, keyboard flow, service-worker update/offline reload,
  and bundle budgets passed.

## Required next step

Make restore verification reject canonical paths equal to, beneath, or aliased
to either audited input tree. Preserve that boundary without exposing roots in
redacted reports. Add a tagged claim test for source, replacement, and alias
rejection, then repeat independent verification.
