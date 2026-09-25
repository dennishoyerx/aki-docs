import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const docsDirectory = join(root, 'content/docs');

const requiredFiles = [
  'content/docs/meta.json',
  'content/docs/introduction/index.mdx',
  'content/docs/introduction/start-here.mdx',
  'content/docs/introduction/getting-started.mdx',
  'content/docs/architecture/index.mdx',
  'content/docs/runtime/index.mdx',
  'content/docs/extending/index.mdx',
  'content/docs/extending/create-a-capability.mdx',
  'content/docs/reference/index.mdx',
  'content/docs/reference/api-first-contact.mdx',
  'content/docs/reference/api-routes.mdx',
  'content/docs/reference/glossary.mdx',
  'content/docs/development/index.mdx',
  'app/routes/mcp.ts',
  'app/routes/health.ts',
  'app/lib/search.ts',
];

for (const file of requiredFiles) await access(join(root, file));

async function collectMdx(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectMdx(path)));
    if (entry.isFile() && entry.name.endsWith('.mdx')) files.push(path);
  }

  return files.sort();
}

const mdxFiles = await collectMdx(docsDirectory);
assert.ok(mdxFiles.length > 0, 'no MDX pages found');

const docRoutes = new Set();
for (const file of mdxFiles) {
  const content = await readFile(file, 'utf8');
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  assert.ok(frontmatter, `${relative(root, file)} has no frontmatter`);

  for (const field of ['title', 'description']) {
    const value = frontmatter[1].match(new RegExp(`^${field}:\\s*(.+)$`, 'm'))?.[1]?.trim();
    assert.ok(value, `${relative(root, file)} is missing ${field}`);
  }

  const path = relative(docsDirectory, file).split(sep).join('/').replace(/\.mdx$/, '');
  const routePath = path.replace(/\/index$/, '');
  docRoutes.add(`/docs${routePath ? `/${routePath}` : ''}`);
}

const routeConfig = await readFile(join(root, 'app/routes.ts'), 'utf8');
for (const route of ['health', 'mcp', 'api/search', 'llms.txt', 'llms-full.txt', 'llms.mdx/docs']) {
  assert.ok(routeConfig.includes(route), `missing route: ${route}`);
}

const docsMeta = JSON.parse(await readFile(join(root, 'content/docs/meta.json'), 'utf8'));
assert.deepEqual(docsMeta.pages, [
  'introduction',
  'architecture',
  'runtime',
  'extending',
  'reference',
  'development',
]);

const introductionMeta = JSON.parse(
  await readFile(join(root, 'content/docs/introduction/meta.json'), 'utf8'),
);
assert.equal(introductionMeta.pages[0], 'start-here');
const extendingMeta = JSON.parse(
  await readFile(join(root, 'content/docs/extending/meta.json'), 'utf8'),
);
assert.ok(extendingMeta.pages.includes('create-a-capability'));
const referenceMeta = JSON.parse(
  await readFile(join(root, 'content/docs/reference/meta.json'), 'utf8'),
);
assert.ok(referenceMeta.pages.includes('api-first-contact'));
assert.ok(referenceMeta.pages.includes('glossary'));

const onboardingPages = [
  {
    file: 'content/docs/introduction/start-here.mdx',
    route: '/docs/introduction/start-here',
    title: 'Start here',
    requiredText: ['Start the docs locally', 'Call the runtime API', 'Create and invoke a capability'],
  },
  {
    file: 'content/docs/introduction/getting-started.mdx',
    route: '/docs/introduction/getting-started',
    title: 'Getting started',
    requiredText: ['bun install', 'bun run dev', 'bun run typecheck', 'bun run build', 'bun run smoke'],
  },
  {
    file: 'content/docs/reference/api-first-contact.mdx',
    route: '/docs/reference/api-first-contact',
    title: 'API first contact',
    requiredText: ['/health', '/tools', 'x-api-key: [REDACTED]', '202', 'SSE', 'completed', 'error'],
  },
  {
    file: 'content/docs/reference/glossary.mdx',
    route: '/docs/reference/glossary',
    title: 'Glossary',
    requiredText: [
      'Capability',
      'Tool',
      'Rev',
      'Revision',
      'Executor',
      'Ren',
      'Store',
      'Gateway',
      'Kernel',
      'Plugin',
      'NATS',
      'Session',
      'Event',
    ],
  },
  {
    file: 'content/docs/extending/create-a-capability.mdx',
    route: '/docs/extending/create-a-capability',
    title: 'Create and invoke a capability',
    requiredText: ['rev.create', 'rev.invoke', '/rev/functions/hello.greet/invoke'],
  },
];

for (const page of onboardingPages) {
  const content = await readFile(join(root, page.file), 'utf8');
  for (const text of page.requiredText) {
    assert.ok(content.includes(text), `${page.file} is missing onboarding text: ${text}`);
  }
  assert.ok(docRoutes.has(page.route), `${page.file} does not resolve to ${page.route}`);
}

