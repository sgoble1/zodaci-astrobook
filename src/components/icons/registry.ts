import type { ChannelId } from '@/lib/currentChapter';
import type { PlaceScene } from '@/lib/observatory';
import type { AdminTab } from '@/lib/adminTabs';
import {
  ArchiveIcon, BagIcon, BinIcon, BookIcon, ChartWheelIcon, ClipboardIcon, CoinIcon, ComicIcon, ConsoleIcon, ConversationIcon, CrateIcon, EditionsIcon,
  EnvelopeIcon, EyeIcon, GearIcon, GiftIcon, HourglassIcon, LedgerIcon, LibraryIcon, LockIcon, MapIcon, MicrophoneIcon, MugIcon, ObservatoryIcon,
  OrbitPairIcon, PeopleIcon, PenIcon, PressIcon, PrintIcon, RadioIcon, RingsIcon, RisingIcon, RocketIcon, SearchIcon, ShieldIcon, ShipWheelIcon,
  ShirtIcon, SparkIcon, SproutIcon, StampIcon, StorefrontIcon, SummitIcon, TagIcon, TelescopeIcon, TelevisionIcon, UploadIcon, type RetroIconComponent,
} from './RetroIcons';

/** Broadcast channel logos (Channels 01–05). */
export const CHANNEL_ICONS: Record<ChannelId, RetroIconComponent> = {
  chapter: MicrophoneIcon, career: SummitIcon, relationship: OrbitPairIcon, window: TelescopeIcon, growth: SproutIcon,
};

/** One icon per observatory place; used on place banners, the member menu and the phone dock. */
export const PLACE_ICONS: Record<PlaceScene, RetroIconComponent> = {
  'broadcast-studio': TelevisionIcon, 'astral-mapping': MapIcon, 'navigation-chamber': ShipWheelIcon, 'cosmic-archive': ArchiveIcon,
  'relationship-bureau': RingsIcon, 'research-library': LibraryIcon, 'timeline-hall': HourglassIcon, 'founder-command': ConsoleIcon,
  'grand-observatory': ObservatoryIcon, 'observation-deck': TelescopeIcon, 'gift-shop': StorefrontIcon, 'radio-room': RadioIcon, 'comic-press': PressIcon,
};

/** Admin console: section and control icons. */
export const ADMIN_GROUP_ICONS: Record<string, RetroIconComponent> = {
  Editions: EditionsIcon, Products: CrateIcon, Orders: ClipboardIcon, 'Shared Spaces': ConversationIcon, 'Members & growth': PeopleIcon, Platform: GearIcon,
};
export const ADMIN_TAB_ICONS: Record<AdminTab, RetroIconComponent> = {
  access: LockIcon, charts: ChartWheelIcon, upload: UploadIcon, sections: PenIcon, index: SearchIcon, relationships: RingsIcon,
  shop: StorefrontIcon, studio: SparkIcon, orders: BookIcon, comic: ComicIcon, stripe: CoinIcon, shared: ConversationIcon, april: EyeIcon,
  growth: RisingIcon, activity: PeopleIcon, marketing: RocketIcon, newsletter: EnvelopeIcon, credits: LedgerIcon, audit: StampIcon, settings: GearIcon, launch: ShieldIcon,
};

/** Shop category icon from the product type's own words; unknown types get a price tag. */
export function iconForProductType(type: string): RetroIconComponent {
  const t = type.toLowerCase();
  if (/poster|print|art|canvas|frame/.test(t)) return PrintIcon;
  if (/tee|shirt|hood|sweat|apparel|cap|hat|sock/.test(t)) return ShirtIcon;
  if (/mug|cup|tumbler|bottle|glass/.test(t)) return MugIcon;
  if (/tote|bag|pouch/.test(t)) return BagIcon;
  if (/sticker|decal|pin|magnet|patch/.test(t)) return SparkIcon;
  if (/note|journal|book|planner|diary/.test(t)) return BookIcon;
  if (/comic/.test(t)) return ComicIcon;
  if (/gift|card|bundle|set/.test(t)) return GiftIcon;
  if (/^all$/.test(t)) return StorefrontIcon;
  return TagIcon;
}

export { BinIcon, PenIcon, SearchIcon, LogbookIconExport as LogbookIcon };
import { LogbookIcon as LogbookIconExport } from './RetroIcons';
