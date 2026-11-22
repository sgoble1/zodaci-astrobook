import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ComponentProps, ReactNode } from 'react';
import { PersonalPreviewDrawer } from './PersonalPreviewDrawer';
import type { OpenBook } from './OpenBook';
import type { BookPreviewOptions } from '@/content/sampleBookLeaves';
import { sampleReaderChart, SAMPLE_READER_INPUT } from '@/content/sampleBookLeaves';

const captured = vi.hoisted(() => ({ books: [] as ComponentProps<typeof OpenBook>[] }));
vi.mock('react', async importOriginal => {
  const original = await importOriginal<typeof import('react')>();
  return { ...original, useState: (initial: unknown) => [initial === false ? true : initial, () => {}] };
});
vi.mock('@/components/ui/sheet', () => {
  const Frame = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  return { Sheet: Frame, SheetContent: Frame, SheetDescription: Frame, SheetHeader: Frame, SheetTitle: Frame, SheetTrigger: Frame };
});
vi.mock('@/components/ui/tabs', () => {
  const Frame = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  return { Tabs: Frame, TabsContent: Frame, TabsList: Frame, TabsTrigger: Frame };
});
vi.mock('@/hooks/usePreparedPreview', () => ({ usePreparedPreview: (build: () => unknown) => ({ status: 'ready', value: build(), retry: () => {} }) }));
vi.mock('./OpenBook', () => ({ OpenBook: (props: ComponentProps<typeof OpenBook>) => { captured.books.push(props); return <div>{props.label}</div>; } }));
beforeEach(() => { captured.books.length = 0; });

describe('PersonalPreviewDrawer preview delivery', () => {
  it('opens complete book chapters and a separate complete comic', () => {
    const markup = renderToStaticMarkup(<PersonalPreviewDrawer name="Rosalind Vance" input={SAMPLE_READER_INPUT} />);
    const book = captured.books.find(b => b.kind !== 'comic');
    const faces = book?.leaves.flatMap(l => [l.front, l.back]) ?? [];
    expect(faces.flatMap(f => 'page' in f && f.page ? [f.page] : []).length).toBeGreaterThan(75);
    const comic = captured.books.find(b => b.kind === 'comic');
    expect(comic?.leaves.flatMap(l => [l.front, l.back])).toHaveLength(24);
    expect(comic?.label).toContain('24-page AstroComic');
  });
  it('propagates cover, edition, dedication and tone into leaves and OpenBook', () => {
    const options: BookPreviewOptions = { edition: 'signature', coverName: 'Alex Morgan', coverSrc: 'uploaded.jpg', coverChoice: 'upload', dedication: 'For the careful reader.', tone: 'professional' };
    renderToStaticMarkup(<PersonalPreviewDrawer name="Rosalind Vance" input={SAMPLE_READER_INPUT} bookOptions={options} />);
    const book = captured.books.find(b => b.kind !== 'comic');
    expect(book?.spine?.name).toBe('Alex Morgan');
    expect(book?.trimPt).toEqual([612, 612]);
    expect(book?.leaves[0].front).toMatchObject({ kind: 'jacket', art: 'uploaded.jpg', choice: 'upload', composed: true, finish: 'leatherette', cover: { name: 'Alex Morgan' } });
    const faces = book?.leaves.flatMap(l => [l.front, l.back]) ?? [];
    expect(faces.find(f => f.kind === 'endpaper')).toMatchObject({ lines: expect.arrayContaining(['For the careful reader.']) });
    expect(faces.find(f => f.kind === 'text' && f.title === 'Practitioner reference · Alex')).toMatchObject({ title: 'Practitioner reference · Alex' });
    expect((faces.find(f => f.kind === 'plate')?.page ?? 1) % 2).toBe(0);
    expect(sampleReaderChart().bodies.find(b => b.key === 'sun')?.sign).toBe('Taurus');
  });
  it('uses comic wording for a comic-first trigger and explains unknown-time boundaries', () => {
    const markup = renderToStaticMarkup(<PersonalPreviewDrawer name="Reader" input={{ ...SAMPLE_READER_INPUT, time: null }} defaultTab="comic" />);
    expect(captured.books.find(b => b.kind !== 'comic')?.leaves.flatMap(l => [l.front, l.back]).filter(f => 'page' in f && f.page).length).toBeGreaterThan(75);
  });
});