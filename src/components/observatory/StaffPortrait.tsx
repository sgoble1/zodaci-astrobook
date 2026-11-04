import { STAFF, placeFor, type StaffId } from '@/lib/observatory';
import { cn } from '@/lib/utils';
import { PLACE_ICONS } from '@/components/icons/registry';
import { RetroEmblem } from '@/components/icons/RetroIcons';
import { PLACE_SCENES } from './placeScenes';
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

/** Poster banner at the top of every member page: the place's 1950s scene, its icon, and who hosts it. */
export function PlaceBanner({ pathname }: { pathname: string }) {
  const place = placeFor(pathname);
  const host = STAFF[place.host];
  const Icon = PLACE_ICONS[place.scene];
  return (
    <div className="retro-place-banner place-banner-art mb-6">
      <img src={PLACE_SCENES[place.scene]} alt="" aria-hidden width={1536} height={640} loading="eager" decoding="async" className="place-banner-scene" />
      <div className="relative z-[1] flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5">
        <StaffPortrait id={place.host} size={52} className="sm:hidden" />
        <StaffPortrait id={place.host} size={68} className="hidden sm:block" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-label text-[0.72rem] text-primary"><Icon size={16} />Now in · {place.name}</p>
          <p className="mt-0.5 truncate font-script text-xl leading-tight text-foreground sm:text-2xl">{place.motto}</p>
          <p className="font-label text-[0.68rem] text-foreground/75">Hosted by {host.title}</p>
        </div>
        <RetroEmblem icon={Icon} size={48} className="hidden sm:inline-flex" />
      </div>
    </div>
  );
}
