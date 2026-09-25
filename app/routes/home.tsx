import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Link } from 'react-router';
import { AkiFooter } from '@/components/aki-footer';
import { baseOptions } from '@/lib/layout.shared';

export function meta() {
  return [
    { title: 'Aki docs — start with the next move' },
    {
      name: 'description',
      content: 'Start the Aki docs locally, call the runtime API, or create a capability.',
    },
  ];
}

const entryPoints = [
  {
    index: '01',
    title: 'Start the docs locally',
    description: 'Run the Fumadocs site, search locally, and verify the public surface.',
    href: '/docs/introduction/getting-started',
  },
  {
    index: '02',
    title: 'Call the runtime API',
    description: 'Discover health and tools, then make a safe first runtime request.',
    href: '/docs/reference/api-first-contact',
  },
  {
    index: '03',
    title: 'Create and invoke a capability',
    description: 'Follow one Rev identity from its first revision to a result.',
    href: '/docs/extending/create-a-capability',
  },
  {
    index: '04',
    title: 'Trace the request chain',
    description: 'See where Agent, Rev, executors, Ren, and Store meet.',
    href: '/docs/architecture',
  },
  {
    index: '05',
    title: 'Look up routes and terms',
    description: 'Find stable route anchors, capability families, and the glossary.',
    href: '/docs/reference',
  },
  {
    index: '06',
    title: 'Read the whole corpus',
    description: 'Use the index, full text, and per-page Markdown for machine clients.',
    href: '/llms.txt',
  },
];

export default function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="aki-home">
        <section className="aki-hero" aria-labelledby="aki-hero-title">
          <div className="aki-hero__copy">
            <p className="aki-eyebrow">Aki / capability runtime</p>
            <h1 id="aki-hero-title">
              Start with the <span>next move.</span>
            </h1>
            <p className="aki-hero__lede">
              Aki turns a request into a deliberate action, resolves that action
              to a versioned capability, and runs the implementation behind it.
              Start with a task, then follow the chain.
            </p>
            <div className="aki-actions">
              <Link className="aki-button" to="/docs/introduction/start-here">
                Start here <span aria-hidden="true">↗</span>
              </Link>
              <a className="aki-button aki-button--quiet" href="/llms-full.txt">
                Read the corpus
              </a>
            </div>
          </div>
          <div className="aki-hero__visual" aria-label="Aki execution chain illustration">
            <div className="aki-signal">
              <div className="aki-signal__card">
                <div className="aki-signal__label">
                  <span>request chain</span>
                  <span aria-hidden="true" />
                </div>
                <h2>Decide. Resolve. Run.</h2>
                <p>
                  Agent chooses. Rev resolves. Executors run. Ren presents and
                  Store carries context.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="aki-section" aria-labelledby="aki-entry-title">
          <div className="aki-section__heading">
            <h2 id="aki-entry-title">Choose a first path</h2>
            <p>
              Three concrete doors into the runtime, followed by the deeper map.
              Prefer one trace? <Link to="/docs/runtime/end-to-end">Follow the end-to-end example</Link>.
            </p>
          </div>
          <div className="aki-card-grid">
            {entryPoints.map((entry) => (
              <Link className="aki-card" key={entry.index} to={entry.href}>
                <span className="aki-card__index">{entry.index}</span>
                <h3>{entry.title}</h3>
                <p>{entry.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="aki-section" aria-labelledby="aki-quickstart-title">
          <div className="aki-section__heading">
            <h2 id="aki-quickstart-title">Run the docs locally</h2>
            <p>Keep the dev server open; run the checks from another terminal.</p>
          </div>
          <pre className="aki-command" aria-label="Aki documentation quickstart">
            <code>{`bun install
bun run dev
bun run typecheck
bun run build
bun run smoke`}</code>
          </pre>
          <p className="aki-quickstart__note">
            The docs site owns <code>/health</code>; it does not start or imply a
            running AKR runtime.
          </p>
        </section>

        <AkiFooter />
      </div>
    </HomeLayout>
  );
}
