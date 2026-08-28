import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, statSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const binary = join(process.cwd(), 'target', 'debug', 'storage-exit-check');
const temp = () => mkdtempSync(join(tmpdir(), 'storage-exit-check-test-'));
const write = (path: string, value: string) => {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, value);
};

function treeSnapshot(root: string) {
  const result: Record<string, { value: string; size: number; mtime: number }> = {};
  const visit = (directory: string, prefix = '') => {
    for (const name of readdirSync(directory)) {
      const full = join(directory, name);
      const relative = join(prefix, name);
      const stats = statSync(full);
      if (stats.isDirectory()) visit(full, relative);
      else result[relative] = { value: readFileSync(full, 'utf8'), size: stats.size, mtime: stats.mtimeMs };
    }
  };
  visit(root);
  return result;
}

function guardedDemo(root: string) {
  const guard = join(temp(), 'network-guard.so');
  const compile = spawnSync('cc', ['-shared', '-fPIC', 'tests/network_guard.c', '-o', guard], { encoding: 'utf8' });
  expect(compile.status, compile.stderr).toBe(0);
  const log = join(temp(), 'network-attempts.log');
  const result = spawnSync(binary, ['demo', '--output', root], {
    encoding: 'utf8',
    env: {
      ...process.env,
      LD_PRELOAD: guard,
      STORAGE_EXIT_CHECK_NETWORK_LOG: log,
    },
  });
  return { result, attempts: existsSync(log) ? readFileSync(log, 'utf8') : '' };
}

test('landing page has the required structure at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Check your storage move before cancelling');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('all routes are keyboard reachable and have no serious axe findings', async ({ page }) => {
  for (const route of ['/', '/demo', '/install', '/privacy', '/terms', '/missing-page']) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByText('Skip to content')).toBeFocused();
});

test('demo remains accessible and keyboard-operable at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await page.keyboard.press('Tab');
  await expect(page.getByText('Skip to content')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('@regression:keyboard-motion route focus, reduced motion, and 200% text remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const reduced = await page.locator('.hero-plate img').evaluate((image) => {
    const style = getComputedStyle(image);
    return { duration: style.animationDuration, clipPath: style.clipPath, opacity: style.opacity };
  });
  expect(reduced).toMatchObject({ clipPath: 'none', opacity: '1' });
  expect(Number.parseFloat(reduced.duration)).toBeLessThanOrEqual(0.001);

  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator('h1')).toBeFocused();
  await page.goBack();
  await expect(page.locator('h1')).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
});

test('@regression:mobile-touch-targets every mobile control is at least 44px square', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/demo', '/install', '/privacy', '/terms']) {
    await page.goto(route);
    for (const control of await page.locator('a, button').all()) {
      if (!(await control.isVisible())) continue;
      const box = await control.boundingBox();
      expect(box, `${route}: ${await control.textContent()}`).not.toBeNull();
      expect(box!.width, `${route}: ${await control.textContent()} width`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `${route}: ${await control.textContent()} height`).toBeGreaterThanOrEqual(44);
    }
  }
});

test('@claim:demo-complete demo verifies a three-file restore sample', () => {
  const root = join(temp(), 'demo');
  const output = execFileSync(binary, ['demo', '--output', root], { encoding: 'utf8' });
  expect(output).toContain('Content check: passed');
  expect(output).toContain('Restore sample: 3 of 3 passed');
  expect(readFileSync(join(root, 'evidence', 'audit.json'), 'utf8')).toContain('"complete": true');
  const audit = JSON.parse(readFileSync(join(root, 'evidence', 'audit.json'), 'utf8'));
  expect(audit.summary).toMatchObject({ source_entries: 5, replacement_entries: 5, missing: 0, changed: 0 });
  expect(audit.restore_sample).toHaveLength(3);
  expect(readFileSync(join(root, 'evidence', 'restore-report.html'), 'utf8')).toContain('Restore sample passed');
});

test('@regression:inspectable-demo-fixtures demo copies the shipped examples', () => {
  const root = join(temp(), 'demo');
  execFileSync(binary, ['demo', '--output', root]);
  const fixtures = [
    'Documents/passport-scan.txt',
    'Documents/tax-2024.txt',
    'Photos/2024/coast.txt',
    'Photos/2024/garden.txt',
    'Notes/recipes.txt',
  ];
  for (const fixture of fixtures) {
    const shipped = join('examples', 'source', fixture);
    expect(existsSync(shipped)).toBe(true);
    expect(readFileSync(join(root, 'sample-source', fixture))).toEqual(readFileSync(shipped));
    expect(readFileSync(join(root, 'sample-replacement', fixture))).toEqual(readFileSync(shipped));
  }
});

