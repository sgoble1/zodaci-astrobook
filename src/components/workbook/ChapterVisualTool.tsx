import { useId, useState } from 'react';
import { ArrowRight, Check, Eye, Gauge, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorkbookModule } from '@/content/workbook';

const positions = ['More like the left', 'Between both', 'More like the right'] as const;

export function ChapterVisualTool({ module }: { module: WorkbookModule }) {
  const [position, setPosition] = useState(1);
  const [checked, setChecked] = useState<number[]>([]);
  const titleId = useId();
  const markerPosition = position === 0 ? 'left-[12%]' : position === 1 ? 'left-1/2' : 'left-[88%]';

  return (
    <section className="overflow-hidden rounded-lg border border-created/30 bg-created/5" aria-labelledby={titleId}>
      <div className="border-b border-created/20 bg-created/10 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"><Gauge aria-hidden className="h-5 w-5" /></div>
          <div className="min-w-0">
            <div className="font-smallcaps text-[10px] text-created">Visual thinking tool</div>
            <h2 id={titleId} className="mt-1 text-2xl">{module.visual.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{module.visual.summary}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-[1.05fr,0.95fr]">
        <div>
          <h3 className="text-base font-medium">Where are you today?</h3>
          <div className="mt-4" role="img" aria-label={`${module.visual.left} to ${module.visual.right}. Current answer: ${positions[position]}.`}>
            <div className="relative h-3 rounded-full bg-gradient-to-r from-primary via-accent to-created">
              <span className={`absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-foreground shadow-[var(--shadow-gold)] transition-[left] ${markerPosition}`} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
              <span>{module.visual.left}</span>
              <span className="text-right">{module.visual.right}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-1" aria-label="Choose where you are on the scale">
            {positions.map((label, index) => (
              <Button key={label} type="button" variant={position === index ? 'default' : 'outline'} className="h-auto min-h-11 whitespace-normal px-2 py-2 text-xs leading-tight" aria-pressed={position === index} onClick={() => setPosition(index)}>
                {index === 0 ? 'Left' : index === 1 ? 'Balanced' : 'Right'}
              </Button>
            ))}
          </div>
          <p className="mt-3 rounded border border-border bg-card/60 p-3 text-sm" aria-live="polite">
            <span className="font-medium">Your view:</span> {module.visual.responses[position]}
          </p>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-base font-medium"><Eye aria-hidden className="h-4 w-4 text-accent" />A pattern to notice</h3>
          <ol className="mt-3 grid gap-2">
            {module.visual.flow.map((item, index) => (
              <li key={item} className="flex items-center gap-2 rounded border border-border bg-card/50 p-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs">{index + 1}</span>
                <span className="min-w-0 flex-1">{item}</span>
                {index < module.visual.flow.length - 1 && <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" aria-hidden />}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="grid gap-4 border-t border-created/20 p-4 sm:grid-cols-2 sm:p-5">
        <div>
          <h3 className="text-base font-medium">Signals you can track</h3>
          <p className="mt-1 text-xs text-muted-foreground">Tap what you have noticed lately. This stays on this screen and is not saved.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {module.visual.signals.map((signal, index) => {
              const active = checked.includes(index);
              return <Button key={signal} type="button" size="sm" variant={active ? 'secondary' : 'outline'} className="h-auto min-h-10 whitespace-normal text-left" aria-pressed={active} onClick={() => setChecked(current => active ? current.filter(value => value !== index) : [...current, index])}>{active && <Check aria-hidden />}{signal}</Button>;
            })}
          </div>
        </div>
        <div className="rounded border border-accent/30 bg-accent/5 p-4">
          <h3 className="flex items-center gap-2 text-base font-medium"><Lightbulb aria-hidden className="h-4 w-4 text-accent" />Try this next</h3>
          <p className="mt-2 text-sm text-foreground/85">{module.visual.action}</p>
        </div>
      </div>
    </section>
  );
}