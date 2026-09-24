import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Link } from 'react-router';
import { AkiFooter } from '@/components/aki-footer';
import { baseOptions } from '@/lib/layout.shared';

export function meta() {
  return [
    { title: 'Aki docs — the capability runtime, mapped' },
    {
      name: 'description',
      content: 'A practical, open map of the Aki capability runtime.',
    },
  ];
}

const entryPoints = [
  {
    index: '01',
    title: 'Start with the model',
    description: 'Learn the Agent → Rev → executor chain and the roles around it.',
    href: '/docs/introduction',
  },
  {
    index: '02',
    title: 'Trace a request',
    description: 'Follow ownership from a channel to a resolved capability result.',
    href: '/docs/architecture',
  },
  {
    index: '03',
    title: 'Extend with intent',
    description: 'Add an executor or a UI branch without creating a second registry.',
    href: '/docs/extending',
  },
  {
    index: '04',
    title: 'Check the contract',
    description: 'Find route anchors, capability families, and runtime safeguards.',
    href: '/docs/reference',
  },
  {
    index: '05',
    title: 'Read the whole corpus',
    description: 'Use the index, full text, and per-page Markdown for machine clients.',
    href: '/llms.txt',
  },
  {
    index: '06',
    title: 'Build the docs',
    description: 'Run the local search, MCP tools, and production checks locally.',
    href: '/docs/development',
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
              Make the <span>chain</span> clear.
            </h1>
            <p className="aki-hero__lede">
              A concise, open documentation home for the Aki runtime: one
              capability execution chain, explicit ownership boundaries, and
              practical paths for extending it.
            </p>
            <div className="aki-actions">
              <Link className="aki-button" to="/docs/introduction">
                Enter the docs <span aria-hidden="true">↗</span>
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
                  <span>execution chain</span>
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
            <h2 id="aki-entry-title">Choose a door</h2>
            <p>Every page is short on purpose. Follow the boundary you need to understand.</p>
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

        <section className="aki-section" aria-label="Local development command">
          <div className="aki-command">
            <span>bun run dev</span>
            <span>search · llms · mcp · health</span>
          </div>
        </section>

        <AkiFooter />
      </div>
    </HomeLayout>
  );
}