test('@regression:static-hosting preserves app deep links, asset caching, and HTTP 404', () => {
  const config = JSON.parse(readFileSync('site/public/staticwebapp.config.json', 'utf8'));
  expect(config.navigationFallback).toBeUndefined();
  for (const route of ['/demo', '/install', '/privacy', '/terms']) {
    expect(config.routes).toContainEqual({ route, rewrite: '/index.html' });
  }
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  expect(readFileSync('site/public/404.html', 'utf8')).toContain('<h1>This trail ends here</h1>');

  const immutable = 'public, max-age=31536000, immutable';
  for (const route of ['/assets/*', '/field-guide-roots-fb69c545.webp', '/og-image-b1a471d6.webp']) {
    expect(config.routes).toContainEqual({ route, headers: { 'Cache-Control': immutable } });
  }
  for (const route of ['/sw.js', '/index.html', '/404.html']) {
    expect(config.routes).toContainEqual({ route, headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' } });
  }
  expect(readFileSync('site/public/sw.js', 'utf8')).toContain("storage-exit-check-v3");
});

test('@regression:offline-update production demo reloads offline with the current cache', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Inspect a complete sample check');
  await context.setOffline(false);
  const state = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return {
      waiting: Boolean(registration.waiting),
      caches: await caches.keys(),
    };
  });
  expect(state.waiting).toBe(false);
  expect(state.caches).toEqual(['storage-exit-check-v3']);
});

test('@claim:no-upload browser and CLI demo make no network requests', async ({ page }) => {
  const outside: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outside.push(request.url());
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  expect(outside).toEqual([]);
  const root = join(temp(), 'guarded-demo');
  const { result, attempts } = guardedDemo(root);
  expect(result.status, result.stderr).toBe(0);
  expect(attempts).toBe('');
});

test('@claim:offline-cli bundled CLI demo needs no internet', () => {
  const root = join(temp(), 'demo');
  const output = execFileSync(binary, ['demo', '--output', root], {
    encoding: 'utf8',
    env: { ...process.env, HTTP_PROXY: 'http://127.0.0.1:1', HTTPS_PROXY: 'http://127.0.0.1:1', NO_PROXY: '' },
  });
  expect(output).toContain('Restore sample: 3 of 3 passed');
});

test('@claim:mit-free package and license identify MIT', () => {
  expect(JSON.parse(readFileSync('package.json', 'utf8')).version).toBe('0.1.0');
  expect(readFileSync('Cargo.toml', 'utf8')).toContain('license = "MIT"');
  expect(readFileSync('LICENSE', 'utf8')).toContain('MIT License');
});

test('@claim:demo-isolated website sets no cookies and stores no personal or demo records', async ({ page, context }) => {
  const setCookieResponses: string[] = [];
  page.on('response', async (response) => {
    if ((await response.allHeaders())['set-cookie']) setCookieResponses.push(response.url());
  });
  for (const route of ['/', '/demo', '/install', '/privacy', '/terms']) await page.goto(route);
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const stored = await page.evaluate(async () => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
    databases: 'databases' in indexedDB ? (await indexedDB.databases()).map((item) => item.name) : [],
  }));
  expect(stored).toEqual({ local: [], session: [], databases: [] });
  expect(await context.cookies()).toEqual([]);
  expect(setCookieResponses).toEqual([]);
});

test('@claim:read-only check leaves both input trees unchanged', () => {
  const root = temp();
  const source = join(root, 'source');
  const replacement = join(root, 'replacement');
  write(join(source, 'nested', 'same.txt'), 'same');
  write(join(replacement, 'nested', 'same.txt'), 'same');
  const beforeSource = treeSnapshot(source);
  const beforeReplacement = treeSnapshot(replacement);
  execFileSync(binary, ['check', source, replacement, '--output', join(root, 'report')]);
  expect(treeSnapshot(source)).toEqual(beforeSource);
  expect(treeSnapshot(replacement)).toEqual(beforeReplacement);

  for (const output of [source, join(source, 'evidence'), join(replacement, 'evidence')]) {
    const rejected = spawnSync(binary, ['check', source, replacement, '--output', output], { encoding: 'utf8' });
    expect(rejected.status).toBe(1);
    expect(rejected.stderr).toContain('output must be outside');
  }
  const alias = join(root, 'source-alias');
  symlinkSync(source, alias, 'dir');
  const aliased = spawnSync(binary, ['check', source, replacement, '--output', join(alias, 'evidence')], { encoding: 'utf8' });
  expect(aliased.status).toBe(1);
  expect(aliased.stderr).toContain('output must be outside');
  const defaultInside = spawnSync(binary, ['check', '.', replacement], { cwd: source, encoding: 'utf8' });
  expect(defaultInside.status).toBe(1);
  expect(defaultInside.stderr).toContain('output must be outside');
  expect(treeSnapshot(source)).toEqual(beforeSource);
  expect(treeSnapshot(replacement)).toEqual(beforeReplacement);
});

