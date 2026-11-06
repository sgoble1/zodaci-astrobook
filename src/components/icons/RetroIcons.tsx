import type { ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * Zodaci 1950s icon set: bold rounded ink strokes, a soft printed tint and a small four-point
 * sparkle, like the pictograms on mid-century planetarium posters. Every icon draws in
 * currentColor so it follows the theme tokens and both chart looks (projector / ink on paper).
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number; title?: string };

function Ico({ size = 22, title, className, children, ...rest }: IconProps & { children: ReactNode }) {
  // Book-cover style: heavy navy ink, halftone tint (pattern in RetroIconDefs) and, at emblem sizes, a gold orbit ring behind.
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={size >= 28 ? 1.6 : 1.9} strokeLinecap="round" strokeLinejoin="round"
      role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title} className={cn('retro-icon shrink-0', className)} {...rest}>
      {size >= 28 && <ellipse cx="12" cy="12.5" rx="11.2" ry="4.4" transform="rotate(-18 12 12.5)" className="retro-orbit" />}
      {children}
    </svg>
  );
}

/** Shared SVG patterns for the icon set (halftone dot tint like the AstroBook cover art). Render once near the app root. */
export function RetroIconDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        <pattern id="retro-halftone" width="2.2" height="2.2" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <rect width="2.2" height="2.2" className="retro-halftone-base" />
          <circle cx="1.1" cy="1.1" r="0.62" className="retro-halftone-dot" />
        </pattern>
      </defs>
    </svg>
  );
}
/** Printed spot-colour tint inside shapes (yellow ink, styled in index.css). */
const T = { className: 'retro-tint' } as const;
/** Four-point sparkle in red ink, the set's signature accent. */
const Spark = ({ x, y, r = 2.2 }: { x: number; y: number; r?: number }) => (
  <path d={`M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`} className="retro-spark" stroke="none" />
);

export type RetroIconComponent = (p: IconProps) => JSX.Element;

