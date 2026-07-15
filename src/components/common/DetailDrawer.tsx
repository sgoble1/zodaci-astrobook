import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { SourceRefPanel } from './SourceRefPanel';
import type { SourceRef } from '@/content/compendium';

export interface DrawerPayload {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body: ReactNode;
  source?: SourceRef;
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

/**
 * Global drawer that renders any Compendium item in a full detail view with the
 * PDF source reference always visible. Also syncs the current item to the URL
 * hash so entries are linkable / shareable / restorable from the ⌘K palette.
 */
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

  // Open drawer when the URL hash matches a registered item (deep link + ⌘K).
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && registry[hash]) setPayload(registry[hash]);
    else if (!hash) setPayload(null);
  }, [location.hash, registry]);

  const value = useMemo(() => ({ open, close }), [open, close]);

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
              </SheetHeader>
              <div className="gold-rule my-4 w-16" />
              <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed">
                {payload.body}
              </div>
              {payload.source && <SourceRefPanel source={payload.source} />}
            </>
          )}
        </SheetContent>
      </Sheet>
    </DrawerCtx.Provider>
  );
}
