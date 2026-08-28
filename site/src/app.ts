import './styles.css';
import demoResult from './generated-demo.json';

const app = document.querySelector<HTMLDivElement>('#app')!;
const routeStatus = document.querySelector<HTMLDivElement>('#route-status')!;

type Page = { title: string; description: string; html: string };

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const shell = (content: string, demo = false) => `
  ${demo ? `<aside class="demo-banner" aria-label="Demo mode"><span><strong>Demo</strong> — sample data, nothing is saved</span><span class="demo-actions"><button type="button" data-reset-demo>Reset demo</button><a href="/" data-link>Start for real</a></span></aside>` : ''}
  <header class="site-header">
    <a class="wordmark" href="/" data-link aria-label="Storage Exit Check home"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M16 27V8m0 8c-5-1-8-4-9-8 5 0 8 3 9 8Zm0 5c5-1 8-4 9-8-5 0-8 3-9 8Z"/></svg><span>Storage Exit Check</span></a>
    <nav aria-label="Main navigation"><a href="/demo" data-link>Demo</a><a href="/install" data-link>Install</a><a href="/privacy" data-link>Privacy</a></nav>
  </header>
  <main id="main" tabindex="-1">${content}</main>
  <footer class="site-footer"><p><strong>Storage Exit Check</strong><br><span>Check a storage move before cancelling cloud storage.</span></p><nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://hello-factory.sociobot.in/">Built by Param Factory <span class="sr-only">(external site)</span></a></nav><p class="build">v0.1.0 · build 2026-08-28</p></footer>`;

const terminal = (id = 'terminal-output') => `
  <div class="terminal" role="region" aria-label="Recorded CLI demo">
    <div class="terminal-bar" aria-hidden="true"><span></span><span></span><span></span><b>sample result</b></div>
    <pre id="${id}"><span class="prompt">$</span> storage-exit-check demo

${escapeHtml(demoResult.transcript)}</pre>
  </div>`;

const demoFiles = demoResult.restoreSample.map((item) => `<li><code>${escapeHtml(item.path ?? item.label)}</code><span>${item.size.toLocaleString()} bytes · <span class="hash">${item.sha256.slice(0, 12)}…</span></span></li>`).join('');

