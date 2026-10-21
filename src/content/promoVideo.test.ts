import { describe, expect, it } from 'vitest';
import { PROMO_VIDEO, splitOnFilm } from './promoVideo';
import { ALL_READINGS } from '@/lib/topicReadings';
import { HOUSE_SYSTEMS } from '@/lib/astro';
import { ACADEMY } from '@/content/academy';

describe('promo film on landing pages', () => {
  it('splits the body where a line says [film]', () => expect(splitOnFilm('Intro\n[film]\nMore')).toEqual(['Intro', 'More']));
  it('leaves a body without the marker whole', () => expect(splitOnFilm('Just text [film] inline')).toEqual(['Just text [film] inline']));
  it('describes a 24-second film', () => { expect(PROMO_VIDEO.isoDuration).toBe('PT24S'); expect(PROMO_VIDEO.lengthLabel).toBe('0:24'); });
  it('shows the same numbers as the live site', () => {
    expect(ALL_READINGS.length).toBe(PROMO_VIDEO.onScreen.readings);
    expect(HOUSE_SYSTEMS.length).toBe(PROMO_VIDEO.onScreen.houseSystems);
    expect(ACADEMY.reduce((n, p) => n + p.lessons.length, 0)).toBe(PROMO_VIDEO.onScreen.academyLessons);
  });
});
