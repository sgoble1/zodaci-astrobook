import { Link } from 'react-router-dom';
import { BaguaWheel } from '@/components/fengshui/BaguaWheel';

export default function BaguaWheelPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="font-label text-xs tracking-[0.16em] text-primary">Masterbook · Feng Shui</div>
        <h1 className="text-4xl">Interactive Bagua Map · April’s Eight Directions</h1>
        <p className="max-w-3xl text-muted-foreground">Tap a direction to see its meaning, rooms, crystals and confidence, from the Birth Chart & Feng Shui guide (Section 18, pp. 114–122).</p>
      </header>
      <section aria-label="What the Bagua is" className="obs-paper max-w-3xl p-5 sm:p-6">
        <p className="font-label text-xs tracking-[0.16em] text-primary">About the Bagua</p>
        <p className="mt-2 text-sm leading-relaxed">The Bagua (the Eight Trigrams) is the foundational map of feng shui. Each of its eight sectors pairs a direction with a life area, an element and a set of qualities. This map shows April’s Bagua for her Kua number 1, with her four favourable directions and four challenging ones marked, so you can see which rooms to use for rest, work and gathering.</p>
      </section>
      <BaguaWheel />
      <div className="flex flex-wrap gap-4 text-sm">
        <Link to="/reading#bagua" className="underline">See it in the Complete Reading</Link>
        <Link to="/feng-shui/bagua" className="underline">Bagua & Home page</Link>
        <Link to="/feng-shui/flying-stars" className="underline">Flying Stars for this year</Link>
        <Link to="/guides/feng-shui-pages" className="underline">Feng Shui page by page</Link>
      </div>
    </div>
  );
}
