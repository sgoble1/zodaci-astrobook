export type DocSection = { title: string; text: string; page?: number };

const HEADING = /^(part|chapter|section|appendix|introduction|closing|conclusion)\b|^\d{1,2}[.)]\s+\S/i;

/** Extract readable sections from an uploaded PDF, spreadsheet or text file, entirely in the browser. */
export async function extractSections(file: File): Promise<DocSection[]> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return extractPdf(file);
  if (['xlsx', 'xls', 'csv', 'ods', 'tsv'].includes(ext)) return extractSheet(file);
  const text = await file.text();
  return [{ title: file.name, text }];
}

async function extractPdf(file: File): Promise<DocSection[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const worker = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const c = await (await doc.getPage(i)).getTextContent();
    let out = '';
    for (const it of c.items as { str: string; hasEOL?: boolean }[]) out += it.str + (it.hasEOL ? '\n' : '');
    pages.push(out.trim());
  }
  // Group pages into sections whenever a page opens with a heading-like line; otherwise one section per page.
  const sections: DocSection[] = [];
  pages.forEach((txt, i) => {
    const first = txt.split('\n').map(l => l.trim()).find(Boolean) ?? '';
    const isHead = HEADING.test(first) && first.length < 100;
    const last = sections[sections.length - 1];
    if (!last || isHead || !sections.some(s => HEADING.test(s.title))) {
      sections.push({ title: isHead ? first : `Page ${i + 1}${first ? ' — ' + first.slice(0, 70) : ''}`, text: txt, page: i + 1 });
    } else {
      last.text += `\n\n[Page ${i + 1}]\n${txt}`;
    }
  });
  return sections;
}

async function extractSheet(file: File): Promise<DocSection[]> {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(await file.arrayBuffer());
  return wb.SheetNames.map(name => {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, blankrows: false }) as unknown[][];
    const cell = (v: unknown) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const width = Math.max(1, ...rows.map(r => r.length));
    const md = rows.length
      ? [rows[0], Array(width).fill('---'), ...rows.slice(1)].map(r => '| ' + Array.from({ length: width }, (_, i) => cell(r[i])).join(' | ') + ' |').join('\n')
      : '_Empty sheet_';
    return { title: `Sheet: ${name}`, text: md };
  });
}
