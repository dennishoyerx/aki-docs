import { Link } from 'react-router';
import { AkiMark } from './aki-mark';

export function AkiFooter() {
  return (
    <footer className="aki-footer" aria-label="Aki documentation footer">
      <div className="aki-footer__brand">
        <AkiMark />
        <span>Aki docs</span>
      </div>
      <p>Clear boundaries for a capable runtime.</p>
      <nav className="aki-footer__links" aria-label="Footer navigation">
        <Link to="/docs/introduction/start-here">Start here</Link>
        <Link to="/docs/reference/api-first-contact">API first contact</Link>
        <Link to="/health">Docs health</Link>
      </nav>
    </footer>
  );
}
