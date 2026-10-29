/** Traditional and modern sign rulers, used to trace houses and profection years to the planet that runs them. */
export const SIGN_RULER: Record<string, { traditional: string; modern?: string }> = {
  Aries: { traditional: 'mars' }, Taurus: { traditional: 'venus' }, Gemini: { traditional: 'mercury' }, Cancer: { traditional: 'moon' },
  Leo: { traditional: 'sun' }, Virgo: { traditional: 'mercury' }, Libra: { traditional: 'venus' }, Scorpio: { traditional: 'mars', modern: 'pluto' },
  Sagittarius: { traditional: 'jupiter' }, Capricorn: { traditional: 'saturn' }, Aquarius: { traditional: 'saturn', modern: 'uranus' }, Pisces: { traditional: 'jupiter', modern: 'neptune' },
};
