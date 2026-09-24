import type { Route } from './+types/mdx';
import { docsLlms, source } from '@/lib/source';

export async function loader({ params }: Route.LoaderArgs) {
  const segments = (params['*'] ?? '').split('/').filter(Boolean);
  if (segments.at(-1) === 'content.md') segments.pop();

  const page = source.getPage(segments);
  if (!page) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(await docsLlms.page(page), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
