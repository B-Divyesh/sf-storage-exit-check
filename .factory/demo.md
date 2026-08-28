# Demo sandbox

## Entry points

- CLI: `storage-exit-check demo`
- From a checkout: `cargo run -- demo`
- Site: `https://storage-exit-check.sociobot.in/demo`
- Direct query: `https://storage-exit-check.sociobot.in/?demo=1`

## Sample data

The CLI creates a new folder under the operating system temp directory. It
contains `sample-source`, `sample-replacement`, `sample-restored`, and
`evidence`. It copies the five inspectable document, photo, and note fixtures
from `examples/source/` into both sample trees. Those fixture bytes are embedded
at compile time, so the installed binary uses the exact shipped sample.

The demo runs the production audit engine. It compares five files, selects three
with the manifest-derived seed, copies only those fixtures into the restore
sandbox, and runs the production restore verifier. The final output contains
`audit.json`, `report.html`, `restore-sample.txt`, and `restore-report.html`.

## Isolation and reset

The CLI never reads outside its generated temp directory during the demo. Pass
`--output NEW_EMPTY_DIRECTORY` for a known location. Delete that directory to
reset, or run the command again without `--output` for a new process-specific
directory.

The browser demo is a recording of this exact flow. It uses no localStorage,
sessionStorage, IndexedDB, account, or backend tenant. **Reset demo** only
replays the recording. **Start for real** returns to the home page. The
service worker may cache static site assets, but it never stores demo records.

## Claims checked in the sandbox

Every entry in `.factory/claims.json` runs through `npm test`. CLI claim tests
use fresh OS temp directories. Browser tests use a fresh Playwright context and
reject requests outside the product origin.
