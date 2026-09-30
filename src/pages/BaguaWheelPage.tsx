import { Link } from 'react-router-dom';
import { BaguaWheel } from '@/components/fengshui/BaguaWheel';

export default function BaguaWheelPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="font-smallcaps text-xs text-gold">Masterbook · Feng Shui</div>
        <h1 className="text-4xl">The Bagua Wheel · April’s Eight Directions</h1>
        <p className="max-w-3xl text-muted-foreground">Tap a direction to see its meaning, rooms, crystals and confidence, from the Birth Chart & Feng Shui guide (Section 18, pp. 114–122).</p>
      </header>
      <BaguaWheel />
      <div className="flex flex-wrap gap-4 text-sm">
        <Link to="/reading#bagua" className="underline">See it in the Complete Reading</Link>
        <Link to="/feng-shui/bagua" className="underline">Bagua & Home page</Link>
        <Link to="/guides/feng-shui-pages" className="underline">Feng Shui page by page</Link>
      </div>
    </div>
  );
}
