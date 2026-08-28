use clap::{error::ErrorKind, Parser, Subcommand};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::{BTreeMap, HashMap};
use std::fs::{self, File};
use std::io::{self, Read};
use std::path::{Component, Path, PathBuf};
use std::process::ExitCode;
use std::time::{SystemTime, UNIX_EPOCH};
use walkdir::WalkDir;

const VERSION: &str = env!("CARGO_PKG_VERSION");

// These bytes are deliberately embedded from the inspectable `examples/` tree.
// `demo` must remain runnable after `cargo install`, while the exact sample
// input stays available to review in the repository and published crate.
const DEMO_FIXTURES: [(&str, &[u8]); 5] = [
    (
        "Documents/passport-scan.txt",
        include_bytes!("../examples/source/Documents/passport-scan.txt"),
    ),
    (
        "Documents/tax-2024.txt",
        include_bytes!("../examples/source/Documents/tax-2024.txt"),
    ),
    (
        "Photos/2024/coast.txt",
        include_bytes!("../examples/source/Photos/2024/coast.txt"),
    ),
    (
        "Photos/2024/garden.txt",
        include_bytes!("../examples/source/Photos/2024/garden.txt"),
    ),
    (
        "Notes/recipes.txt",
        include_bytes!("../examples/source/Notes/recipes.txt"),
    ),
];

#[derive(Parser, Debug)]
#[command(name = "storage-exit-check", version, about = "Check a storage migration before you cancel the old service.", long_about = None)]
struct Cli {
    /// Print machine-readable output to stdout.
    #[arg(long, global = true)]
    json: bool,

    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand, Debug)]
