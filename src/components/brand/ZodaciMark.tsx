/** Official Zodaci starburst mark: eight rays with planet nodes around a small orbit ring. */
export function ZodaciMark({ className = 'h-12 w-12' }: { className?: string }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Zodaci">
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="currentColor">
        {rays.map(a => {
          const r = (a * Math.PI) / 180; const long = a % 90 === 0; const len = long ? 26 : 20;
          const x = 32 + Math.cos(r) * len; const y = 32 + Math.sin(r) * len;
          return <g key={a}><line x1={32 + Math.cos(r) * 7} y1={32 + Math.sin(r) * 7} x2={x} y2={y} /><circle cx={x} cy={y} r={long ? 3.6 : 2.6} stroke="none" /></g>;
        })}
        <circle cx="32" cy="32" r="5" fill="none" />
        <circle cx="32" cy="32" r="2" stroke="none" />
      </g>
    </svg>
  );
}