test('@claim:hash-differences changed content is reported', () => {
  const root = temp();
  const source = join(root, 'source');
  const replacement = join(root, 'replacement');
  write(join(source, 'same-name.txt'), 'before');
  write(join(replacement, 'same-name.txt'), 'after');
  const result = spawnSync(binary, ['--json', 'check', source, replacement, '--output', join(root, 'report')], { encoding: 'utf8' });
  expect(result.status).toBe(2);
  expect(JSON.parse(result.stdout).summary.changed).toBe(1);
  expect(JSON.parse(readFileSync(join(root, 'report', 'audit.json'), 'utf8')).differences[0].kind).toBe('content_changed');
});

test('@claim:redacted-report evidence omits private names and roots', () => {
  const root = temp();
  const source = join(root, 'source-private');
  const replacement = join(root, 'replacement-private');
  const privateName = 'casey-private-passport.txt';
  write(join(source, 'Family', privateName), 'private');
  write(join(replacement, 'Family', privateName), 'private');
  const plainReport = join(root, 'plain-evidence');
  execFileSync(binary, ['check', source, replacement, '--output', plainReport]);
  const plainAudit = readFileSync(join(plainReport, 'audit.json'), 'utf8');
  expect(plainAudit).toContain(privateName);
  expect(plainAudit).toContain(source);
  expect(plainAudit).toMatch(/[a-f0-9]{64}/);
  const report = join(root, 'evidence');
  execFileSync(binary, ['check', source, replacement, '--redact', '--output', report]);
  for (const name of readdirSync(report)) {
    const content = readFileSync(join(report, name), 'utf8');
    expect(content).not.toContain(privateName);
    expect(content).not.toContain(source);
    expect(content).not.toContain(replacement);
  }
});

test('@claim:repeatable-sample unchanged manifests select the same sample', () => {
  const root = temp();
  const source = join(root, 'source');
  const replacement = join(root, 'replacement');
  for (const name of ['a.txt', 'b.txt', 'c.txt', 'd.txt']) {
    write(join(source, name), name);
    write(join(replacement, name), name);
  }
  execFileSync(binary, ['check', source, replacement, '--sample-size', '2', '--output', join(root, 'one')]);
  execFileSync(binary, ['check', source, replacement, '--sample-size', '2', '--output', join(root, 'two')]);
  const one = JSON.parse(readFileSync(join(root, 'one', 'audit.json'), 'utf8'));
  const two = JSON.parse(readFileSync(join(root, 'two', 'audit.json'), 'utf8'));
  expect(one.sample_seed).toBe(two.sample_seed);
  expect(one.restore_sample).toEqual(two.restore_sample);
});

test('@claim:printable-report demo writes printable evidence with a caveat', () => {
  const root = join(temp(), 'demo');
  execFileSync(binary, ['demo', '--output', root]);
  const report = readFileSync(join(root, 'evidence', 'report.html'), 'utf8');
  expect(report).toContain('@media print');
  expect(report).toContain('Content check passed');
  expect(report).toContain('does not prove full disaster recovery');
});

test('@claim:path-identity non-UTF-8 filenames are rejected instead of merged', () => {
  test.skip(process.platform !== 'linux', 'raw non-UTF-8 filenames are a Unix behavior');
  const root = temp();
  const source = join(root, 'source');
  const replacement = join(root, 'replacement');
  mkdirSync(source);
  mkdirSync(replacement);
  writeFileSync(Buffer.concat([Buffer.from(`${source}/`), Buffer.from([0x80])]), 'source-only');
  writeFileSync(Buffer.concat([Buffer.from(`${source}/`), Buffer.from([0x81])]), 'shared');
  writeFileSync(Buffer.concat([Buffer.from(`${replacement}/`), Buffer.from([0x81])]), 'shared');
  const result = spawnSync(binary, ['check', source, replacement, '--output', join(root, 'evidence')], { encoding: 'utf8' });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('filename is not valid UTF-8');
  expect(existsSync(join(root, 'evidence', 'audit.json'))).toBe(false);
});

