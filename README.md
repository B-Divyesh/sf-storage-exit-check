# Storage Exit Check

Check a storage move and test a restore sample before cancelling cloud storage.
This local CLI is for people moving files to a NAS or local disks.

Storage Exit Check compares each regular file by size and SHA-256. It explains
missing, changed, and extra items. It then selects a repeatable restore sample
and writes a printable evidence packet. The check does not change either input
tree, and it makes no network requests.

It is evidence for a cancellation decision, not a backup or sync tool. A sample
restore does not prove full disaster recovery.

## Try the sandbox

```sh
cargo run -- demo
```

The demo creates five source files and five replacement files in a new system
temp directory. It checks their content, restores three selected files, and
prints the evidence path. It does not read or write your real data.

The recorded browser demo is at
[storage-exit-check.sociobot.in/demo](https://storage-exit-check.sociobot.in/demo).
Its sample data is bundled and it stores no demo records in the browser.

## Install

Rust 1.75 or newer is required.

```sh
git clone https://github.com/B-Divyesh/sf-storage-exit-check.git
cd sf-storage-exit-check
cargo install --path .
```

The factory publishes release binaries after this repository is accepted. The
worker does not publish packages or releases.

## Check a storage move

```sh
storage-exit-check check \
  /path/to/cloud-export \
  /path/to/nas-copy \
  --output exit-check-report
```

The new output directory contains:

- `audit.json`: machine-readable counts, differences, hashes, and sample;
- `report.html`: printable migration evidence;
- `restore-sample.txt`: the files to recover from the replacement backup.

Restore the selected files into a separate empty directory. Do not copy them
from the source tree. Then verify them:

```sh
storage-exit-check verify-restore \
  exit-check-report/audit.json \
  /path/to/separate-restored-sample
```

The command writes `restore-report.html` beside the audit. Keep both HTML
reports with your cancellation records.

### Redact filenames

```sh
storage-exit-check check SOURCE REPLACEMENT --redact --output private-report
```

Redaction removes roots, filenames, and directory paths from every evidence
file. The restore verifier then finds samples by size and SHA-256. Restore each
sampled copy because identical files are counted separately.

### Script with JSON

Place the global `--json` flag before the command:

```sh
storage-exit-check --json check SOURCE REPLACEMENT --output report
storage-exit-check --json verify-restore report/audit.json RESTORED
```

Exit codes are stable:

| Code | Meaning |
| ---: | --- |
| 0 | Content check passed, or every restore sample passed. |
| 1 | A path, permission, or evidence file could not be read. |
| 2 | The source and replacement have missing or changed content. |
| 3 | A restore sample is missing, changed, or empty. |

Extra replacement files are reported but do not fail a check. An empty source,
or a tree without matching regular files, does fail.

## Filesystem notes

- Symbolic links are recorded as links and never followed.
- Timestamp-only differences are reported but do not fail content checks.
- Filesystems round timestamps differently, so SHA-256 decides file equality.
- Hashing reads every regular file and can take time on large trees.
- Reports contain paths and content hashes unless `--redact` is used.
- The tool never removes source files or cancels a storage subscription.

## Develop and verify

```sh
npm install
npm test
npm run build
```

`npm test` runs Rust unit tests, builds the site, runs every claim test, and
checks serious accessibility findings. `npm run build` compiles the release CLI
and writes the static site to `dist/site/`.

Run only one documented claim:

```sh
npm test -- --grep @claim:redacted-report
```

Create the publishable Rust package without publishing it:

```sh
npm run pack:cli
```

The site is Vite with vanilla TypeScript. The CLI uses Rust, clap, SHA-256, and
a non-following directory walker. There is no telemetry or runtime cloud API.

## Project records

- [Product brief](.factory/brief.json)
- [Visual thesis](.factory/design.md)
- [Demo contract](.factory/demo.md)
- [Tested claims](.factory/claims.json)
- [Handoff](.factory/handoff.md)

## License

MIT. See [LICENSE](LICENSE).