const publicRoutes = new Set(['/', '/health', '/mcp', '/llms.txt', '/llms-full.txt', '/api/search']);
const markdownLink = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
for (const file of mdxFiles) {
  const content = await readFile(file, 'utf8');
  for (const match of content.matchAll(markdownLink)) {
    const target = match[1];
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(target)) continue;

    const path = target.split('#', 1)[0].split('?', 1)[0].replace(/\/$/, '');
    if (!path) continue;

    if (path.startsWith('/llms.mdx/docs')) {
      const docsPath = path.slice('/llms.mdx/docs'.length).replace(/\/content\.md$/, '');
      assert.ok(docRoutes.has(`/docs${docsPath}`), `${relative(root, file)} links to missing ${target}`);
    } else if (path.startsWith('/docs/') && path.endsWith('.md')) {
      const docsPath = path.slice(0, -3);
      assert.ok(docRoutes.has(docsPath), `${relative(root, file)} links to missing ${target}`);
    } else if (path === '/docs' || path.startsWith('/docs/')) {
      assert.ok(docRoutes.has(path), `${relative(root, file)} links to missing ${target}`);
    } else {
      assert.ok(publicRoutes.has(path), `${relative(root, file)} links to missing ${target}`);
    }
  }
}

const baseUrl = process.env.BASE_URL;
if (baseUrl) {
  const fetchEndpoint = async (path, expectedType) => {
    const response = await fetch(new URL(path, baseUrl));
    assert.ok(response.ok, `${path} returned ${response.status}`);
    assert.match(response.headers.get('content-type') ?? '', new RegExp(expectedType));
    return response;
  };

  await fetchEndpoint('/', 'text/html');
  const healthResponse = await fetchEndpoint('/health', 'application/json');
  assert.equal((await healthResponse.json()).service, 'aki-docs');
  const llmsIndex = await (await fetchEndpoint('/llms.txt', 'text/plain')).text();
  assert.ok(llmsIndex.includes('/docs/introduction/start-here'));
  const llmsFull = await (await fetchEndpoint('/llms-full.txt', 'text/plain')).text();
  assert.ok(llmsFull.includes('# Start here'));

  const renderedPages = new Map();
  for (const page of onboardingPages) {
    const html = await (await fetchEndpoint(page.route, 'text/html')).text();
    renderedPages.set(page.route, html);
    assert.ok(html.includes(page.title), `${page.route} did not render its title`);

    const markdown = await (await fetchEndpoint(`${page.route}.md`, 'text/markdown')).text();
    assert.ok(markdown.includes(`# ${page.title}`), `${page.route}.md did not include its title`);
  }

  for (const text of onboardingPages[0].requiredText) {
    assert.ok(renderedPages.get(onboardingPages[0].route).includes(text), `Start here page did not render: ${text}`);
  }
  for (const text of onboardingPages[2].requiredText) {
    assert.ok(
      renderedPages.get(onboardingPages[2].route).includes(text),
      `API first contact page did not render: ${text}`,
    );
  }

  const searchResponse = await fetchEndpoint('/api/search?query=Rev', 'application/json');
  const searchResults = await searchResponse.json();
  assert.ok(
    searchResults.some((result) => result.url === '/docs/runtime/rev'),
    'local search did not return the seeded Rev page',
  );
  const glossarySearch = await (await fetchEndpoint('/api/search?query=glossary', 'application/json')).json();
  assert.ok(
    glossarySearch.some((result) => result.url === '/docs/reference/glossary'),
    'local search did not return the glossary page',
  );

  const mcpRequest = async (id, method, params) => {
    const response = await fetch(new URL('/mcp', baseUrl), {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
    });
    assert.ok(response.ok, `MCP ${method} returned ${response.status}`);
    const event = (await response.text())
      .split('\n')
      .find((line) => line.startsWith('data: '));
    assert.ok(event, `MCP ${method} returned no JSON-RPC event`);
    return JSON.parse(event.slice(6));
  };

  const initialized = await mcpRequest(1, 'initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'aki-docs-smoke', version: '1.0.0' },
  });
  assert.equal(initialized.result.serverInfo.name, 'aki-docs');

  const listed = await mcpRequest(2, 'tools/list', {});
  const toolNames = listed.result.tools.map((tool) => tool.name);
  assert.deepEqual(toolNames, ['list_pages', 'get_page', 'search']);
  assert.deepEqual(listed.result.tools[1].inputSchema.required, ['url']);
  assert.deepEqual(listed.result.tools[2].inputSchema.required, ['query']);

  const called = await mcpRequest(3, 'tools/call', {
    name: 'search',
    arguments: { query: 'Rev' },
  });
  const mcpResults = JSON.parse(called.result.content[0].text);
  assert.ok(mcpResults.some((result) => result.url === '/docs/runtime/rev'));

  const fetched = await mcpRequest(4, 'tools/call', {
    name: 'get_page',
    arguments: { url: '/docs/introduction/start-here' },
  });
  assert.match(fetched.result.content[0].text, /Start here/);
}

process.stdout.write('aki-docs smoke: ok\n');
