import { HeroSlideshow } from './HeroSlides';
import { FilmFx } from './FilmFx';
import calendarArt from '@/assets/forecast/forecast-sky-calendar.jpg';
export type ForecastFrame = { title: string; detail: string; date: Date; kind: string };
export function ForecastReel({ frames, personal = false }: { frames: ForecastFrame[]; personal?: boolean }) {
  if (!frames.length) return <p className="border-y border-border py-6 text-muted-foreground">No major events found in this window.</p>;
  return <HeroSlideshow label={personal ? 'Your forecast film' : 'Sky calendar film'} interval={20000} className="forecast-reel" slides={frames.slice(0, 8).map((event, i) => ({
    id: `${event.date.toISOString()}-${i}`, label: event.title,
    content: <div className="forecast-reel-frame">
      <img src={calendarArt} alt="" width={1280} height={768} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <FilmFx motes={14} specks={5} />
      <div className="forecast-reel-copy relative z-10">
        <p className="font-label text-sm text-primary">{personal && event.kind === 'exact' ? 'Natal chart contact' : 'Shared sky event'} · <time dateTime={event.date.toISOString()}>{event.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC' })} UTC</time></p>
        <h3 className="mt-3 font-display text-2xl leading-tight sm:text-4xl">{event.title}</h3>
        <p className="mt-3 max-w-xl text-foreground">{event.detail}</p>
        <p className="mt-4 font-script text-2xl text-primary">The next signal on the horizon.</p>
      </div>
    </div>,
  }))} />;
}
