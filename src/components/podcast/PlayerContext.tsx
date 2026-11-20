import { episodeTitle } from '@/lib/episodeTitle';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Pause, Play, SkipForward, X, Headphones } from 'lucide-react';
import type { LibraryItem } from '@/hooks/useLibrary';
import { useSession } from '@/hooks/useLibrary';
import { Button } from '@/components/ui/button';
import { addAudioBookmark, clampSeek, storedJson, type AudioBookmark } from '@/lib/audioPlayback';

type Ctx = {
  current: LibraryItem | null; queue: string[]; speed: number; positions: Record<string, number>; playing: boolean;
  play: (ep: LibraryItem) => void; playNext: () => void; stop: () => void; toggle: () => void;
  setSpeed: (s: number) => void; setQueue: (f: (q: string[]) => string[]) => void; setCatalog: (items: LibraryItem[]) => void;
  elapsed: number; duration: number; buffering: boolean; error: string; bookmarks: AudioBookmark[]; seek: (n: number) => void; retry: () => void; bookmark: () => void; removeBookmark: (n: number) => void;
};
const PlayerCtx = createContext<Ctx | null>(null);
export const usePlayer = () => { const c = useContext(PlayerCtx); if (!c) throw new Error('usePlayer outside provider'); return c; };

/** App-wide podcast player: the audio element lives here so playback continues across page changes. */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const uid = session?.user.id;
  const [current, setCurrent] = useState<LibraryItem | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(() => +(localStorage.getItem('pod:speed') ?? 1));
  const [queue, setQueueS] = useState<string[]>(() => storedJson('pod:queue', []));
  const [positions, setPositions] = useState<Record<string, number>>(() => storedJson('pod:pos', {}));
  const [elapsed, setElapsed] = useState(0); const [duration, setDuration] = useState(0); const [buffering, setBuffering] = useState(false); const [error, setError] = useState('');
  const [bookmarkMap, setBookmarkMap] = useState<Record<string, AudioBookmark[]>>({});
  useEffect(() => { setCurrent(null); setPlaying(false); setQueueS([]); setElapsed(0); setDuration(0); setError(''); setBookmarkMap(uid ? storedJson(`pod:bookmarks:${uid}`, {}) : {}); catalog.current = []; }, [uid]);
  const catalog = useRef<LibraryItem[]>([]);
  const audio = useRef<HTMLAudioElement>(null);
  const lastSave = useRef(0);
  const panel = useRef<HTMLDivElement>(null);
  const open = !!current?.url;
  // Reserve room at the end of the page for the floating player (see #main-content::after).
  useEffect(() => {
    const root = document.documentElement;
    if (!open) { delete root.dataset.playerOpen; root.style.removeProperty('--player-h'); return; }
    root.dataset.playerOpen = '';
    const el = panel.current;
    if (!el || typeof ResizeObserver === 'undefined') return () => { delete root.dataset.playerOpen; };
    const ro = new ResizeObserver(() => root.style.setProperty('--player-h', `${Math.ceil(el.getBoundingClientRect().height)}px`));
    ro.observe(el);
    return () => { ro.disconnect(); delete root.dataset.playerOpen; root.style.removeProperty('--player-h'); };
  }, [open]);
  useEffect(() => { localStorage.setItem('pod:queue', JSON.stringify(queue)); }, [queue]);
  useEffect(() => { localStorage.setItem('pod:speed', String(speed)); if (audio.current) audio.current.playbackRate = speed; }, [speed]);
  const savePos = (id: string, t: number) => setPositions(p => { const n = { ...p, [id]: t }; localStorage.setItem('pod:pos', JSON.stringify(n)); return n; });
  const play = useCallback((ep: LibraryItem) => { setError(''); setElapsed(0); setDuration(0); setBuffering(true); setCurrent(ep); setQueueS(q => q.filter(x => x !== ep.id)); }, []);
  const playNext = () => { const next = queue.map(id => catalog.current.find(i => i.id === id)).find(Boolean); if (next) play(next); else setPlaying(false); };
  const stop = () => { if (current && audio.current) savePos(current.id, audio.current.currentTime); setCurrent(null); setPlaying(false); };
  const toggle = () => { const a = audio.current; if (!a) return; if (a.paused) void a.play().catch(() => { setBuffering(false); setError('Audio could not play. Try again or reopen the episode.'); }); else a.pause(); };
  const seek = (n: number) => { if (!audio.current) return; const t = clampSeek(n, duration); audio.current.currentTime = t; setElapsed(t); };
  const retry = () => { if (!audio.current) return; setError(''); setBuffering(true); audio.current.load(); };
  const saveBookmarks = (items: AudioBookmark[]) => { if (!uid || !current) return; const next = { ...bookmarkMap, [current.id]: items }; setBookmarkMap(next); localStorage.setItem(`pod:bookmarks:${uid}`, JSON.stringify(next)); };
  const bookmarks = current ? bookmarkMap[current.id] ?? [] : [];
  const bookmark = () => saveBookmarks(addAudioBookmark(bookmarks, elapsed, duration));
  const removeBookmark = (n: number) => saveBookmarks(bookmarks.filter(b => b.seconds !== n));
  const setCatalog = useCallback((items: LibraryItem[]) => { catalog.current = items; }, []);
  const setQueue = (f: (q: string[]) => string[]) => setQueueS(f);

  return (
    <PlayerCtx.Provider value={{ current, queue, speed, positions, playing, play, playNext, stop, toggle, setSpeed, setQueue, setCatalog, elapsed, duration, buffering, error, seek, retry, bookmarks, bookmark, removeBookmark }}>
      {children}
      {current?.url && (
        <div ref={panel} role="region" aria-label="Podcast player" className="float-above-tabbar fixed bottom-4 right-4 left-4 lg:left-auto lg:w-[420px] z-50 rounded-xl border border-border bg-card/90 backdrop-blur-xl shadow-lg p-3">
          <div className="flex items-center gap-3">
            {current.cover_url && <img loading="lazy" decoding="async" src={current.cover_url} alt="" className="h-10 w-10 shrink-0 rounded object-cover"/>}
            <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground grid place-items-center">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="font-label text-[10px] tracking-[0.14em] text-primary flex items-center gap-1"><Headphones className="w-3 h-3" />Now playing · {speed}×</div>
              <Link to="/podcasts" className="block truncate text-sm hover:underline">{episodeTitle(current.title)}</Link>
            </div>
            {queue.length > 0 && <button onClick={playNext} aria-label="Next in queue" className="p-2 rounded hover:bg-muted"><SkipForward className="w-4 h-4" /></button>}
            <button onClick={stop} aria-label="Close player" className="p-2 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
          </div>
          <audio key={current.id} ref={audio} src={current.url} controls autoPlay className="w-full mt-2 h-9"
            onWaiting={() => setBuffering(true)} onCanPlay={() => setBuffering(false)} onError={() => { setBuffering(false); setPlaying(false); setError('Audio could not load. Retry or reopen the episode for a fresh private link.'); }}
            onPlay={() => { setPlaying(true); setBuffering(false); setError(''); }} onPause={e => { setPlaying(false); savePos(current.id, e.currentTarget.currentTime); }}
            onLoadedMetadata={e => { const el = e.currentTarget; setDuration(Number.isFinite(el.duration) ? el.duration : 0); el.playbackRate = speed; const p = positions[current.id]; if (p && p < el.duration - 5) el.currentTime = p; setElapsed(el.currentTime); }}
            onTimeUpdate={e => { const t = e.currentTarget.currentTime; setElapsed(t); if (Math.abs(t - lastSave.current) > 5) { lastSave.current = t; savePos(current.id, t); } }}
            onEnded={() => { savePos(current.id, 0); playNext(); }} />
          {error && <div role="alert" className="text-sm text-destructive">{error}<Button variant="ghost" size="sm" onClick={retry}>Retry</Button></div>}
        </div>
      )}
    </PlayerCtx.Provider>
  );
}