/* ── Places & navigation ─────────────────────────────────────────────── */
export const ObservatoryIcon: RetroIconComponent = p => <Ico {...p}><path d="M4 20h16M6 20v-6a6 6 0 0 1 12 0v6" {...T} /><path d="M12 8v3M14.5 9.5l3-5" /><path d="M9.5 20v-3h5v3" /><Spark x={19.5} y={4} /></Ico>;
export const MapIcon: RetroIconComponent = p => <Ico {...p}><circle cx="12" cy="12" r="8" {...T} /><circle cx="12" cy="12" r="4.5" /><path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3 6.3 17.7" strokeWidth={1} /><circle cx="12" cy="12" r="1.2" fill="currentColor" /></Ico>;
export const ArchiveIcon: RetroIconComponent = p => <Ico {...p}><rect x="4" y="4" width="16" height="16" rx="1.5" {...T} /><path d="M4 12h16M10 8h4M10 16h4" /><Spark x={19} y={3.5} r={1.8} /></Ico>;
export const ShipWheelIcon: RetroIconComponent = p => <Ico {...p}><circle cx="12" cy="12" r="6" {...T} /><circle cx="12" cy="12" r="2" /><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4M5.3 5.3l2.8 2.8M15.9 15.9l2.8 2.8M18.7 5.3l-2.8 2.8M8.1 15.9l-2.8 2.8" /></Ico>;
export const CompassIcon: RetroIconComponent = p => <Ico {...p}><circle cx="12" cy="12" r="8.5" {...T} /><path d="m12 5 2 7-2 7-2-7z" fill="currentColor" fillOpacity={0.5} /><path d="M5 12h2M17 12h2" /></Ico>;
export const TelevisionIcon: RetroIconComponent = p => <Ico {...p}><rect x="3" y="7" width="18" height="12" rx="3" {...T} /><rect x="5.5" y="9.5" width="10" height="7" rx="2" /><path d="M9 3.5 12 7l3-3.5M18.5 11v.01M18.5 14v.01M7 19l-1 2M17 19l1 2" /></Ico>;
export const LibraryIcon: RetroIconComponent = p => <Ico {...p}><path d="M4 20V5h3v15M8 20V7h3v13" {...T} /><path d="m12.5 7.5 2.9-.8 3.6 13-2.9.8z" /><path d="M3 20.5h18" /><Spark x={19.5} y={4} r={1.8} /></Ico>;
export const HourglassIcon: RetroIconComponent = p => <Ico {...p}><path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9" /><path d="M9 19c1-1.5 5-1.5 6 0z" fill="currentColor" fillOpacity={0.45} /></Ico>;
export const RingsIcon: RetroIconComponent = p => <Ico {...p}><circle cx="9" cy="13" r="5.5" {...T} /><circle cx="15" cy="13" r="5.5" /><Spark x={12} y={4} r={2} /></Ico>;
export const ConsoleIcon: RetroIconComponent = p => <Ico {...p}><path d="M3 18 5 9h14l2 9z" {...T} /><circle cx="8.5" cy="13.5" r="1.4" /><circle cx="12" cy="13.5" r="1.4" /><path d="M15 12.5v2.5M17 12v3M5 9l1-4h12l1 4" /></Ico>;
export const TelescopeIcon: RetroIconComponent = p => <Ico {...p}><path d="m3.5 13.5 13-6 1.6 3.4-13 6z" {...T} /><path d="m16.5 7.5 3-1.4 1.6 3.4-3 1.4M11 14l-3 7M11 14l3 7M11 14v7" /><Spark x={6} y={5} r={2} /></Ico>;
export const LogbookIcon: RetroIconComponent = p => <Ico {...p}><path d="M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6z" {...T} /><path d="M6 3v18M9 8h6M9 11.5h6M9 15h4" /><Spark x={20} y={4} r={1.8} /></Ico>;
export const StorefrontIcon: RetroIconComponent = p => <Ico {...p}><path d="M4 10v10h16V10" {...T} /><path d="M3 10 5 4h14l2 6c0 1.5-1.3 2.5-3 2.5S15 11.5 15 10c0 1.5-1.3 2.5-3 2.5S9 11.5 9 10c0 1.5-1.3 2.5-3 2.5S3 11.5 3 10ZM10 20v-5h4v5" /></Ico>;
export const RadioIcon: RetroIconComponent = p => <Ico {...p}><rect x="3" y="8" width="18" height="12" rx="3" {...T} /><circle cx="15.5" cy="14" r="3" /><path d="M6 12h5M6 15h5M6 18h5M8 8l8-4.5" /></Ico>;
export const PressIcon: RetroIconComponent = p => <Ico {...p}><rect x="3.5" y="4" width="17" height="16" rx="1" {...T} /><path d="M3.5 11h9M12.5 4v16M12.5 14h8" /><path d="m6 8 1.5-1.5L9 8" /><Spark x={16.5} y={8} r={2} /></Ico>;
export const ChartWheelIcon: RetroIconComponent = p => <Ico {...p}><circle cx="12" cy="12" r="9" {...T} /><circle cx="12" cy="12" r="5.5" /><path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21M5.6 5.6l2.5 2.5M15.9 15.9l2.5 2.5M18.4 5.6l-2.5 2.5M8.1 15.9l-2.5 2.5" strokeWidth={1.2} /><Spark x={12} y={12} r={2} /></Ico>;
export const HomeIcon: RetroIconComponent = p => <Ico {...p}><path d="M4 11 12 4l8 7v9H4z" {...T} /><path d="M10 20v-5h4v5" /><Spark x={19} y={4} r={1.8} /></Ico>;
export const SparkIcon: RetroIconComponent = p => <Ico {...p}><Spark x={12} y={12} r={8} /><Spark x={19} y={5} r={2} /><Spark x={5} y={19} r={1.6} /></Ico>;

