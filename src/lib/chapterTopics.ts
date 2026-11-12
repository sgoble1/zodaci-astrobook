/** Topic groups used to filter every founder edition's chapter list (matched on the chapter title and label only). */
export const CATEGORIES: [string, RegExp][] = [
  ['Planets & Points', /\b(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|node|chiron|lilith|vertex|ascendant|rising|midheaven|fortune|stellium)\b/i],
  ['Houses', /\bhouse/i],
  ['Aspects & Techniques', /aspect|harmonic|midpoint|antiscia|dispositor|sect|decan|arabic|sabian|fixed star|asteroid/i],
  ['Timing & Forecasts', /transit|progress|solar (return|arc)|profection|eclipse|retrograde|timeline|year|forecast|20\d\d|return/i],
  ['Love & Relationships', /love|relationship|compatib|partner|marriage/i],
  ['Career & Purpose', /career|vocation|purpose|mission|professional|strateg/i],
  ['Health & Body', /health|body|wellness|healing|chakra|color|sound/i],
  ['Soul & Spirit', /past li|karmic|soul|spirit|metaphysic|meditat|dream|shadow|gene key|human design/i],
  ['Other Systems', /numerolog|chinese|tarot|feng shui|life path/i],
  ['Practices & Affirmations', /journal|ritual|affirmation|prompt|practice/i],
  ['Letters & Synthesis', /letter|synthesis|final|closing|dedication|foreword|introduction|whole point|reflection/i],
  ['Reference & Art', /appendix|glossary|reference|table|illustration|style guide|resources/i],
];
export const catsFor = (e: { title: string; label: string }) => CATEGORIES.filter(([, r]) => r.test(e.title + ' ' + e.label)).map(([c]) => c);

/** Reading time at an unhurried 230 words a minute, never below one minute. */
export const minutesToRead = (words: number) => Math.max(1, Math.round(words / 230));
