import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const repository = resolve(import.meta.dirname, '..');
const binary = join(repository, 'target', 'release', process.platform === 'win32' ? 'storage-exit-check.exe' : 'storage-exit-check');
const demoRoot = join(tmpdir(), 'storage-exit-check-build-demo');
const publicRoot = join(repository, 'site', 'public', 'sample-evidence');
const generatedFile = join(repository, 'site', 'src', 'generated-demo.json');

if (!demoRoot.endsWith('storage-exit-check-build-demo')) throw new Error('Refusing to clean an unexpected demo path');
rmSync(demoRoot, { recursive: true, force: true });
rmSync(publicRoot, { recursive: true, force: true });
mkdirSync(publicRoot, { recursive: true });

const environment = { ...process.env, SOURCE_DATE_EPOCH: '1787875200' };
const transcript = execFileSync(binary, ['demo', '--output', demoRoot], { cwd: repository, encoding: 'utf8', env: environment });
const evidence = join(demoRoot, 'evidence');
const audit = JSON.parse(readFileSync(join(evidence, 'audit.json'), 'utf8'));
const restore = JSON.parse(execFileSync(binary, ['--json', 'verify-restore', join(evidence, 'audit.json'), join(demoRoot, 'sample-restored')], {
  cwd: repository,
  encoding: 'utf8',
  env: environment,
}));

for (const name of ['audit.json', 'report.html', 'restore-report.html', 'restore-sample.txt']) {
  cpSync(join(evidence, name), join(publicRoot, name));
}
execFileSync('zip', ['-q', '-X', '-j', join(publicRoot, 'storage-exit-check-sample-evidence.zip'), ...['audit.json', 'report.html', 'restore-report.html', 'restore-sample.txt'].map((name) => join(evidence, name))]);

const normalizedTranscript = transcript.replaceAll(demoRoot, '/tmp/storage-exit-check-demo').trim();
writeFileSync(generatedFile, `${JSON.stringify({
  generatedBy: 'target/release/storage-exit-check demo',
  transcript: normalizedTranscript,
  summary: audit.summary,
  sourceManifestSha256: audit.source_manifest_sha256,
  replacementManifestSha256: audit.replacement_manifest_sha256,
  sampleSeed: audit.sample_seed,
  restoreSample: audit.restore_sample,
  restore: { passed: restore.passed, failed: restore.failed },
  reports: ['report.html', 'restore-report.html', 'audit.json', 'restore-sample.txt'],
}, null, 2)}\n`);