/* ── Broadcast channel logos ─────────────────────────────────────────── */
export const MicrophoneIcon: RetroIconComponent = p => <Ico {...p}><rect x="8.5" y="2.5" width="7" height="11" rx="3.5" {...T} /><path d="M8.5 6h2M8.5 9h2M13.5 6h2M13.5 9h2M6 11a6 6 0 0 0 12 0M12 17v4M8.5 21h7" /></Ico>;
export const SummitIcon: RetroIconComponent = p => <Ico {...p}><path d="M2.5 20 9 9l3 4 2.5-3.5L21.5 20z" {...T} /><path d="m7 13 2 1.5 2-1.5" /><Spark x={16} y={4.5} r={2.4} /></Ico>;
export const OrbitPairIcon: RetroIconComponent = p => <Ico {...p}><ellipse cx="12" cy="12" rx="9.5" ry="4.5" transform="rotate(-20 12 12)" /><circle cx="7.5" cy="13" r="3" {...T} /><circle cx="16.5" cy="10.5" r="2.2" fill="currentColor" fillOpacity={0.45} /></Ico>;
export const SproutIcon: RetroIconComponent = p => <Ico {...p}><path d="M5 20a7 7 0 0 1 14 0z" {...T} /><path d="M12 15V8M12 10c-3 0-5-2-5-5 3 0 5 2 5 5ZM12 8c0-2.5 2-4.5 5-4.5 0 3-2 4.5-5 4.5Z" /></Ico>;

/* ── Shop ────────────────────────────────────────────────────────────── */
export const BookIcon: RetroIconComponent = p => <Ico {...p}><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" {...T} /><path d="M5 18a2 2 0 0 1 2-2h11M9 8h5" /><Spark x={11.5} y={11.5} r={1.8} /></Ico>;
export const ComicIcon: RetroIconComponent = p => <Ico {...p}><path d="M4 4h16v12H11l-4 4v-4H4z" {...T} /><path d="m9 8 1.4 1.6L12 8l.6 2.2 2-.4-1.2 1.7" /></Ico>;
export const ShirtIcon: RetroIconComponent = p => <Ico {...p}><path d="M8 3.5 3 6.5l2 4 2-1V20h10V9.5l2 1 2-4-5-3a4 4 0 0 1-8 0Z" {...T} /><Spark x={12} y={13} r={2} /></Ico>;
export const MugIcon: RetroIconComponent = p => <Ico {...p}><path d="M5 7h11v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" {...T} /><path d="M16 9.5h1.5a2.5 2.5 0 0 1 0 5H16M8 2.5c0 1.5 1 1.5 1 3M11.5 2.5c0 1.5 1 1.5 1 3" /></Ico>;
export const PrintIcon: RetroIconComponent = p => <Ico {...p}><rect x="4" y="3" width="16" height="18" rx="1" {...T} /><rect x="6.5" y="5.5" width="11" height="13" /><circle cx="12" cy="12" r="3.5" /><path d="M12 8.5v7M8.5 12h7" strokeWidth={1} /></Ico>;
export const GiftIcon: RetroIconComponent = p => <Ico {...p}><rect x="4" y="9" width="16" height="11" rx="1" {...T} /><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S12 9 12 9Zm0 0c2-4 6-4 6-1.5S12 9 12 9Z" /></Ico>;
export const BagIcon: RetroIconComponent = p => <Ico {...p}><path d="M5 8h14l-1 12H6z" {...T} /><path d="M9 10V7a3 3 0 0 1 6 0v3" /><Spark x={12} y={14} r={2} /></Ico>;
export const TagIcon: RetroIconComponent = p => <Ico {...p}><path d="M3 12V4h8l10 10-8 8z" {...T} /><circle cx="7.5" cy="8.5" r="1.5" /></Ico>;

