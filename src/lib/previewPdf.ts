import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fontUrl from '@/assets/fonts/manuscript.ttf?url';
import { faceText, type BookFace } from '@/lib/bookLeaves';

/** One PDF sheet per preview face; shared page data prevents the download becoming a different book. */
export async function previewPdf(faces: BookFace[]): Promise<Blob> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(await (await fetch(fontUrl)).arrayBuffer(), { subset: true });
  const token = (name: string) => {
    const hsl = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const canvas = document.createElement('canvas'); canvas.width = 1; canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('This browser cannot prepare the preview.');
    ctx.fillStyle = `hsl(${hsl})`; ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return rgb(r / 255, g / 255, b / 255);
  };
  const paper = token('--spot-paper'), ink = token('--comic-navy'), red = token('--comic-brick');
  const wrap = (text: string, size: number, width: number) => {
    const lines: string[] = []; let line = '';
    for (const word of text.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (line && font.widthOfTextAtSize(next, size) > width) { lines.push(line); line = word; }
      else line = next;
    }
    if (line) lines.push(line);
    return lines;
  };
  for (const face of faces.filter(f => f.kind !== 'blank')) {
    const page = pdf.addPage([432, 648]);
    page.drawRectangle({ x: 0, y: 0, width: 432, height: 648, color: paper });
    const src = face.kind === 'cover' ? face.src : face.kind === 'plate' ? face.src : face.kind === 'jacket' ? face.art : null;
    if (src) {
      const response = await fetch(src);
      if (!response.ok) throw new Error('The preview illustration could not be loaded.');
      const bytes = await response.arrayBuffer();
      const image = new Uint8Array(bytes)[0] === 137 ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      const scale = Math.min(360 / image.width, 470 / image.height);
      page.drawImage(image, { x: (432 - image.width * scale) / 2, y: 85, width: image.width * scale, height: image.height * scale });
    }
    const text = faceText(face);
    if (text) {
      let size = face.kind === 'jacket' ? 11 : 12;
      const linesFor = () => text.lines.flatMap(line => [...wrap(line, size, 360), '']);
      let lines = linesFor();
      const available = face.kind === 'cover' || face.kind === 'plate' ? 52 : 490;
      while (lines.length * size * 1.4 > available && size > 6) { size -= .5; lines = linesFor(); }
      let y = 602;
      for (const line of wrap(text.heading, 17, 360)) { page.drawText(line, { x: 36, y, font, size: 17, color: red }); y -= 21; }
      y -= 14;
      if (face.kind === 'plate' || face.kind === 'cover') y = 80;
      if (face.kind === 'jacket') {
        // Cover facts are kept on the PDF even though the artwork itself contains no private lettering.
        page.drawRectangle({ x: 28, y: 530, width: 376, height: 62, color: paper });
        y = 575;
      }
      for (const line of lines) {
        if (y < 30) throw new Error('A preview page is too long to print without losing text.');
        if (line) page.drawText(line, { x: 36, y, font, size, color: ink });
        y -= size * 1.4;
      }
    }
    if ('page' in face && face.page != null) page.drawText(String(face.page), { x: 210, y: 18, font, size: 10, color: ink });
  }
  const bytes = await pdf.save();
  return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}