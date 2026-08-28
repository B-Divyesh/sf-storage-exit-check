# Demo sandbox

## Entry points

- CLI: `storage-exit-check demo`
- From a checkout: `cargo run -- demo`
- One-click site entry: `https://storage-exit-check.sociobot.in/?demo=1`
- Stable demo route: `https://storage-exit-check.sociobot.in/demo`

## Sample data

Without `--output`, the CLI creates a new sandbox beneath the operating system
temp folder. It
contains `sample-source`, `sample-replacement`, `sample-restored`, and
`evidence`. It copies five inspectable fixtures from `examples/source/`: two
original JPEG photos, a household inventory, a cloud-exit checklist, and recipe
notes. The replacement folder adds `NAS-README.txt`. The checklist also has a
timestamp-only difference. Fixture bytes are embedded at compile time, so the
installed binary uses the exact shipped sample.

The demo runs the production audit engine. It compares five source files with
six replacement files, reports one harmless extra and one timestamp-only
difference, selects three files with the manifest-derived seed, and runs the
production restore verifier. The final report folder contains
`audit.json`, `report.html`, `restore-sample.txt`, and `restore-report.html`.

## Isolation and reset

The CLI demo does not open the test user's files. It writes only beneath the
printed sandbox folder. Pass `--output NEW_EMPTY_FOLDER` for a known location.
Delete that folder to reset, or run the command again without `--output` for a
new process-specific sandbox beneath the system temp folder.

During each site build, the release binary creates the browser transcript,
printable sample report, audit, restore plan, restore report, and downloadable
ZIP. The browser demo uses no localStorage, sessionStorage, IndexedDB, account,
or backend tenant. **Reset demo** restores the original replay state. **Start
for real** returns home. The service worker may cache static site assets, but it
never stores demo records.

## Claims checked in the sandbox

Every entry in `.factory/claims.json` runs through `npm test`. CLI claim tests
use fresh temp folders. The isolation test traces file opens and writes with an
LD_PRELOAD guard on Linux. Browser tests use a fresh Playwright context and
reject requests outside the product origin.
