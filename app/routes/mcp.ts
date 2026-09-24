import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { registerSearchTool, registerSourceTools } from 'fumadocs-core/mcp';
import type { Route } from './+types/mcp';
import { docsLlms, source } from '@/lib/source';
import { searchServer } from '@/lib/search';

function createDocsServer() {
  const server = new McpServer({
    name: 'aki-docs',
    version: '1.0.0',
  });

  registerSourceTools(server, source, docsLlms);
  registerSearchTool(server, searchServer);

  return server;
}

const handler = createMcpHandler(createDocsServer, {
  responseMode: 'auto',
});

export async function loader({ request }: Route.LoaderArgs) {
  return handler.fetch(request);
}

export async function action({ request }: Route.ActionArgs) {
  return handler.fetch(request);
}
