import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
const routeStatus = document.querySelector<HTMLDivElement>('#route-status')!;

type Page = { title: string; description: string; html: string };

const shell = (content: string, demo = false) => `
  ${demo ? `<aside class="demo-banner" aria-label="Demo mode"><span><strong>Demo</strong> — sample data, nothing is saved</span><span class="demo-actions"><button type="button" data-reset-demo>Reset demo</button><a href="/" data-link>Start for real</a></span></aside>` : ''}
  <header class="site-header">
    <a class="wordmark" href="/" data-link aria-label="Storage Exit Check home"><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M16 27V8m0 8c-5-1-8-4-9-8 5 0 8 3 9 8Zm0 5c5-1 8-4 9-8-5 0-8 3-9 8Z"/></svg><span>Storage Exit Check</span></a>
    <nav aria-label="Main navigation"><a href="/demo" data-link>Demo</a><a href="/install" data-link>Install</a><a href="/privacy" data-link>Privacy</a></nav>
  </header>
  <main id="main" tabindex="-1">${content}</main>
  <footer class="site-footer"><p><strong>Storage Exit Check</strong><br><span>Evidence before you leave cloud storage.</span></p><nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://hello-factory.sociobot.in/">Built by Param Factory <span class="sr-only">(external site)</span></a></nav><p class="build">v0.1.0 · build 2026-08-28</p></footer>`;

const terminal = (id = 'terminal-output') => `
  <div class="terminal" role="region" aria-label="Recorded CLI demo">
    <div class="terminal-bar"><span></span><span></span><span></span><b>sample audit</b></div>
    <pre id="${id}"><span class="prompt">$</span> storage-exit-check demo

Demo — sample data, nothing is saved outside this folder
Scanned <strong>5 source files</strong> and <strong>5 replacement files</strong>
Content check: <span class="good">passed</span>
Restore sample: <span class="good">3 of 3 passed</span>
Report: /tmp/storage-exit-check-demo/evidence/restore-report.html

<span class="note">A sample test does not prove full disaster recovery.</span></pre>
  </div>`;

