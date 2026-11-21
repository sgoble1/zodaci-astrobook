/** Mechanical counter display; the value is also read out as text. */
export function Odometer({ value, label }: { value: string; label: string }) {
  return <span className="odometer" role="img" aria-label={`${label}: ${value}`}>{value.split('').map((d, i) => <span key={i} aria-hidden="true">{d}</span>)}</span>;
}
