import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
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

test('@claim:demo-complete demo verifies a three-file restore sample', () => {
  const root = join(temp(), 'demo');
  const output = execFileSync(binary, ['demo', '--output', root], { encoding: 'utf8' });
  expect(output).toContain('Content check: passed');
  expect(output).toContain('Restore sample: 3 of 3 passed');
  expect(readFileSync(join(root, 'evidence', 'audit.json'), 'utf8')).toContain('"complete": true');
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
});

test('@claim:no-upload demo makes no third-party requests', async ({ page }) => {
  const outside: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outside.push(request.url());
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  expect(outside).toEqual([]);
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

test('@claim:demo-isolated browser demo stores no demo records', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const stored = await page.evaluate(async () => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
    databases: 'databases' in indexedDB ? (await indexedDB.databases()).map((item) => item.name) : [],
  }));
  expect(stored).toEqual({ local: [], session: [], databases: [] });
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
