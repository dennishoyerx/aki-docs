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
  if (!routeConfig.includes(route)) throw new Error(`missing route: ${route}`);
}

const baseUrl = process.env.BASE_URL;
if (baseUrl) {
  const response = await fetch(new URL('/health', baseUrl));
  if (!response.ok) throw new Error(`health check failed: ${response.status}`);

  const search = await fetch(new URL('/api/search?query=Rev', baseUrl));
  if (!search.ok) throw new Error(`search check failed: ${search.status}`);
  const results = await search.json();
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('local search returned no results for Rev');
  }
}

process.stdout.write('aki-docs smoke: ok\n');
