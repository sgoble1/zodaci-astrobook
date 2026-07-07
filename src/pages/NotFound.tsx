import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <div className="font-display text-8xl text-gold">✦</div>
      <h1 className="font-display mt-4">The star chart shows no such page.</h1>
      <p className="text-muted-foreground mt-2">The page you sought is not in this compendium.</p>
      <Link to="/" className="ink-link font-smallcaps text-xs mt-6 inline-block">← Return to the wheel</Link>
    </div>
  );
}