/* ── Admin controls ──────────────────────────────────────────────────── */
export const EditionsIcon: RetroIconComponent = p => <Ico {...p}><path d="M4 6h10v14H4zM8 3h10v14" {...T} /><circle cx="9" cy="12" r="2" /><path d="M9 14v3" /></Ico>;
export const CrateIcon: RetroIconComponent = p => <Ico {...p}><path d="m12 3 8.5 4.5v9L12 21l-8.5-4.5v-9z" {...T} /><path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9" /></Ico>;
export const ClipboardIcon: RetroIconComponent = p => <Ico {...p}><rect x="5" y="4" width="14" height="17" rx="1.5" {...T} /><path d="M9 4V2.5h6V4M8.5 10l1.5 1.5 3-3M8.5 16h7" /></Ico>;
export const PeopleIcon: RetroIconComponent = p => <Ico {...p}><circle cx="9" cy="8" r="3.2" {...T} /><circle cx="16.5" cy="9.5" r="2.5" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 5.5 2 5.5 5.5" /></Ico>;
export const GearIcon: RetroIconComponent = p => <Ico {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" /><circle cx="12" cy="12" r="6.5" {...T} /></Ico>;
export const RisingIcon: RetroIconComponent = p => <Ico {...p}><path d="M4 20V4M4 20h16" /><path d="M7 16l4-4 3 2.5L20 8v12H7z" {...T} /><path d="m7 16 4-4 3 2.5L20 8" /></Ico>;
export const ConversationIcon: RetroIconComponent = p => <Ico {...p}><path d="M3 5h11v8H8l-3 3v-3H3z" {...T} /><path d="M17 9h4v8h-2v3l-3-3h-5v-2" /></Ico>;
export const LedgerIcon: RetroIconComponent = p => <Ico {...p}><rect x="4" y="3" width="16" height="18" rx="1" {...T} /><path d="M8 3v18M11 8h6M11 12h6M11 16h4" /></Ico>;
export const StampIcon: RetroIconComponent = p => <Ico {...p}><path d="M9 3h6v5l2 3H7l2-3z" {...T} /><path d="M5 14h14v3H5zM6 20h12" /></Ico>;
export const PenIcon: RetroIconComponent = p => <Ico {...p}><path d="m14.5 4.5 5 5L9 20H4v-5z" {...T} /><path d="m12.5 6.5 5 5" /></Ico>;
export const BinIcon: RetroIconComponent = p => <Ico {...p}><path d="M6 7h12l-1 13H7z" {...T} /><path d="M4 7h16M9 7V4h6v3M10 11v6M14 11v6" /></Ico>;
export const SearchIcon: RetroIconComponent = p => <Ico {...p}><circle cx="10.5" cy="10.5" r="6" {...T} /><path d="m15 15 5.5 5.5" /><Spark x={10.5} y={10.5} r={2} /></Ico>;
export const LockIcon: RetroIconComponent = p => <Ico {...p}><rect x="5" y="10" width="14" height="10" rx="2" {...T} /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2.5" /></Ico>;
export const EyeIcon: RetroIconComponent = p => <Ico {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...T} /><circle cx="12" cy="12" r="3" /></Ico>;
export const RefreshIcon: RetroIconComponent = p => <Ico {...p}><path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9" /><path d="M18.5 3v4.2h-4.2M5.5 21v-4.2h4.2" /></Ico>;
export const EnvelopeIcon: RetroIconComponent = p => <Ico {...p}><rect x="3" y="5.5" width="18" height="13" rx="1.5" {...T} /><path d="m3.5 6.5 8.5 7 8.5-7" /></Ico>;
export const UploadIcon: RetroIconComponent = p => <Ico {...p}><path d="M4 16v4h16v-4" /><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" /></Ico>;
export const DownloadIcon: RetroIconComponent = p => <Ico {...p}><path d="M4 16v4h16v-4" /><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" /></Ico>;
export const PlayIcon: RetroIconComponent = p => <Ico {...p}><circle cx="12" cy="12" r="9" {...T} /><path d="m10 8 6 4-6 4z" fill="currentColor" /></Ico>;
export const ShieldIcon: RetroIconComponent = p => <Ico {...p}><path d="M12 3 4.5 6v6c0 4.5 3.2 7.6 7.5 9 4.3-1.4 7.5-4.5 7.5-9V6z" {...T} /><Spark x={12} y={11.5} r={3} /></Ico>;
export const CoinIcon: RetroIconComponent = p => <Ico {...p}><ellipse cx="12" cy="7" rx="7" ry="3" {...T} /><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" /></Ico>;
export const RocketIcon: RetroIconComponent = p => <Ico {...p}><path d="M12 2.5c3 2.5 4 6 4 9.5l-1.5 3h-5L8 12c0-3.5 1-7 4-9.5Z" {...T} /><circle cx="12" cy="9" r="1.6" /><path d="M8 12 5 15.5l3 .5M16 12l3 3.5-3 .5M10.5 18l1.5 3.5 1.5-3.5" /></Ico>;

/** Brass-ringed medallion that frames an icon like a projected slide or printed seal. */
export function RetroEmblem({ icon: Icon, size = 40, active, className, label }: { icon: RetroIconComponent; size?: number; active?: boolean; className?: string; label?: string }) {
  return (
    <span className={cn('retro-emblem', active && 'retro-emblem-active', className)} style={{ width: size, height: size }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <Icon size={Math.round(size * 0.56)} />
    </span>
  );
}