enum Command {
    /// Compare a source tree with its replacement and write an evidence packet.
    Check {
        /// Directory that still holds the source copy.
        source: PathBuf,
        /// Directory on the NAS or local disk.
        replacement: PathBuf,
        /// New directory for report.html and audit.json.
        #[arg(short, long, default_value = "exit-check-report")]
        output: PathBuf,
        /// Number of matching files in the restore sample.
        #[arg(long, default_value_t = 10, value_parser = clap::value_parser!(u32).range(1..=1000))]
        sample_size: u32,
        /// Hide filenames and directory names in the evidence packet.
        #[arg(long)]
        redact: bool,
    },
    /// Verify that the sampled files were restored into a separate directory.
    VerifyRestore {
        /// audit.json produced by the check command.
        audit: PathBuf,
        /// Directory containing files restored from the replacement backup.
        restored: PathBuf,
        /// HTML file to write. Defaults beside audit.json.
        #[arg(short, long)]
        output: Option<PathBuf>,
    },
    /// Run a complete check and restore verification on bundled sample data.
    Demo {
        /// Directory for the sample trees and reports. Defaults to a new temp directory.
        #[arg(short, long)]
        output: Option<PathBuf>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
enum EntryKind {
    File,
    Symlink,
}

#[derive(Debug, Clone)]
struct Entry {
    kind: EntryKind,
    size: u64,
    modified_ns: Option<u128>,
    hash: Option<String>,
    link_target: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Difference {
    path: String,
    kind: String,
    detail: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
struct Summary {
    source_entries: usize,
    replacement_entries: usize,
    source_bytes: u64,
    replacement_bytes: u64,
    matching_files: usize,
    missing: usize,
    extra: usize,
    changed: usize,
    timestamp_only: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct SampleEntry {
    label: String,
    path: Option<String>,
    size: u64,
    sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Audit {
    schema_version: u8,
    tool_version: String,
    created_unix_seconds: u64,
    source: String,
    replacement: String,
    source_manifest_sha256: String,
    replacement_manifest_sha256: String,
    redacted: bool,
    complete: bool,
    summary: Summary,
    differences: Vec<Difference>,
    sample_seed: String,
    restore_sample: Vec<SampleEntry>,
    notes: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
struct CheckResult<'a> {
    status: &'a str,
    report: String,
    audit: String,
    complete: bool,
    summary: &'a Summary,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct RestoreItem {
    label: String,
    path: Option<String>,
    status: String,
    detail: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct RestoreResult {
    checked_unix_seconds: u64,
    passed: usize,
    failed: usize,
    items: Vec<RestoreItem>,
}

fn main() -> ExitCode {
    let cli = match Cli::try_parse() {
        Ok(cli) => cli,
        Err(error) => {
            let code = match error.kind() {
                ErrorKind::DisplayHelp | ErrorKind::DisplayVersion => 0,
                _ => 64,
            };
            let _ = error.print();
            return ExitCode::from(code);
        }
    };
    match run(cli) {
        Ok(code) => ExitCode::from(code),
        Err(error) => {
            eprintln!("error: {error}");
            eprintln!("next: check the path and permissions, then run the command again");
            ExitCode::from(1)
        }
    }
}

fn run(cli: Cli) -> Result<u8, Box<dyn std::error::Error>> {
    match cli.command {
        Command::Check {
            source,
            replacement,
            output,
            sample_size,
            redact,
        } => {
            let output = validate_output_location(&source, &replacement, &output)?;
            let audit = create_audit(&source, &replacement, sample_size as usize, redact)?;
            write_evidence(&audit, &output)?;
            let result = CheckResult {
                status: if audit.complete {
                    "ready_for_restore_test"
                } else {
                    "differences_found"
                },
                report: output.join("report.html").display().to_string(),
                audit: output.join("audit.json").display().to_string(),
                complete: audit.complete,
                summary: &audit.summary,
            };
            if cli.json {
                println!("{}", serde_json::to_string_pretty(&result)?);
            } else {
                print_check_summary(&audit, &output);
            }
            Ok(if audit.complete { 0 } else { 2 })
        }
        Command::VerifyRestore {
            audit,
            restored,
            output,
        } => {
            let evidence: Audit = serde_json::from_reader(File::open(&audit)?)?;
            let result = verify_restore(&evidence, &restored)?;
            let report_path = output.unwrap_or_else(|| {
                audit
                    .parent()
                    .unwrap_or_else(|| Path::new("."))
                    .join("restore-report.html")
            });
            if let Some(parent) = report_path.parent() {
                fs::create_dir_all(parent)?;
            }
            fs::write(&report_path, render_restore_report(&evidence, &result))?;
            if cli.json {
                println!("{}", serde_json::to_string_pretty(&result)?);
            } else {
                if evidence.complete {
                    println!(
                        "Restore sample: {} passed, {} failed",
                        result.passed, result.failed
                    );
                } else {
                    println!("Restore verification blocked: the content check is incomplete.");
                    println!("Fix the missing or changed items and run check again.");
                }
                println!("Report: {}", report_path.display());
                println!("A sample test does not prove full disaster recovery.");
            }
            Ok(if result.failed == 0 && result.passed > 0 {
                0
            } else {
                3
            })
        }
        Command::Demo { output } => {
            let root = output.unwrap_or_else(|| {
                std::env::temp_dir().join(format!("storage-exit-check-demo-{}", std::process::id()))
            });
            run_demo(&root, cli.json)?;
            Ok(0)
        }
    }
}

fn now_seconds() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn validate_root(path: &Path, label: &str) -> io::Result<PathBuf> {
    let metadata = fs::metadata(path).map_err(|e| {
        io::Error::new(
            e.kind(),
            format!("{label} '{}' cannot be read: {e}", path.display()),
        )
    })?;
    if !metadata.is_dir() {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            format!("{label} '{}' is not a directory", path.display()),
        ));
    }
    let canonical = fs::canonicalize(path)?;
    if canonical.to_str().is_none() {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            format!("{label} path is not valid UTF-8; rename it and run the check again"),
        ));
    }
    Ok(canonical)
}

fn resolve_for_creation(path: &Path) -> io::Result<PathBuf> {
    let absolute = if path.is_absolute() {
        path.to_path_buf()
    } else {
        std::env::current_dir()?.join(path)
    };
    let mut normalized = PathBuf::new();
    for component in absolute.components() {
        match component {
            Component::Prefix(prefix) => normalized.push(prefix.as_os_str()),
            Component::RootDir => normalized.push(Path::new(std::path::MAIN_SEPARATOR_STR)),
            Component::CurDir => {}
            Component::ParentDir => {
                normalized.pop();
            }
            Component::Normal(part) => normalized.push(part),
        }
    }

    let mut existing = normalized.as_path();
    let mut missing = Vec::new();
    while !existing.exists() {
        let name = existing.file_name().ok_or_else(|| {
            io::Error::new(io::ErrorKind::InvalidInput, "output path is not valid")
        })?;
        missing.push(name.to_os_string());
        existing = existing.parent().ok_or_else(|| {
            io::Error::new(io::ErrorKind::InvalidInput, "output path is not valid")
        })?;
    }
    let mut resolved = fs::canonicalize(existing)?;
    for component in missing.into_iter().rev() {
        resolved.push(component);
    }
    Ok(resolved)
}

fn validate_output_location(
    source: &Path,
    replacement: &Path,
    output: &Path,
) -> io::Result<PathBuf> {
    let source_root = validate_root(source, "source")?;
    let replacement_root = validate_root(replacement, "replacement")?;
    let output = resolve_for_creation(output)?;
    if output.starts_with(&source_root) || output.starts_with(&replacement_root) {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "output must be outside the source and replacement directories",
        ));
    }
    Ok(output)
}

fn snapshot(root: &Path) -> io::Result<BTreeMap<String, Entry>> {
    let mut entries = BTreeMap::new();
    for item in WalkDir::new(root)
        .follow_links(false)
        .sort_by_file_name()
        .into_iter()
    {
        let item = item.map_err(|e| io::Error::other(e.to_string()))?;
        if item.path() == root || item.file_type().is_dir() {
            continue;
        }
        let relative = item.path().strip_prefix(root).map_err(io::Error::other)?;
        let key = path_key(relative)?;
        let metadata = fs::symlink_metadata(item.path())?;
        let modified_ns = metadata
            .modified()
            .ok()
            .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
            .map(|d| d.as_nanos());
        let entry = if metadata.file_type().is_symlink() {
            Entry {
                kind: EntryKind::Symlink,
                size: 0,
                modified_ns,
                hash: None,
                link_target: Some(
                    fs::read_link(item.path())?
                        .to_str()
                        .ok_or_else(|| {
                            io::Error::new(
                                io::ErrorKind::InvalidData,
                                "a symbolic-link target is not valid UTF-8; rename it and run the check again",
                            )
                        })?
                        .to_owned(),
                ),
            }
        } else if metadata.is_file() {
            Entry {
                kind: EntryKind::File,
                size: metadata.len(),
                modified_ns,
                hash: Some(hash_file(item.path())?),
                link_target: None,
            }
        } else {
            continue;
        };
        entries.insert(key, entry);
    }
    Ok(entries)
}

fn path_key(path: &Path) -> io::Result<String> {
    let mut parts = Vec::new();
    for component in path.components() {
        match component {
            Component::Normal(part) => parts.push(
                part.to_str()
                    .ok_or_else(|| {
                        io::Error::new(
                            io::ErrorKind::InvalidData,
                            "a filename is not valid UTF-8; rename it and run the check again",
                        )
                    })?
                    .to_owned(),
            ),
            _ => {
                return Err(io::Error::new(
                    io::ErrorKind::InvalidData,
                    "a path contains an unsafe component",
                ))
            }
        }
    }
    Ok(parts.join("/"))
}

fn hash_file(path: &Path) -> io::Result<String> {
    let mut file = File::open(path)?;
    let mut digest = Sha256::new();
    let mut buffer = [0_u8; 128 * 1024];
    loop {
        let read = file.read(&mut buffer)?;
        if read == 0 {
            break;
        }
        digest.update(&buffer[..read]);
    }
    Ok(format!("{:x}", digest.finalize()))
}

fn token_for(path: &str) -> String {
    let digest = Sha256::digest(format!("storage-exit-check:path:{path}").as_bytes());
    format!("FILE-{}", hex_prefix(&digest, 8).to_uppercase())
}

fn hex_prefix(bytes: &[u8], count: usize) -> String {
    bytes
        .iter()
        .take(count.div_ceil(2))
        .map(|b| format!("{b:02x}"))
        .collect::<String>()[..count]
        .to_string()
}

fn display_path(path: &str, redact: bool) -> String {
    if redact {
        token_for(path)
    } else {
        path.to_string()
    }
}

fn create_audit(
    source: &Path,
    replacement: &Path,
    sample_size: usize,
    redact: bool,
) -> Result<Audit, Box<dyn std::error::Error>> {
    let source_root = validate_root(source, "source")?;
    let replacement_root = validate_root(replacement, "replacement")?;
    if source_root == replacement_root {
        return Err("source and replacement resolve to the same directory".into());
    }
    let source_entries = snapshot(&source_root)?;
    let replacement_entries = snapshot(&replacement_root)?;
    let source_manifest_sha256 = manifest_digest(&source_entries);
    let replacement_manifest_sha256 = manifest_digest(&replacement_entries);
    let mut summary = Summary {
        source_entries: source_entries.len(),
        replacement_entries: replacement_entries.len(),
        source_bytes: source_entries.values().map(|e| e.size).sum(),
        replacement_bytes: replacement_entries.values().map(|e| e.size).sum(),
        ..Summary::default()
    };
    let mut differences = Vec::new();
    let mut matching = Vec::new();

    for (path, source_entry) in &source_entries {
        let shown = display_path(path, redact);
        match replacement_entries.get(path) {
            None => {
                summary.missing += 1;
                differences.push(Difference {
                    path: shown,
                    kind: "missing".into(),
                    detail: "Present in the source but absent from the replacement.".into(),
                });
            }
            Some(replacement_entry) if source_entry.kind != replacement_entry.kind => {
                summary.changed += 1;
                differences.push(Difference {
                    path: shown,
                    kind: "type_changed".into(),
                    detail: "The item type differs between trees.".into(),
                });
            }
            Some(replacement_entry)
                if source_entry.kind == EntryKind::File
                    && (source_entry.size != replacement_entry.size
                        || source_entry.hash != replacement_entry.hash) =>
            {
                summary.changed += 1;
                differences.push(Difference {
                    path: shown,
                    kind: "content_changed".into(),
                    detail: format!(
                        "Content differs: source {} bytes with SHA-256 {}; replacement {} bytes with SHA-256 {}.",
                        source_entry.size,
                        source_entry.hash.as_deref().unwrap_or("unavailable"),
                        replacement_entry.size,
                        replacement_entry.hash.as_deref().unwrap_or("unavailable")
                    ),
                });
            }
            Some(replacement_entry)
                if source_entry.kind == EntryKind::Symlink
                    && source_entry.link_target != replacement_entry.link_target =>
            {
                summary.changed += 1;
                differences.push(Difference {
                    path: shown,
                    kind: "link_changed".into(),
                    detail: "The symbolic-link target differs. Links were not followed.".into(),
                });
            }
            Some(replacement_entry) => {
                if source_entry.kind == EntryKind::File {
                    summary.matching_files += 1;
                    matching.push((path.clone(), source_entry.clone()));
                }
                if source_entry.modified_ns != replacement_entry.modified_ns {
                    summary.timestamp_only += 1;
                }
            }
        }
    }
    for path in replacement_entries.keys() {
        if !source_entries.contains_key(path) {
            summary.extra += 1;
            differences.push(Difference {
                path: display_path(path, redact),
                kind: "extra".into(),
                detail: "Present in the replacement but absent from the source.".into(),
            });
        }
    }

    let sample_seed = sample_seed(&matching);
    matching.sort_by_key(|(path, entry)| {
        let mut hasher = Sha256::new();
        hasher.update(sample_seed.as_bytes());
        hasher.update(path.as_bytes());
        hasher.update(entry.hash.as_deref().unwrap_or_default().as_bytes());
        format!("{:x}", hasher.finalize())
    });
    let restore_sample = matching
        .into_iter()
        .take(sample_size)
        .enumerate()
        .map(|(index, (path, entry))| SampleEntry {
            label: format!("SAMPLE-{:03}", index + 1),
            path: if redact { None } else { Some(path.clone()) },
            size: entry.size,
            sha256: entry.hash.unwrap_or_default(),
        })
        .collect();
    if source_entries.is_empty() {
        differences.push(Difference {
            path: "[source tree]".into(),
            kind: "empty_source".into(),
            detail: "The source contains no regular files or symbolic links.".into(),
        });
    } else if summary.matching_files == 0 {
        differences.push(Difference {
            path: "[restore sample]".into(),
            kind: "no_matching_files".into(),
            detail: "No matching regular files are available for a restore sample.".into(),
        });
    }
    let complete = !source_entries.is_empty()
        && summary.matching_files > 0
        && summary.missing == 0
        && summary.changed == 0;
    Ok(Audit {
        schema_version: 1,
        tool_version: VERSION.into(),
        created_unix_seconds: now_seconds(),
        source: if redact { "[redacted source]".into() } else { source_root.display().to_string() },
        replacement: if redact { "[redacted replacement]".into() } else { replacement_root.display().to_string() },
        source_manifest_sha256,
        replacement_manifest_sha256,
        redacted: redact,
        complete,
        summary,
        differences,
        sample_seed,
        restore_sample,
        notes: vec![
            "Symbolic links are compared as links and are never followed.".into(),
            "Timestamp-only differences do not fail the content check because filesystems round and preserve times differently.".into(),
            "A sampled restore reduces uncertainty. It does not prove full disaster recovery.".into(),
            "Storage Exit Check never deletes source files or cancels a service.".into(),
        ],
    })
}

fn sample_seed(matching: &[(String, Entry)]) -> String {
    let mut ordered = matching.to_vec();
    ordered.sort_by(|a, b| a.0.cmp(&b.0));
    let mut hasher = Sha256::new();
    for (path, entry) in ordered {
        hasher.update(path.as_bytes());
        hasher.update([0]);
        hasher.update(entry.hash.unwrap_or_default().as_bytes());
        hasher.update([0]);
    }
    format!("{:x}", hasher.finalize())
}

fn manifest_digest(entries: &BTreeMap<String, Entry>) -> String {
    let mut hasher = Sha256::new();
    for (path, entry) in entries {
        hasher.update(path.as_bytes());
        hasher.update([0]);
        hasher.update(match entry.kind {
            EntryKind::File => b"file".as_slice(),
            EntryKind::Symlink => b"symlink".as_slice(),
        });
        hasher.update([0]);
        hasher.update(entry.size.to_le_bytes());
        hasher.update(entry.hash.as_deref().unwrap_or_default().as_bytes());
        hasher.update(entry.link_target.as_deref().unwrap_or_default().as_bytes());
        hasher.update([0]);
    }
    format!("{:x}", hasher.finalize())
}

fn write_evidence(audit: &Audit, output: &Path) -> io::Result<()> {
    if output.exists() && output.read_dir()?.next().is_some() {
        return Err(io::Error::new(
            io::ErrorKind::AlreadyExists,
            format!(
                "output directory '{}' is not empty; choose a new directory",
                output.display()
            ),
        ));
    }
    fs::create_dir_all(output)?;
    let audit_json = serde_json::to_string_pretty(audit).map_err(io::Error::other)?;
    fs::write(output.join("audit.json"), format!("{audit_json}\n"))?;
    fs::write(output.join("report.html"), render_audit_report(audit))?;
    let mut sample = String::from("Storage Exit Check — restore sample\n\n");
    if audit.restore_sample.is_empty() {
        sample.push_str(
            "No matching files were available. Fix the differences and run check again.\n",
        );
    } else {
        for item in &audit.restore_sample {
            let name = item
                .path
                .as_deref()
                .unwrap_or("filename redacted; locate by SHA-256");
            sample.push_str(&format!(
                "{}  {}  {} bytes  sha256:{}\n",
                item.label, name, item.size, item.sha256
            ));
        }
    }
    sample.push_str("\nRestore these files from the replacement backup into a separate empty directory.\nThen run: storage-exit-check verify-restore audit.json PATH_TO_RESTORED_DIRECTORY\n");
    fs::write(output.join("restore-sample.txt"), sample)?;
    Ok(())
}

fn print_check_summary(audit: &Audit, output: &Path) {
    println!("Storage Exit Check {}", VERSION);
    println!(
        "{} source entries · {} replacement entries",
        audit.summary.source_entries, audit.summary.replacement_entries
    );
    println!(
        "{} missing · {} changed · {} extra",
        audit.summary.missing, audit.summary.changed, audit.summary.extra
    );
    println!(
        "{} matching files · {} timestamp-only differences",
        audit.summary.matching_files, audit.summary.timestamp_only
    );
    if audit.complete {
        println!("Result: content check passed. Complete the restore sample before cancelling.");
    } else {
        println!("Result: not ready. Fix the missing or changed items, then check again.");
    }
    println!("Evidence: {}", output.join("report.html").display());
    println!(
        "Restore plan: {}",
        output.join("restore-sample.txt").display()
    );
}

fn verify_restore(
    audit: &Audit,
    restored: &Path,
) -> Result<RestoreResult, Box<dyn std::error::Error>> {
    if !audit.complete {
        return Ok(RestoreResult {
            checked_unix_seconds: now_seconds(),
            passed: 0,
            failed: 1,
            items: vec![RestoreItem {
                label: "AUDIT".into(),
                path: None,
                status: "failed".into(),
                detail: "Restore verification was not run because the content check is incomplete. Fix the missing or changed items and run check again.".into(),
            }],
        });
    }
    let restored_root = validate_root(restored, "restored sample")?;
    let mut by_hash = if audit.redacted {
        let manifest = snapshot(&restored_root)?;
        let mut map: HashMap<(u64, String), usize> = HashMap::new();
        for entry in manifest
            .values()
            .filter(|entry| entry.kind == EntryKind::File)
        {
            *map.entry((entry.size, entry.hash.clone().unwrap_or_default()))
                .or_default() += 1;
        }
        Some(map)
    } else {
        None
    };
    let mut items = Vec::new();
    for sample in &audit.restore_sample {
        let (ok, detail) = if let Some(path) = &sample.path {
            let candidate = safe_join(&restored_root, path)?;
            match fs::symlink_metadata(&candidate) {
                Ok(metadata) if metadata.is_file() => {
                    let hash = hash_file(&candidate)?;
                    (
                        metadata.len() == sample.size && hash == sample.sha256,
                        if metadata.len() == sample.size && hash == sample.sha256 {
                            "Size and SHA-256 match.".into()
                        } else {
                            "The restored file does not match the sampled content.".into()
                        },
                    )
                }
                _ => (
                    false,
                    "The sampled path is missing from the restore directory.".into(),
                ),
            }
        } else {
            let count = by_hash
                .as_mut()
                .and_then(|map| map.get_mut(&(sample.size, sample.sha256.clone())))
                .map(|available| {
                    let found = *available;
                    if *available > 0 {
                        *available -= 1;
                    }
                    found
                })
                .unwrap_or(0);
            (
                count > 0,
                if count > 0 {
                    "A restored file with this size and SHA-256 was found.".into()
                } else {
                    "No restored file has this size and SHA-256.".into()
                },
            )
        };
        items.push(RestoreItem {
            label: sample.label.clone(),
            path: sample.path.clone(),
            status: if ok { "passed".into() } else { "failed".into() },
            detail,
        });
    }
    let passed = items.iter().filter(|item| item.status == "passed").count();
    let failed = items.len() - passed;
    Ok(RestoreResult {
        checked_unix_seconds: now_seconds(),
        passed,
        failed,
        items,
    })
}

fn safe_join(root: &Path, relative: &str) -> io::Result<PathBuf> {
    let path = Path::new(relative);
    if path
        .components()
        .all(|component| matches!(component, Component::Normal(_)))
    {
        Ok(root.join(path))
    } else {
        Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "audit contains an unsafe path",
        ))
    }
}

