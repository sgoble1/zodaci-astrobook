import { useId, type ChangeEvent, type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useMyBirth } from '@/lib/myBirth';
import { viewingSharedEdition } from '@/hooks/useAprilSpace';
import { validateDetails, type PersonalDetails } from '@/lib/shopifyCart';

/**
 * Who a personalised shop item is for. Signed-in members can fill it from their saved birth details in one tap;
 * gifts are typed in. Errors show once the buyer tries to add the item.
 */
export function PersonalDetailsForm({ value, onChange, showErrors, product }: { value: PersonalDetails; onChange: (d: PersonalDetails) => void; showErrors: boolean; product: string }) {
  const id = useId();
  const birth = useMyBirth();
  const errors = showErrors ? validateDetails(value) : {};
  const mine = birth && !viewingSharedEdition() ? birth : null;
  const set = (k: keyof PersonalDetails) => (e: ChangeEvent<HTMLInputElement>) => onChange({ ...value, [k]: e.target.value });
  const field = (k: keyof PersonalDetails, label: string, input: ReactNode, hint?: string) => (
    <div className="space-y-1">
      <Label htmlFor={`${id}-${k}`}>{label}</Label>
      {input}
      {errors[k] ? <p id={`${id}-${k}-err`} className="text-sm text-destructive">{errors[k]}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
  const aria = (k: keyof PersonalDetails) => ({ id: `${id}-${k}`, 'aria-invalid': Boolean(errors[k]) || undefined, 'aria-describedby': errors[k] ? `${id}-${k}-err` : undefined });
  return (
    <fieldset className="obs-paper space-y-4 p-4">
      <legend className="sr-only">Who is this {product} for?</legend>
      <p aria-hidden="true" className="font-label text-sm tracking-[0.14em] text-primary">Who is this {product} for?</p>
      {mine && <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground">Making it for yourself?</span>
        <Button type="button" size="sm" variant="outline" onClick={() => onChange({ recipient: mine.name || value.recipient, birthDate: mine.date, birthTime: mine.time ?? '', birthCity: mine.placeLabel || value.birthCity })}>Use my saved birth details</Button>
      </div>}
      {field('recipient', 'Name to print', <Input {...aria('recipient')} value={value.recipient} onChange={set('recipient')} maxLength={60} autoComplete="name" />)}
      <div className="grid gap-4 sm:grid-cols-2">
        {field('birthDate', 'Birth date', <Input {...aria('birthDate')} type="date" value={value.birthDate} onChange={set('birthDate')} min="1900-01-01" max={new Date().toISOString().slice(0, 10)} />)}
        {field('birthTime', 'Birth time', <Input {...aria('birthTime')} type="time" value={value.birthTime} onChange={set('birthTime')} />, 'Leave blank if unknown; rising sign and houses are then left out.')}
      </div>
      {field('birthCity', 'Birth city', <Input {...aria('birthCity')} value={value.birthCity} onChange={set('birthCity')} maxLength={80} placeholder="City, region, country" autoComplete="off" />)}
      <p className="text-xs text-muted-foreground">These details go with your order so the {product} can be drawn for this person. They aren’t saved to anyone’s account.</p>
    </fieldset>
  );
}
