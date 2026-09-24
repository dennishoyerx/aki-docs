import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { DefaultNotFound } from 'fumadocs-ui/layouts/home/not-found';
import { AkiFooter } from '@/components/aki-footer';
import { baseOptions } from '@/lib/layout.shared';

export function meta() {
  return [{ title: 'Page not found — Aki docs' }];
}

export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="aki-home">
        <section className="aki-section" style={{ paddingTop: '8rem' }}>
          <DefaultNotFound />
        </section>
        <AkiFooter />
      </div>
    </HomeLayout>
  );
}
