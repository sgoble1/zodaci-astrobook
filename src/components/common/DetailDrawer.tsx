import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { SourceRefPanel } from './SourceRefPanel';
import { SourcesList } from './Cite';
import { CopyLinkButton } from './CopyLinkButton';
import { ReasoningPanel, type Reasoning } from './ReasoningPanel';
import type { SourceRef } from '@/content/compendium';

export interface DrawerPayload {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body: ReactNode;
  source?: SourceRef;
  sources?: SourceRef[];
  reasoning?: Reasoning;
  route?: string;              // route this item lives on (for share-link)
}

interface Ctx {
  open: (payload: DrawerPayload) => void;
  close: () => void;
}
const DrawerCtx = createContext<Ctx | null>(null);

export function useDetailDrawer() {
  const ctx = useContext(DrawerCtx);
  if (!ctx) throw new Error('useDetailDrawer must be used inside <DetailDrawerProvider>');
  return ctx;
}

export function DetailDrawerProvider({
  children, registry,
}: { children: ReactNode; registry: Record<string, DrawerPayload> }) {
  const [payload, setPayload] = useState<DrawerPayload | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const open = useCallback((p: DrawerPayload) => {
    setPayload(p);
    navigate(`${location.pathname}#${p.id}`, { replace: false });
  }, [location.pathname, navigate]);

  const close = useCallback(() => {
    setPayload(null);
    if (location.hash) navigate(location.pathname, { replace: true });
  }, [location.hash, location.pathname, navigate]);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && registry[hash]) setPayload(registry[hash]);
    else if (!hash) setPayload(null);
  }, [location.hash, registry]);

  const value = useMemo(() => ({ open, close }), [open, close]);
  const allSources: SourceRef[] = payload
    ? [...(payload.sources ?? []), ...(payload.source && !(payload.sources ?? []).includes(payload.source) ? [payload.source] : [])]
    : [];

  return (
    <DrawerCtx.Provider value={value}>
      {children}
      <Sheet open={!!payload} onOpenChange={v => !v && close()}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto bg-card">
          {payload && (
            <>
              <SheetHeader className="text-left">
                {payload.eyebrow && (
                  <div className="font-smallcaps text-[10px] tracking-wider text-gold">{payload.eyebrow}</div>
                )}
                <SheetTitle className="font-display text-2xl leading-tight">{payload.title}</SheetTitle>
                {payload.subtitle && (
                  <SheetDescription className="text-foreground/70">{payload.subtitle}</SheetDescription>
                )}
                <div className="pt-1">
                  <CopyLinkButton hash={payload.id} path={payload.route} label="Copy deep link" />
                </div>
              </SheetHeader>
              <div className="gold-rule my-4 w-16" />
              <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed">
                {payload.body}
              </div>
              {payload.reasoning && <ReasoningPanel reasoning={payload.reasoning} />}
              {allSources.length > 1
                ? <SourcesList sources={allSources} />
                : payload.source && <SourceRefPanel source={payload.source} />}
            </>
          )}
        </SheetContent>
      </Sheet>
    </DrawerCtx.Provider>
  );
}
