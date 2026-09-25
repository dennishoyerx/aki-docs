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
  'content/docs/introduction/run-aki.mdx',
  'content/docs/architecture/index.mdx',
  'content/docs/runtime/index.mdx',
  'content/docs/runtime/end-to-end.mdx',
  'content/docs/runtime/end-to-end.fixture.json',
  'content/docs/extending/index.mdx',
  'content/docs/extending/create-a-capability.mdx',
  'content/docs/reference/index.mdx',
  'content/docs/reference/api-first-contact.mdx',
  'content/docs/reference/api-routes.mdx',
  'content/docs/reference/security.mdx',
  'content/docs/reference/troubleshooting.mdx',
  'content/docs/reference/faq.mdx',
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
const docsRouteConfig = await readFile(join(root, 'app/routes/docs.tsx'), 'utf8');
for (const primitive of ['findNeighbour', 'includeRoot', 'includePage', 'footer={{ items: neighbours }}']) {
  assert.ok(docsRouteConfig.includes(primitive), `docs navigation is missing ${primitive}`);
}
const homeConfig = await readFile(join(root, 'app/routes/home.tsx'), 'utf8');
assert.ok(homeConfig.includes('Three primary paths'), 'homepage does not distinguish primary paths');

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
assert.ok(introductionMeta.pages.includes('run-aki'));
const extendingMeta = JSON.parse(
  await readFile(join(root, 'content/docs/extending/meta.json'), 'utf8'),
);
assert.ok(extendingMeta.pages.includes('create-a-capability'));
const runtimeMeta = JSON.parse(await readFile(join(root, 'content/docs/runtime/meta.json'), 'utf8'));
assert.ok(runtimeMeta.pages.includes('end-to-end'));
const referenceMeta = JSON.parse(
  await readFile(join(root, 'content/docs/reference/meta.json'), 'utf8'),
);
assert.ok(referenceMeta.pages.includes('api-first-contact'));
assert.ok(referenceMeta.pages.includes('security'));
assert.ok(referenceMeta.pages.includes('troubleshooting'));
assert.ok(referenceMeta.pages.includes('faq'));
assert.ok(referenceMeta.pages.includes('glossary'));

const publicPages = [
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
    requiredText: [
      '## Start the docs locally',
      '## Run the checks',
      'bun install',
      'bun run dev',
      'Local: http://localhost:5173/',
      'bun run typecheck',
      'bun run build',
      'bun run smoke',
    ],
  },
  {
    file: 'content/docs/introduction/run-aki.mdx',
    route: '/docs/introduction/run-aki',
    title: 'Run Aki',
    requiredText: ['docker compose up --build', 'docker compose exec akr curl http://127.0.0.1:18768/health', 'bun run smoke'],
  },
  {
    file: 'content/docs/introduction/index.mdx',
    route: '/docs/introduction',
    title: 'Aki in one minute',
    requiredText: ['Aki is a capability runtime'],
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
    requiredText: [
      'rev.create',
      'rev.invoke',
      '"method":"tools/call"',
      '/rev/functions/hello.greet/invoke',
    ],
  },
  {
    file: 'content/docs/runtime/chat.mdx',
    route: '/docs/runtime/chat',
    title: 'Chat and sessions',
    requiredText: ['chat.completion', 'SSE', 'pending', 'completed', '[DONE]'],
  },
  {
    file: 'content/docs/runtime/end-to-end.mdx',
    route: '/docs/runtime/end-to-end',
    title: 'End-to-end example',
    requiredText: ['Fixture request', 'rev.invoke', 'aki_tool', '[DONE]', 'Fixture safe failure'],
  },
  {
    file: 'content/docs/reference/api-routes.mdx',
    route: '/docs/reference/api-routes',
    title: 'API routes',
    requiredText: ['AKR Gateway public discovery', 'browser proxy', 'documentation MCP'],
  },
  {
    file: 'content/docs/reference/security.mdx',
    route: '/docs/reference/security',
    title: 'Security and policy',
    requiredText: ['AKR_API_KEY', 'x-api-key', 'Store', 'fail closed', 'operator'],
  },
  {
    file: 'content/docs/reference/troubleshooting.mdx',
    route: '/docs/reference/troubleshooting',
    title: 'Troubleshooting',
    requiredText: ['404 or blank docs route', 'MCP returns 400, 403, or 405', 'bun run smoke'],
  },
  {
    file: 'content/docs/reference/faq.mdx',
    route: '/docs/reference/faq',
    title: 'FAQ',
    requiredText: ['docs `/health`', '401', 'MCP', 'search'],
  },
];

for (const page of publicPages) {
  const content = await readFile(join(root, page.file), 'utf8');
  for (const text of page.requiredText) {
    assert.ok(content.includes(text), `${page.file} is missing public text: ${text}`);
  }
  assert.ok(docRoutes.has(page.route), `${page.file} does not resolve to ${page.route}`);
}

