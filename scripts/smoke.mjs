import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'content/docs/meta.json',
  'content/docs/introduction/index.mdx',
  'content/docs/architecture/index.mdx',
  'content/docs/runtime/index.mdx',
  'content/docs/extending/index.mdx',
  'content/docs/reference/api-routes.mdx',
  'content/docs/development/index.mdx',
  'app/routes/mcp.ts',
  'app/routes/health.ts',
  'app/lib/search.ts',
];

for (const file of requiredFiles) await access(file);

const routeConfig = await readFile('app/routes.ts', 'utf8');
for (const route of ['health', 'mcp', 'llms.txt', 'llms-full.txt']) {
  assert.ok(routeConfig.includes(route), `missing route: ${route}`);
}

const docsMeta = JSON.parse(await readFile('content/docs/meta.json', 'utf8'));
assert.deepEqual(docsMeta.pages, [
  'introduction',
  'architecture',
  'runtime',
  'extending',
  'reference',
  'development',
]);

const baseUrl = process.env.BASE_URL;
if (baseUrl) {
  const fetchEndpoint = async (path, expectedType) => {
    const response = await fetch(new URL(path, baseUrl));
    assert.ok(response.ok, `${path} returned ${response.status}`);
    assert.match(response.headers.get('content-type') ?? '', new RegExp(expectedType));
    return response;
  };

  await fetchEndpoint('/', 'text/html');
  await fetchEndpoint('/llms.txt', 'text/plain');
  await fetchEndpoint('/llms-full.txt', 'text/plain');
  await fetchEndpoint('/docs/introduction.md', 'text/markdown');

  const searchResponse = await fetchEndpoint('/api/search?query=Rev', 'application/json');
  const searchResults = await searchResponse.json();
  assert.ok(
    searchResults.some((result) => result.url === '/docs/runtime/rev'),
    'local search did not return the seeded Rev page',
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
}

process.stdout.write('aki-docs smoke: ok\n');
