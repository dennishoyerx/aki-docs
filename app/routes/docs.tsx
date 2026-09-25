import type { Route } from './+types/docs';
import { use } from 'react';
import { isMarkdownPreferred } from 'fumadocs-core/negotiation';
import { findNeighbour, type Root } from 'fumadocs-core/page-tree';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
} from 'fumadocs-ui/layouts/docs/page';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { AkiFooter } from '@/components/aki-footer';
import { useMDXComponents } from '@/components/mdx';
import { baseOptions } from '@/lib/layout.shared';
import { docs, docsLlms, source } from '@/lib/source';
import { getPageImageUrl, getPageMarkdownUrl } from '@/lib/shared';

function getDocsPath(request: Request) {
  const pathname = new URL(request.url).pathname
    .replace(/\.data$/, '')
    .replace(/^\/docs\/?/, '')
    .replace(/\/$/, '');

  return pathname;
}

const markdownMiddleware: Route.MiddlewareFunction = async ({ request }, next) => {
  const pathname = new URL(request.url).pathname;
  const wantsMarkdown = pathname.endsWith('.md') || isMarkdownPreferred(request);
  if (!pathname.startsWith('/docs/') || !wantsMarkdown) {
    return next();
  }

  const slugs = getDocsPath(request).replace(/\.md$/, '').split('/').filter(Boolean);
  const page = source.getPage(slugs);
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
};

export const middleware = [markdownMiddleware];

export async function loader({ request }: Route.LoaderArgs) {
  const path = getDocsPath(request);
  const slugs = path.split('/').filter(Boolean);
  const page = source.getPage(slugs);

  if (!page) throw new Response('Not found', { status: 404 });

  return {
    path: page.path,
    markdownUrl: getPageMarkdownUrl(page).url,
    pageTree: await source.serializePageTree(source.getPageTree()),
    imagePath: getPageImageUrl(page).url,
  };
}

function Content({
  path,
  pageTree,
  markdownUrl,
  imagePath,
}: {
  path: string;
  pageTree: Root;
  markdownUrl: string;
  imagePath: string;
}) {
  const page = docs.getPage(path);
  if (!page) throw new Error(`unknown page: ${path}`);

  const pageUrl = `/docs/${path.replace(/\.mdx$/, '').replace(/\/index$/, '')}`;
  const neighbours = findNeighbour(pageTree, pageUrl);
  const { toc } = use(page.load());
  const Mdx = page.body;

  return (
    <DocsPage
      toc={toc}
      className="aki-docs-container"
      breadcrumb={{ includeRoot: { url: '/' }, includePage: true }}
      footer={{ items: neighbours }}
    >
      <title>{page.title}</title>
      <meta name="description" content={page.description} />
      <meta property="og:image" content={imagePath} />
      <DocsTitle>{page.title}</DocsTitle>
      <DocsDescription>{page.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
      </div>
      <DocsBody>
        <Mdx components={useMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { path, pageTree, imagePath, markdownUrl } = useFumadocsLoader(loaderData);

  return (
    <DocsLayout
      {...baseOptions()}
      tree={pageTree}
      sidebar={{ footer: <AkiFooter /> }}
      containerProps={{ className: 'aki-docs-container' }}
    >
      <Content
        path={path}
        pageTree={pageTree}
        markdownUrl={markdownUrl}
        imagePath={imagePath}
      />
    </DocsLayout>
  );
}