const fixture = JSON.parse(await readFile(join(root, 'content/docs/runtime/end-to-end.fixture.json'), 'utf8'));
const fixtureExample = await readFile(join(root, 'content/docs/runtime/end-to-end.mdx'), 'utf8');
assert.equal(fixture.fixture, 'aki-end-to-end');
assert.equal(fixture.request.model, 'agent');
assert.equal(fixture.request.stream, true);
assert.equal(fixture.request.conversation_id, 'fixture-session');
assert.equal(fixture.tool.name, 'rev.invoke');
assert.equal(fixture.tool.args.name, 'sample.greet');
assert.equal(fixture.sse.tool_frame.aki_tool.name, 'rev.invoke');
assert.equal(fixture.sse.event_frame.subject, 'event.chat.done.fixture-session');
assert.equal(fixture.sse.terminal.at(-1), '[DONE]');
assert.equal(fixture.result.object, 'chat.completion');
assert.equal(fixture.failure.status, 401);
for (const text of [
  'chatcmpl-fixture',
  'sample.greet',
  'event.chat.done.fixture-session',
  'data: [DONE]',
  'HTTP `401`',
]) {
  assert.ok(fixtureExample.includes(text), `end-to-end docs drifted from fixture: ${text}`);
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
  for (const route of [
    '/docs/introduction/start-here',
    '/docs/introduction/run-aki',
    '/docs/runtime/chat',
    '/docs/reference/security',
    '/docs/reference/troubleshooting',
    '/docs/reference/api-routes',
    '/docs/runtime/end-to-end',
    '/docs/reference/faq',
  ]) {
    assert.ok(llmsIndex.includes(route), `llms.txt is missing ${route}`);
  }
  const llmsFull = await (await fetchEndpoint('/llms-full.txt', 'text/plain')).text();
  for (const title of ['Start here', 'Run Aki', 'Chat and sessions', 'End-to-end example', 'Security and policy', 'Troubleshooting', 'FAQ']) {
    assert.ok(llmsFull.includes(`# ${title}`), `llms-full.txt is missing ${title}`);
  }

  for (const page of publicPages) {
    const html = await (await fetchEndpoint(page.route, 'text/html')).text();
    assert.ok(html.includes(page.title), `${page.route} did not render its title`);

    const markdown = await (await fetchEndpoint(`${page.route}.md`, 'text/markdown')).text();
    assert.ok(markdown.includes(`# ${page.title}`), `${page.route}.md did not include its title`);
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
  const securitySearch = await (await fetchEndpoint('/api/search?query=security', 'application/json')).json();
  assert.ok(
    securitySearch.some((result) => result.url === '/docs/reference/security'),
    'local search did not return the security page',
  );
  const troubleshootingSearch = await (
    await fetchEndpoint('/api/search?query=troubleshooting', 'application/json')
  ).json();
  assert.ok(
    troubleshootingSearch.some((result) => result.url === '/docs/reference/troubleshooting'),
    'local search did not return the troubleshooting page',
  );
  const endToEndSearch = await (
    await fetchEndpoint('/api/search?query=end-to-end', 'application/json')
  ).json();
  assert.ok(
    endToEndSearch.some((result) => result.url === '/docs/runtime/end-to-end'),
    'local search did not return the end-to-end page',
  );
  const faqSearch = await (await fetchEndpoint('/api/search?query=FAQ', 'application/json')).json();
  assert.ok(
    faqSearch.some((result) => result.url === '/docs/reference/faq'),
    'local search did not return the FAQ page',
  );
  const runAkiSearch = await (await fetchEndpoint('/api/search?query=Run%20Aki', 'application/json')).json();
  assert.ok(
    runAkiSearch.some((result) => result.url === '/docs/introduction/run-aki'),
    'local search did not return the Run Aki page',
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

  const pageList = await mcpRequest(3, 'tools/call', {
    name: 'list_pages',
    arguments: {},
  });
  const pageListText = pageList.result.content[0].text;
  for (const route of [
    '/docs/introduction/run-aki',
    '/docs/runtime/chat',
    '/docs/runtime/end-to-end',
    '/docs/reference/security',
    '/docs/reference/troubleshooting',
    '/docs/reference/faq',
  ]) {
    assert.ok(pageListText.includes(route), `MCP list_pages is missing ${route}`);
  }

  const called = await mcpRequest(4, 'tools/call', {
    name: 'search',
    arguments: { query: 'Rev' },
  });
  const mcpResults = JSON.parse(called.result.content[0].text);
  assert.ok(mcpResults.some((result) => result.url === '/docs/runtime/rev'));

  const mcpSecuritySearch = await mcpRequest(5, 'tools/call', {
    name: 'search',
    arguments: { query: 'security' },
  });
  const securityResults = JSON.parse(mcpSecuritySearch.result.content[0].text);
  assert.ok(securityResults.some((result) => result.url === '/docs/reference/security'));

  const mcpFaqSearch = await mcpRequest(6, 'tools/call', {
    name: 'search',
    arguments: { query: 'FAQ' },
  });
  const faqResults = JSON.parse(mcpFaqSearch.result.content[0].text);
  assert.ok(faqResults.some((result) => result.url === '/docs/reference/faq'));

  const fetched = await mcpRequest(7, 'tools/call', {
    name: 'get_page',
    arguments: { url: '/docs/introduction/start-here' },
  });
  assert.match(fetched.result.content[0].text, /Start here/);

  const runAkiPage = await mcpRequest(8, 'tools/call', {
    name: 'get_page',
    arguments: { url: '/docs/introduction/run-aki' },
  });
  assert.match(runAkiPage.result.content[0].text, /Run Aki/);

  const endToEndPage = await mcpRequest(9, 'tools/call', {
    name: 'get_page',
    arguments: { url: '/docs/runtime/end-to-end' },
  });
  assert.match(endToEndPage.result.content[0].text, /End-to-end example/);

  const securityPage = await mcpRequest(10, 'tools/call', {
    name: 'get_page',
    arguments: { url: '/docs/reference/security' },
  });
  assert.match(securityPage.result.content[0].text, /Security and policy/);
}

process.stdout.write('aki-docs smoke: ok\n');
