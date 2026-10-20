import { TONES, type Tone } from '@/lib/perception';

/** MOD-005: three-way tone toggle. The choice is saved to the member's profile. */
export function ToneSwitcher({ tone, onChange }: { tone: Tone; onChange: (t: Tone) => void }) {
  return (
    <div role="radiogroup" aria-label="Reading tone" className="inline-flex rounded-full border border-border bg-card p-1">
      {TONES.map(t => (
        <button key={t.id} type="button" role="radio" aria-checked={tone === t.id} title={t.note} onClick={() => onChange(t.id)}
          className={`rounded-full px-3 py-1.5 text-sm transition-colors duration-500 focus-visible:outline focus-visible:outline-2 ${tone === t.id ? (t.id === 'oracle' ? 'bg-primary text-primary-foreground' : t.id === 'educational' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground') : 'text-muted-foreground hover:text-foreground'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
