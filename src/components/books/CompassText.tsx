import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { compassSegments } from '@/lib/readersCompass';

/** Inline, keyboard/touch accessible definitions without turning the surrounding leaf. */
export function CompassText({ text }: { text: string }) {
  return <>{compassSegments(text).map((part, i) => part.term ? (
    <Popover key={i}>
      <PopoverTrigger asChild><Button variant="link" className="ob-compass-term" aria-label={`Define ${part.text}`} onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} onPointerUp={e => e.stopPropagation()}>{part.text}</Button></PopoverTrigger>
      <PopoverContent onClick={e => e.stopPropagation()} aria-label={part.term}><p className="font-semibold">{part.term}</p><p className="mt-2 text-sm leading-relaxed">{part.plain}</p></PopoverContent>
    </Popover>
  ) : part.text)}</>;
}