test('@claim:incomplete-audit restore verification refuses a failed content check', () => {
  const root = temp();
  const source = join(root, 'source');
  const replacement = join(root, 'replacement');
  const restored = join(root, 'restored');
  write(join(source, 'match.txt'), 'same');
  write(join(source, 'missing.txt'), 'missing');
  write(join(replacement, 'match.txt'), 'same');
  write(join(restored, 'match.txt'), 'same');
  const evidence = join(root, 'evidence');
  expect(spawnSync(binary, ['check', source, replacement, '--output', evidence]).status).toBe(2);
  const result = spawnSync(binary, ['verify-restore', join(evidence, 'audit.json'), restored], { encoding: 'utf8' });
  expect(result.status).toBe(3);
  expect(result.stdout).toContain('Restore verification blocked');
  const report = readFileSync(join(evidence, 'restore-report.html'), 'utf8');
  expect(report).toContain('Restore verification blocked');
  expect(report).toContain('content check is incomplete');
  expect(report).not.toContain('Restore sample passed');
});

test('@claim:separate-restore restore verification rejects audited input trees and aliases', () => {
  test.skip(process.platform === 'win32', 'directory symlink creation needs privileges on Windows');
  const root = temp();
  const source = join(root, 'source');
  const replacement = join(root, 'replacement');
  const restored = join(root, 'restored');
  write(join(source, 'nested', 'file.txt'), 'same');
  write(join(replacement, 'nested', 'file.txt'), 'same');
  const evidence = join(root, 'evidence');
  expect(spawnSync(binary, ['check', source, replacement, '--output', evidence]).status).toBe(0);

  const alias = join(root, 'replacement-alias');
  symlinkSync(replacement, alias, 'dir');
  for (const [name, candidate] of [
    ['source', source],
    ['source descendant', join(source, 'nested')],
    ['replacement', replacement],
    ['replacement alias', alias],
  ]) {
    const report = join(root, `${name.replaceAll(' ', '-')}-report.html`);
    const rejected = spawnSync(binary, ['verify-restore', join(evidence, 'audit.json'), candidate, '--output', report], { encoding: 'utf8' });
    expect(rejected.status, name).toBe(1);
    expect(rejected.stderr, name).toContain('restored sample must be a separate directory');
    expect(existsSync(report), name).toBe(false);
  }

  write(join(restored, 'nested', 'file.txt'), 'same');
  const passed = spawnSync(binary, ['verify-restore', join(evidence, 'audit.json'), restored], { encoding: 'utf8' });
  expect(passed.status, passed.stderr).toBe(0);
  expect(readFileSync(join(evidence, 'restore-report.html'), 'utf8')).toContain('Restore sample passed');

  const redactedEvidence = join(root, 'redacted-evidence');
  expect(spawnSync(binary, ['check', source, replacement, '--redact', '--output', redactedEvidence]).status).toBe(0);
  const redactedAudit = readFileSync(join(redactedEvidence, 'audit.json'), 'utf8');
  expect(redactedAudit).not.toContain(source);
  expect(redactedAudit).not.toContain(replacement);
  expect(JSON.parse(redactedAudit).restore_boundary_fingerprints).toHaveLength(2);
  const redactedRejected = spawnSync(binary, ['verify-restore', join(redactedEvidence, 'audit.json'), source], { encoding: 'utf8' });
  expect(redactedRejected.status).toBe(1);
  expect(redactedRejected.stderr).toContain('restored sample must be a separate directory');
});

test('@claim:symlink-policy links are recorded as links and never followed', () => {
  test.skip(process.platform === 'win32', 'symlink creation needs privileges on Windows');
  const root = temp();
  const source = join(root, 'source');
  const replacement = join(root, 'replacement');
  write(join(root, 'outside', 'private.txt'), 'must not be traversed');
  write(join(source, 'same.txt'), 'same');
  write(join(replacement, 'same.txt'), 'same');
  symlinkSync('../outside', join(source, 'linked'), 'dir');
  write(join(replacement, 'linked'), 'a regular file, not a link');
  const evidence = join(root, 'evidence');
  const result = spawnSync(binary, ['--json', 'check', source, replacement, '--output', evidence], { encoding: 'utf8' });
  expect(result.status).toBe(2);
  const audit = JSON.parse(readFileSync(join(evidence, 'audit.json'), 'utf8'));
  expect(audit.summary.source_entries).toBe(2);
  expect(audit.summary.replacement_entries).toBe(2);
  expect(audit.differences).toEqual(expect.arrayContaining([expect.objectContaining({ path: 'linked', kind: 'type_changed' })]));
  expect(audit.differences.some((item: { path: string }) => item.path.includes('private.txt'))).toBe(false);
});