const pages: Record<string, Page> = {
  '/': {
    title: 'Storage Exit Check — check a storage move',
    description: 'Compare source and replacement folders, test selected restores, and print evidence before leaving cloud storage.',
    html: shell(`
      <section class="hero ruled-section">
        <div class="hero-copy">
          <h1 tabindex="-1">Check your storage move before cancelling</h1>
          <p class="lede">For people leaving cloud storage who need evidence that selected files restore from their local copy.</p>
          <div class="hero-action"><a class="button" href="/?demo=1" data-link>Try it with sample data</a><p>See a complete check and restore test in one click.</p></div>
          <ul class="plain-facts" aria-label="Product facts"><li>No files uploaded</li><li>Works without internet</li><li>Free under the MIT License</li></ul>
        </div>
        <figure class="hero-plate"><img src="/field-guide-roots-fb69c545.webp" width="960" height="640" fetchpriority="high" alt="Two botanical file folders share roots around a small archive box." /><figcaption>Source and replacement folders, illustrated as paired botanical specimens.</figcaption></figure>
      </section>
      <section class="preview section-wrap" aria-labelledby="preview-title">
        <div class="section-intro"><h2 id="preview-title">Preview the check and restore results</h2><p>The command checks content, selects a repeatable sample, and writes a printable report.</p></div>
        ${terminal()}
      </section>
      <section class="steps ruled-section" aria-labelledby="steps-title">
        <div class="section-wrap"><h2 id="steps-title">How the check works</h2><ol>
          <li><span>01</span><div><h3>Compare both folders</h3><p>Point the command at your source folder and replacement folder.</p></div></li>
          <li><span>02</span><div><h3>Restore the sample</h3><p>Recover the selected files into a separate empty restore folder.</p></div></li>
          <li><span>03</span><div><h3>Keep the reports</h3><p>Verify the restored hashes and print both reports.</p></div></li>
        </ol></div>
      </section>
      <section class="boundaries section-wrap" aria-labelledby="boundaries-title">
        <div><h2 id="boundaries-title">Know what this check does not prove</h2><p>A sample restore does not prove full disaster recovery.</p><p>The check reads both input folders and writes only to your report folder.</p></div>
        <div class="cancel-checklist"><h3>Before you cancel</h3><ul><li>Review off-site copies.</li><li>Keep recovery keys available.</li><li>Check retention dates.</li><li>Open both reports.</li></ul></div>
      </section>
      <section class="install-callout"><div class="section-wrap"><p class="specimen-label">Install the CLI</p><h2>Run the check on your computer</h2><code>cargo install --path .</code><a class="text-link" href="/install" data-link>Read the install guide →</a></div></section>
    `),
  },
  '/demo': {
    title: 'Demo — Storage Exit Check',
    description: 'Inspect a CLI-generated sample audit, restore plan, and printable reports.',
    html: shell(`<section class="page-head demo-page"><h1 tabindex="-1">Inspect a complete sample check</h1><p>This recording and its reports come from the release CLI using five bundled sample files.</p>${terminal('demo-terminal')}<div class="demo-key"><h2>Review the sample evidence</h2><dl><div><dt>${demoResult.summary.source_entries}</dt><dd>source files</dd></div><div><dt>${demoResult.summary.replacement_entries}</dt><dd>replacement files</dd></div><div><dt>${demoResult.summary.extra}</dt><dd>harmless extra</dd></div><div><dt>${demoResult.summary.timestamp_only}</dt><dd>timestamp-only difference</dd></div><div><dt>${demoResult.restore.passed}</dt><dd>restored files verified</dd></div></dl><p>The extra NAS note and timestamp difference do not change the passing content result.</p><p class="recovery-caveat"><strong>Scope:</strong> A sample restore does not prove full disaster recovery.</p><div class="evidence-actions"><a class="button" href="/sample-evidence/report.html">View sample report</a><a class="button button-secondary" href="/sample-evidence/storage-exit-check-sample-evidence.zip" download>Download sample evidence</a></div><h2>Files selected for the restore test</h2><ul class="sample-files">${demoFiles}</ul><p class="manifest">Source manifest <code>${demoResult.sourceManifestSha256}</code></p><a class="text-link" href="/install" data-link>Install the CLI →</a></div></section>`, true),
  },
  '/install': {
    title: 'Install — Storage Exit Check',
    description: 'Install Storage Exit Check and compare a source folder with a replacement folder.',
    html: shell(`<article class="page-head prose"><h1 tabindex="-1">Install and check your storage move</h1><h2>Install from this repository</h2><pre tabindex="0"><code>git clone https://github.com/B-Divyesh/sf-storage-exit-check.git
cd sf-storage-exit-check
cargo install --path .</code></pre><h2>Try the sample</h2><pre tabindex="0"><code>storage-exit-check demo</code></pre><p>The command creates sample folders inside a new folder under your operating system's temporary location.</p><h2>Check two real folders</h2><pre tabindex="0"><code>storage-exit-check check \
  /path/to/cloud-export \
  /path/to/nas-copy \
  --output exit-check-report</code></pre><p>Keep the report folder outside both input folders. Use <code>--redact</code> to hide names and paths.</p><h2>Verify a restored sample</h2><pre tabindex="0"><code>storage-exit-check verify-restore \
  exit-check-report/audit.json \
  /path/to/separate-restored-sample</code></pre><p>Only verify a completed audit. Exit codes 2 and 3 report check or restore differences. Code 64 reports invalid usage.</p></article>`),
  },
  '/privacy': {
    title: 'Privacy — Storage Exit Check',
    description: 'How Storage Exit Check handles files and site visits.',
    html: shell(`<article class="page-head prose"><h1 tabindex="-1">Your filenames stay on your computer</h1><p>Effective 28 August 2026.</p><h2>The CLI</h2><p>The CLI sends no usage data and does not call an online service while it runs.</p><p>Reports may contain file paths and hashes.</p><p>Use <code>--redact</code> to hide names and paths.</p><h2>This website</h2><p>This static site sets no cookies and stores no personal or demo records.</p><p>It requests only this site's pages and assets.</p><h2>Questions</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p></article>`),
  },
  '/terms': {
    title: 'Terms — Storage Exit Check',
    description: 'Terms for the free Storage Exit Check utility.',
    html: shell(`<article class="page-head prose"><h1 tabindex="-1">Use the reports as part of your decision</h1><p>Effective 28 August 2026.</p><h2>License</h2><p>The software is free under the MIT License.</p><h2>No recovery guarantee</h2><p>A sample result does not guarantee every file can recover.</p><p>You remain responsible for backups, access, and cancellation decisions.</p><h2>Safe use</h2><p>Keep the source folder until you review every result and the restore plan.</p><h2>Questions</h2><p>Email <a href="mailto:hello@sociobot.in">hello@sociobot.in</a>.</p></article>`),
  },
};

const notFound: Page = {
  title: 'Page not found — Storage Exit Check',
  description: 'The requested Storage Exit Check page was not found.',
  html: shell(`<section class="page-head not-found"><p class="error-code">Error 404</p><h1 tabindex="-1">Page not found</h1><p>The page may have moved or never existed.</p><a class="button" href="/" data-link>Return home</a></section>`),
};

function pathForLocation(): string {
  if (new URLSearchParams(location.search).get('demo') === '1') return '/demo';
  return location.pathname.replace(/\/$/, '') || '/';
}

function render(shouldFocus = false) {
  const path = pathForLocation();
  const page = pages[path] ?? notFound;
  document.title = page.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = page.description;
  const canonicalPath = path === '/demo' ? '/demo' : path === '/' ? '/' : path;
  const canonical = `https://storage-exit-check.sociobot.in${canonicalPath}`;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = canonical;
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')!.content = page.title;
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')!.content = page.description;
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')!.content = canonical;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')!.content = page.title;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')!.content = page.description;
  app.innerHTML = page.html;
  document.body.dataset.route = pages[path] ? path : '404';
  if (shouldFocus) {
    const heading = document.querySelector<HTMLElement>('h1');
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: 'start' });
    routeStatus.textContent = page.title;
  }
  document.querySelector<HTMLButtonElement>('[data-reset-demo]')?.addEventListener('click', () => {
    const demo = document.querySelector('#demo-terminal');
    demo?.classList.remove('replay');
    requestAnimationFrame(() => demo?.classList.add('replay'));
    routeStatus.textContent = 'Demo reset. The original sample evidence is shown.';
  });
}

document.addEventListener('click', (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-link]');
  if (!link || link.origin !== location.origin || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  history.pushState({}, '', link.href);
  render(true);
});

window.addEventListener('popstate', () => render(true));
render();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}