fn escape_html(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

fn report_shell(title: &str, body: &str) -> String {
    format!(
        r#"<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{}</title><style>
:root{{--paper:#f3eedc;--ink:#17251d;--moss:#315b43;--ochre:#9a5c1f;--berry:#8a3535}}*{{box-sizing:border-box}}body{{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 system-ui,sans-serif}}main{{max-width:900px;margin:auto;padding:48px 24px}}h1,h2{{font-family:Georgia,serif;line-height:1.08}}h1{{font-size:42px}}.kicker{{text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-weight:700}}.verdict{{border-block:2px solid var(--ink);padding:24px 0;margin:32px 0;font-size:21px}}table{{width:100%;border-collapse:collapse}}th,td{{text-align:left;padding:10px 8px;border-bottom:1px solid #9a927c;vertical-align:top}}code{{font-size:13px;overflow-wrap:anywhere}}.pass{{color:var(--moss)}}.fail{{color:var(--berry)}}.note{{border-left:4px solid var(--ochre);padding-left:16px}}@media print{{body{{background:white}}main{{padding:0}}}}@media(max-width:600px){{h1{{font-size:34px}}table,tbody,tr,th,td{{display:block}}th{{padding-bottom:0;border:0}}td{{padding-top:0}}}}</style></head><body><main>{}</main></body></html>"#,
        escape_html(title),
        body
    )
}

fn render_audit_report(audit: &Audit) -> String {
    let verdict = if audit.complete {
        "Content check passed"
    } else {
        "Not ready to cancel"
    };
    let verdict_class = if audit.complete { "pass" } else { "fail" };
    let differences = if audit.differences.is_empty() {
        "<p>No missing, changed, or extra items were found.</p>".into()
    } else {
        let rows = audit
            .differences
            .iter()
            .map(|item| {
                format!(
                    "<tr><td><code>{}</code></td><td>{}</td><td>{}</td></tr>",
                    escape_html(&item.path),
                    escape_html(&item.kind),
                    escape_html(&item.detail)
                )
            })
            .collect::<String>();
        format!("<table><thead><tr><th>Item</th><th>Finding</th><th>Explanation</th></tr></thead><tbody>{rows}</tbody></table>")
    };
    let samples = if audit.restore_sample.is_empty() {
        "<p>No matching files are available. Fix differences and run the check again.</p>".into()
    } else {
        let rows = audit.restore_sample.iter().map(|item| format!("<tr><td>{}</td><td><code>{}</code></td><td>{} bytes</td><td><code>{}…</code></td></tr>", item.label, escape_html(item.path.as_deref().unwrap_or("filename redacted")), item.size, &item.sha256[..12])).collect::<String>();
        format!("<table><thead><tr><th>Sample</th><th>Path</th><th>Size</th><th>SHA-256</th></tr></thead><tbody>{rows}</tbody></table>")
    };
    let body = format!(
        r#"<p class="kicker">Storage Exit Check · evidence packet</p><h1>Migration content check</h1><p>Created at Unix time {} with version {}.</p><section class="verdict"><strong class="{}">{}</strong><br>{} missing · {} changed · {} extra</section><h2>Tree summary</h2><table><tbody><tr><th>Source</th><td>{} entries · {} bytes<br><code>manifest {}</code></td></tr><tr><th>Replacement</th><td>{} entries · {} bytes<br><code>manifest {}</code></td></tr><tr><th>Matching files</th><td>{}</td></tr><tr><th>Timestamp-only differences</th><td>{}</td></tr></tbody></table><h2>Differences</h2>{}<h2>Reproducible restore sample</h2><p>Seed: <code>{}</code></p>{}<h2>Read before cancelling</h2><p class="note">A sampled restore reduces uncertainty. It does not prove full disaster recovery.</p><ul><li>Restore the listed samples from the replacement backup into a separate empty directory.</li><li>Run <code>storage-exit-check verify-restore audit.json PATH</code>.</li><li>Review retention, off-site copies, and recovery access before cancelling.</li><li>This tool never deletes source files or cancels a service.</li></ul>"#,
        audit.created_unix_seconds,
        escape_html(&audit.tool_version),
        verdict_class,
        verdict,
        audit.summary.missing,
        audit.summary.changed,
        audit.summary.extra,
        audit.summary.source_entries,
        audit.summary.source_bytes,
        escape_html(&audit.source_manifest_sha256),
        audit.summary.replacement_entries,
        audit.summary.replacement_bytes,
        escape_html(&audit.replacement_manifest_sha256),
        audit.summary.matching_files,
        audit.summary.timestamp_only,
        differences,
        escape_html(&audit.sample_seed),
        samples
    );
    report_shell("Storage migration evidence", &body)
}

fn render_restore_report(audit: &Audit, result: &RestoreResult) -> String {
    let passed = audit.complete && result.failed == 0 && result.passed > 0;
    let rows = result
        .items
        .iter()
        .map(|item| {
            format!(
                "<tr><td>{}</td><td><code>{}</code></td><td class=\"{}\">{}</td><td>{}</td></tr>",
                item.label,
                escape_html(item.path.as_deref().unwrap_or("filename redacted")),
                if item.status == "passed" {
                    "pass"
                } else {
                    "fail"
                },
                item.status,
                escape_html(&item.detail)
            )
        })
        .collect::<String>();
    let body = format!(
        r#"<p class="kicker">Storage Exit Check · restore evidence</p><h1>Sampled restore check</h1><section class="verdict"><strong class="{}">{}</strong><br>{} passed · {} failed</section><p>Based on audit seed <code>{}</code>.</p><table><thead><tr><th>Sample</th><th>Path</th><th>Result</th><th>Evidence</th></tr></thead><tbody>{}</tbody></table><h2>What this result means</h2><p class="note">A sampled restore reduces uncertainty. It does not prove full disaster recovery.</p><p>Keep this report with the original audit. Review off-site copies, credentials, encryption keys, and retention before cancelling.</p>"#,
        if passed { "pass" } else { "fail" },
        if !audit.complete {
            "Restore verification blocked"
        } else if passed {
            "Restore sample passed"
        } else {
            "Restore sample failed"
        },
        result.passed,
        result.failed,
        escape_html(&audit.sample_seed),
        rows
    );
    report_shell("Sampled restore evidence", &body)
}

fn run_demo(root: &Path, json: bool) -> Result<(), Box<dyn std::error::Error>> {
    if root.exists() && root.read_dir()?.next().is_some() {
        return Err(format!(
            "demo output '{}' is not empty; choose a new directory",
            root.display()
        )
        .into());
    }
    let source = root.join("sample-source");
    let replacement = root.join("sample-replacement");
    let restored = root.join("sample-restored");
    for (path, contents) in DEMO_FIXTURES {
        for tree in [&source, &replacement] {
            let target = tree.join(path);
            fs::create_dir_all(target.parent().unwrap())?;
            fs::write(target, contents)?;
        }
    }
    let evidence_dir = root.join("evidence");
    let audit = create_audit(&source, &replacement, 3, false)?;
    write_evidence(&audit, &evidence_dir)?;
    for sample in &audit.restore_sample {
        let path = sample.path.as_ref().unwrap();
        let target = restored.join(path);
        fs::create_dir_all(target.parent().unwrap())?;
        fs::copy(source.join(path), target)?;
    }
    let restore_result = verify_restore(&audit, &restored)?;
    fs::write(
        evidence_dir.join("restore-report.html"),
        render_restore_report(&audit, &restore_result),
    )?;
    if json {
        println!(
            "{}",
            serde_json::json!({"status":"demo_complete","sandbox":root,"audit_complete":audit.complete,"restore":restore_result,"report":evidence_dir.join("restore-report.html")})
        );
    } else {
        println!("Demo — sample data, nothing is saved outside this folder");
        println!("Scanned 5 source files and 5 replacement files");
        println!("Content check: passed");
        println!(
            "Restore sample: {} of {} passed",
            restore_result.passed,
            restore_result.passed + restore_result.failed
        );
        println!(
            "Report: {}",
            evidence_dir.join("restore-report.html").display()
        );
        println!("Sandbox: {}", root.display());
        println!("A sample test does not prove full disaster recovery.");
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn write(path: &Path, content: &str) {
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(path, content).unwrap();
    }

    #[test]
    fn finds_missing_changed_extra_and_matching_files() {
        let temp = tempdir().unwrap();
        let source = temp.path().join("source");
        let replacement = temp.path().join("replacement");
        write(&source.join("same.txt"), "same");
        write(&source.join("missing.txt"), "missing");
        write(&source.join("changed.txt"), "before");
        write(&replacement.join("same.txt"), "same");
        write(&replacement.join("changed.txt"), "after");
        write(&replacement.join("extra.txt"), "extra");
        let audit = create_audit(&source, &replacement, 10, false).unwrap();
        assert!(!audit.complete);
        assert_eq!(audit.summary.missing, 1);
        assert_eq!(audit.summary.changed, 1);
        assert_eq!(audit.summary.extra, 1);
        assert_eq!(audit.summary.matching_files, 1);
        assert_ne!(
            audit.source_manifest_sha256,
            audit.replacement_manifest_sha256
        );
        assert!(audit
            .differences
            .iter()
            .find(|item| item.kind == "content_changed")
            .unwrap()
            .detail
            .contains("SHA-256"));
    }

    #[test]
    fn sample_is_reproducible() {
        let temp = tempdir().unwrap();
        let source = temp.path().join("source");
        let replacement = temp.path().join("replacement");
        for name in ["a", "b", "c", "d"] {
            write(&source.join(name), name);
            write(&replacement.join(name), name);
        }
        let first = create_audit(&source, &replacement, 2, false).unwrap();
        let second = create_audit(&source, &replacement, 2, false).unwrap();
        assert_eq!(first.sample_seed, second.sample_seed);
        assert_eq!(
            first
                .restore_sample
                .iter()
                .map(|s| &s.path)
                .collect::<Vec<_>>(),
            second
                .restore_sample
                .iter()
                .map(|s| &s.path)
                .collect::<Vec<_>>()
        );
    }

    #[test]
    fn redaction_removes_paths_and_restore_uses_content() {
        let temp = tempdir().unwrap();
        let source = temp.path().join("source");
        let replacement = temp.path().join("replacement");
        let restored = temp.path().join("restored");
        write(&source.join("Private/name.txt"), "secret sample");
        write(&replacement.join("Private/name.txt"), "secret sample");
        write(&restored.join("renamed.bin"), "secret sample");
        let audit = create_audit(&source, &replacement, 1, true).unwrap();
        let serialized = serde_json::to_string(&audit).unwrap();
        assert!(!serialized.contains("Private/name.txt"));
        assert_eq!(verify_restore(&audit, &restored).unwrap().passed, 1);
    }

    #[test]
    fn restore_detects_wrong_content() {
        let temp = tempdir().unwrap();
        let source = temp.path().join("source");
        let replacement = temp.path().join("replacement");
        let restored = temp.path().join("restored");
        write(&source.join("a.txt"), "right");
        write(&replacement.join("a.txt"), "right");
        write(&restored.join("a.txt"), "wrong");
        let audit = create_audit(&source, &replacement, 1, false).unwrap();
        let result = verify_restore(&audit, &restored).unwrap();
        assert_eq!(result.failed, 1);
    }

    #[test]
    fn restore_is_blocked_when_the_content_audit_is_incomplete() {
        let temp = tempdir().unwrap();
        let source = temp.path().join("source");
        let replacement = temp.path().join("replacement");
        let restored = temp.path().join("restored");
        write(&source.join("same.txt"), "same");
        write(&replacement.join("same.txt"), "same");
        write(&source.join("missing.txt"), "missing");
        write(&restored.join("same.txt"), "same");
        let audit = create_audit(&source, &replacement, 1, false).unwrap();
        let result = verify_restore(&audit, &restored).unwrap();
        assert_eq!(result.passed, 0);
        assert_eq!(result.failed, 1);
        assert!(result.items[0]
            .detail
            .contains("content check is incomplete"));
        assert!(render_restore_report(&audit, &result).contains("Restore verification blocked"));
    }

    #[test]
    fn output_inside_an_input_or_its_alias_is_rejected() {
        let temp = tempdir().unwrap();
        let source = temp.path().join("source");
        let replacement = temp.path().join("replacement");
        write(&source.join("same.txt"), "same");
        write(&replacement.join("same.txt"), "same");
        assert!(
            validate_output_location(&source, &replacement, &source.join("evidence"))
                .unwrap_err()
                .to_string()
                .contains("output must be outside")
        );

        #[cfg(unix)]
        {
            let alias = temp.path().join("source-alias");
            std::os::unix::fs::symlink(&source, &alias).unwrap();
            assert!(
                validate_output_location(&source, &replacement, &alias.join("evidence"))
                    .unwrap_err()
                    .to_string()
                    .contains("output must be outside")
            );
        }
    }

    #[cfg(unix)]
    #[test]
    fn rejects_non_utf8_filenames_without_collapsing_them() {
        use std::ffi::OsString;
        use std::os::unix::ffi::OsStringExt;

        let temp = tempdir().unwrap();
        let source = temp.path().join("source");
        let replacement = temp.path().join("replacement");
        fs::create_dir_all(&source).unwrap();
        fs::create_dir_all(&replacement).unwrap();
        fs::write(source.join(OsString::from_vec(vec![0x80])), "source-only").unwrap();
        fs::write(source.join(OsString::from_vec(vec![0x81])), "shared").unwrap();
        fs::write(replacement.join(OsString::from_vec(vec![0x81])), "shared").unwrap();
        let error = create_audit(&source, &replacement, 1, false)
            .unwrap_err()
            .to_string();
        assert!(error.contains("filename is not valid UTF-8"));
    }

    #[test]
    fn empty_source_is_not_ready() {
        let temp = tempdir().unwrap();
        let source = temp.path().join("source");
        let replacement = temp.path().join("replacement");
        fs::create_dir_all(&source).unwrap();
        fs::create_dir_all(&replacement).unwrap();
        let audit = create_audit(&source, &replacement, 3, false).unwrap();
        assert!(!audit.complete);
        assert!(audit
            .differences
            .iter()
            .any(|item| item.kind == "empty_source"));
    }

    #[test]
    fn bundled_demo_fixtures_match_the_inspectable_example_tree() {
        assert_eq!(DEMO_FIXTURES.len(), 5);
        for (path, contents) in DEMO_FIXTURES {
            assert_eq!(
                contents,
                fs::read(Path::new("examples/source").join(path)).unwrap()
            );
        }
    }
}