test('@claim:timestamp-policy timestamp-only differences are reported without failing', () => {
  const root = temp();
  const source = join(root, 'source');
  const replacement = join(root, 'replacement');
  write(join(source, 'same.txt'), 'same');
  write(join(replacement, 'same.txt'), 'same');
  utimesSync(join(source, 'same.txt'), new Date(1_700_000_000_000), new Date(1_700_000_000_000));
  utimesSync(join(replacement, 'same.txt'), new Date(1_710_000_000_000), new Date(1_710_000_000_000));
  const result = spawnSync(binary, ['--json', 'check', source, replacement, '--output', join(root, 'evidence')], { encoding: 'utf8' });
  expect(result.status).toBe(0);
  expect(JSON.parse(result.stdout).summary).toMatchObject({ timestamp_only: 1, changed: 0 });
});

test('@claim:content-outcomes extra files pass while empty and no-match sources fail', () => {
  const root = temp();
  const source = join(root, 'source');
  const replacement = join(root, 'replacement');
  write(join(source, 'same.txt'), 'same');
  write(join(replacement, 'same.txt'), 'same');
  write(join(replacement, 'extra.txt'), 'extra');
  const extra = spawnSync(binary, ['--json', 'check', source, replacement, '--output', join(root, 'extra-report')], { encoding: 'utf8' });
  expect(extra.status).toBe(0);
  expect(JSON.parse(extra.stdout).summary.extra).toBe(1);

  const emptySource = join(root, 'empty-source');
  const emptyReplacement = join(root, 'empty-replacement');
  mkdirSync(emptySource);
  mkdirSync(emptyReplacement);
  expect(spawnSync(binary, ['check', emptySource, emptyReplacement, '--output', join(root, 'empty-report')]).status).toBe(2);

  const noMatchSource = join(root, 'no-match-source');
  const noMatchReplacement = join(root, 'no-match-replacement');
  write(join(noMatchSource, 'only-source.txt'), 'source');
  write(join(noMatchReplacement, 'only-replacement.txt'), 'replacement');
  const noMatch = spawnSync(binary, ['--json', 'check', noMatchSource, noMatchReplacement, '--output', join(root, 'no-match-report')], { encoding: 'utf8' });
  expect(noMatch.status).toBe(2);
  expect(JSON.parse(noMatch.stdout).summary.matching_files).toBe(0);
});

test('@claim:exit-semantics exit codes distinguish results, failures, and invalid usage', () => {
  const root = temp();
  const source = join(root, 'source');
  const replacement = join(root, 'replacement');
  const restored = join(root, 'restored');
  write(join(source, 'file.txt'), 'same');
  write(join(replacement, 'file.txt'), 'same');
  expect(spawnSync(binary, ['check', source, replacement, '--output', join(root, 'pass')]).status).toBe(0);
  expect(spawnSync(binary, ['check', join(root, 'missing'), replacement, '--output', join(root, 'io')]).status).toBe(1);
  write(join(source, 'changed.txt'), 'before');
  write(join(replacement, 'changed.txt'), 'after');
  expect(spawnSync(binary, ['check', source, replacement, '--output', join(root, 'difference')]).status).toBe(2);
  write(join(restored, 'file.txt'), 'wrong');
  expect(spawnSync(binary, ['verify-restore', join(root, 'pass', 'audit.json'), restored]).status).toBe(3);
  expect(spawnSync(binary, ['check', source, replacement, '--sample-size', '0']).status).toBe(64);
});

test('@claim:json-output global JSON mode emits parseable check and restore results', () => {
  const root = temp();
  const source = join(root, 'source');
  const replacement = join(root, 'replacement');
  const restored = join(root, 'restored');
  write(join(source, 'file.txt'), 'same');
  write(join(replacement, 'file.txt'), 'same');
  write(join(restored, 'file.txt'), 'same');
  const evidence = join(root, 'evidence');
  const check = execFileSync(binary, ['--json', 'check', source, replacement, '--output', evidence], { encoding: 'utf8' });
  expect(JSON.parse(check)).toMatchObject({ status: 'ready_for_restore_test', complete: true });
  const restore = execFileSync(binary, ['--json', 'verify-restore', join(evidence, 'audit.json'), restored], { encoding: 'utf8' });
  expect(JSON.parse(restore)).toMatchObject({ passed: 1, failed: 0 });
});