const pages: Record<string, Page> = {
  '/': {
    title: 'Storage Exit Check — verify a storage move',
    description: 'Compare two directory trees, test a restore sample, and print evidence before leaving cloud storage.',
    html: shell(`
      <section class="hero ruled-section">
        <div class="hero-copy">
          <p class="specimen-label">Field note 01 · migration evidence</p>
          <h1 tabindex="-1">Check your storage move before cancelling</h1>
          <p class="lede">For people leaving cloud storage who need proof their local copy can restore.</p>
          <div class="hero-action"><a class="button" href="/demo" data-link>Try it with sample data</a><p>See a complete check and restore test in one click.</p></div>
          <ul class="plain-facts" aria-label="Product facts"><li>No files uploaded</li><li>Works without internet</li><li>Free under the MIT License</li></ul>
        </div>
        <figure class="hero-plate"><img src="/field-guide-roots-fb69c545.webp" width="960" height="640" fetchpriority="high" alt="Two botanical file trees share roots around a small archive box." /><figcaption>Plate A. Two file trees, checked at the root.</figcaption></figure>
      </section>
      <section class="preview section-wrap" aria-labelledby="preview-title">
        <div class="section-intro"><p class="specimen-label">Observed result</p><h2 id="preview-title">See the evidence before you trust it</h2><p>The command checks content, selects a repeatable sample, and writes a printable report.</p></div>
        ${terminal()}
      </section>
      <section class="steps ruled-section" aria-labelledby="steps-title">
        <div class="section-wrap"><p class="specimen-label">Method</p><h2 id="steps-title">How the check works</h2><ol>
          <li><span>01</span><div><h3>Compare both trees</h3><p>Point the command at your source and replacement folders.</p></div></li>
          <li><span>02</span><div><h3>Restore the sample</h3><p>Recover the selected files into a separate empty folder.</p></div></li>
          <li><span>03</span><div><h3>Keep the report</h3><p>Verify the restored hashes and print the evidence.</p></div></li>
        </ol></div>
      </section>
      <section class="boundaries section-wrap" aria-labelledby="boundaries-title">
        <div><p class="specimen-label">Boundary notes</p><h2 id="boundaries-title">Know what this check does not prove</h2><p>A sample restore does not prove full disaster recovery.</p><p>The check reads both trees and writes only to your output folder.</p></div>
        <aside><h3>Before you cancel</h3><ul><li>Review off-site copies.</li><li>Keep recovery keys available.</li><li>Check retention dates.</li><li>Open the printed report.</li></ul></aside>
      </section>
      <section class="install-callout"><div class="section-wrap"><p class="specimen-label">Ready for your files?</p><h2>Run the check on your computer</h2><code>cargo install --path .</code><a class="text-link" href="/install" data-link>Read the install guide →</a></div></section>
    `),
  },
  '/demo': {
    title: 'Demo — Storage Exit Check',
    description: 'See Storage Exit Check compare sample trees and verify a restore sample.',
    html: shell(`<section class="page-head demo-page"><p class="specimen-label">Isolated specimen</p><h1 tabindex="-1">Inspect a complete sample check</h1><p>This recording comes from the real CLI using five bundled sample files.</p>${terminal('demo-terminal')}<div class="demo-key"><h2>What just happened</h2><dl><div><dt>10</dt><dd>file copies hashed</dd></div><div><dt>0</dt><dd>content differences</dd></div><div><dt>3</dt><dd>restored files verified</dd></div></dl><p>The CLI wrote an audit, a restore plan, and two printable reports.</p><a class="button" href="/install" data-link>Install the CLI</a></div></section>`, true),
  },
  '/install': {
    title: 'Install — Storage Exit Check',
    description: 'Install Storage Exit Check and run a read-only directory comparison.',
    html: shell(`<article class="page-head prose"><p class="specimen-label">Field instructions</p><h1 tabindex="-1">Install and check your storage move</h1><p>You need Rust 1.75 or newer.</p><h2>Install from this repository</h2><pre tabindex="0"><code>git clone https://github.com/B-Divyesh/sf-storage-exit-check.git
cd sf-storage-exit-check
cargo install --path .</code></pre><h2>Try the sandbox</h2><pre tabindex="0"><code>storage-exit-check demo</code></pre><p>The command creates sample folders under your system temp directory.</p><h2>Check two real folders</h2><pre tabindex="0"><code>storage-exit-check check \
  /path/to/cloud-export \
  /path/to/nas-copy \
  --output exit-check-report</code></pre><p>Use <code>--redact</code> to hide names and paths in the evidence packet.</p><h2>Verify a restored sample</h2><pre tabindex="0"><code>storage-exit-check verify-restore \
  exit-check-report/audit.json \
  /path/to/separate-restored-sample</code></pre><p>Exit code 0 means the check passed. Codes 2 and 3 report differences.</p></article>`),
  },
  '/privacy': {
    title: 'Privacy — Storage Exit Check',
    description: 'How Storage Exit Check handles files and site visits.',
    html: shell(`<article class="page-head prose"><p class="specimen-label">Privacy note</p><h1 tabindex="-1">Your filenames stay on your computer</h1><p>Effective 28 August 2026.</p><h2>The CLI</h2><p>The CLI runs locally and sends no network requests.</p><p>Reports may contain file paths and hashes.</p><p>Use <code>--redact</code> to hide names and paths.</p><h2>This website</h2><p>This static site sets no cookies and stores no personal data.</p><p>Our host may keep short security logs for abuse prevention.</p><h2>Questions</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p></article>`),
  },
  '/terms': {
    title: 'Terms — Storage Exit Check',
    description: 'Terms for the free Storage Exit Check utility.',
    html: shell(`<article class="page-head prose"><p class="specimen-label">Use note</p><h1 tabindex="-1">Use the report as one part of your decision</h1><p>Effective 28 August 2026.</p><h2>License</h2><p>The software is free under the MIT License.</p><h2>No recovery guarantee</h2><p>A sample result does not guarantee every file can recover.</p><p>You remain responsible for backups, access, and cancellation decisions.</p><h2>Safe use</h2><p>Keep the source until you review every result and restore plan.</p><h2>Questions</h2><p>Email <a href="mailto:hello@sociobot.in">hello@sociobot.in</a>.</p></article>`),
  },
};

const notFound: Page = {
  title: 'Page not found — Storage Exit Check',
  description: 'The requested Storage Exit Check page was not found.',
  html: shell(`<section class="page-head not-found"><p class="specimen-label">Specimen not found · 404</p><h1 tabindex="-1">This trail ends here</h1><p>The page may have moved or never existed.</p><a class="button" href="/" data-link>Return to the field guide</a></section>`),
};

function pathForLocation(): string {
  if (location.search.includes('demo=1')) return '/demo';
  return location.pathname.replace(/\/$/, '') || '/';
}

function render(shouldFocus = false) {
  const path = pathForLocation();
  const page = pages[path] ?? notFound;
  document.title = page.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = page.description;
  const canonical = `https://storage-exit-check.sociobot.in${path === '/' ? '/' : path}`;
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
    routeStatus.textContent = 'Demo reset';
  });
}

document.addEventListener('click', (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-link]');
  if (!link || link.origin !== location.origin || event.defaultPrevented || event.metaKey || event.ctrlKey) return;
  event.preventDefault();
  history.pushState({}, '', link.href);
  render(true);
});

window.addEventListener('popstate', () => render(true));
render();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}
