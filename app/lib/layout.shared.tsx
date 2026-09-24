import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { AkiMark } from '@/components/aki-mark';
import { appDescription, appName } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="aki-nav-title">
          <AkiMark />
          <span>
            {appName} <em>docs</em>
          </span>
        </span>
      ),
      url: '/docs/introduction',
      transparentMode: 'top',
      children: <span className="aki-nav-status">OSS runtime map</span>,
    },
    links: [
      { text: 'Start here', url: '/docs/introduction', active: 'nested-url' },
      {
        text: 'Architecture',
        url: '/docs/architecture',
        active: 'nested-url',
      },
      { text: 'Reference', url: '/docs/reference', active: 'nested-url' },
    ],
    themeSwitch: {
      enabled: true,
      mode: 'light-dark-system',
    },
    searchToggle: {
      enabled: true,
    },
    children: <span className="sr-only">{appDescription}</span>,
  };
}
