import { STAFF, placeFor, type StaffId } from '@/lib/observatory';
import { cn } from '@/lib/utils';
import director from '@/assets/staff/director.jpg';
import cartographer from '@/assets/staff/cartographer.jpg';
import archivist from '@/assets/staff/archivist.jpg';
import navigator from '@/assets/staff/navigator.jpg';
import analyst from '@/assets/staff/analyst.jpg';
import broadcaster from '@/assets/staff/broadcaster.jpg';
import researcher from '@/assets/staff/researcher.jpg';
import historian from '@/assets/staff/historian.jpg';
import curator from '@/assets/staff/curator.jpg';

export const STAFF_PORTRAITS: Record<StaffId, string> = { director, cartographer, archivist, navigator, analyst, broadcaster, researcher, historian, curator };

/** Round brass-ringed portrait of an observatory specialist. */
export function StaffPortrait({ id, size = 56, className }: { id: StaffId; size?: number; className?: string }) {
  return (
    <img
      src={STAFF_PORTRAITS[id]}
      alt={`${STAFF[id].title}, ${STAFF[id].department}`}
      width={size}
      height={size}
      loading="lazy"
      className={cn('retro-portrait shrink-0 rounded-full object-cover', className)}
      style={{ width: size, height: size }}
    />
  );
}

/** Poster banner at the top of every member page: which place you're in and who hosts it. */
export function PlaceBanner({ pathname }: { pathname: string }) {
  const place = placeFor(pathname);
  const host = STAFF[place.host];
  return (
    <div className="retro-place-banner mb-6 flex items-center gap-4 px-4 py-3 sm:px-5">
      <StaffPortrait id={place.host} size={52} className="sm:hidden" />
      <StaffPortrait id={place.host} size={64} className="hidden sm:block" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-label text-[0.7rem] text-primary"><span aria-hidden className="obs-light h-1.5 w-1.5 rounded-full bg-primary" />Now in · {place.name}</p>
        <p className="mt-0.5 truncate font-script text-xl leading-tight text-foreground sm:text-2xl">{place.motto}</p>
        <p className="font-label text-[0.65rem] text-muted-foreground">Hosted by {host.title}</p>
      </div>
      <span aria-hidden className="retro-starburst retro-twinkle hidden text-2xl text-primary sm:inline-block" />
    </div>
  );
}
