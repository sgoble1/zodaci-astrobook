import React, { type ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ComicDigest } from './ComicDigest';
import type { OpenBook } from '@/components/books/OpenBook';
import { sampleComicLeaves, sampleReaderChart } from '@/content/sampleBookLeaves';
import { buildComicPreview } from '@/lib/comicNarrative';
const captured = vi.hoisted(() => ({ props: null as ComponentProps<typeof OpenBook> | null }));
vi.mock('@/components/books/OpenBook', () => ({ OpenBook: (props: ComponentProps<typeof OpenBook>) => { captured.props = props; return <div />; } }));
describe('shared turnable digest', () => {
  it('uses complete authorized issue faces and matching digest geometry', () => {
    const issue = buildComicPreview(sampleReaderChart(), { reader: 'Rosalind Vance', month: new Date('2026-11-01'), issueNumber: 1 });
    renderToStaticMarkup(<ComicDigest issue={issue} layout="side" />);
    expect(captured.props?.trimPt).toEqual([396, 612]);
    expect(captured.props?.kind).toBe('comic');
    expect(captured.props?.layout).toBe('side');
    const faces = captured.props?.leaves.flatMap(l => [l.front, l.back]) ?? [];
    expect(faces).toHaveLength(24);
    faces.forEach((face, i) => {
      expect(face.kind).toBe('comic-page');
      if (face.kind === 'comic-page') expect(face.sheet).toBe(issue.pages[i]);
    });
  });
  it('preserves the public leaves without substituting account information', () => {
    const leaves = sampleComicLeaves();
    renderToStaticMarkup(<ComicDigest leaves={leaves} reader="Rosalind Vance" />);
    expect(captured.props?.leaves).toBe(leaves);
    expect(captured.props?.spine?.name).toBe('Rosalind Vance');
    expect(JSON.stringify(captured.props?.leaves)).not.toMatch(/Shane|Julian Mercer|Williamsville/);
  });
});