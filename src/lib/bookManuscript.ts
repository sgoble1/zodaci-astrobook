import { PDFDocument, rgb, type PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { BOOK_SECTIONS } from '@/lib/books';

export type ManuscriptChapter = { title: string; content: string };
export type ManuscriptInput = { name: string; birthFacts: string; chartFacts: string; chapters: ManuscriptChapter[]; cover?: Uint8Array; edition: string; extras: string[]; fontBytes: Uint8Array };
const W = 432, H = 648, M = 48, BOTTOM = 54;
const ink = rgb(.12, .1, .18), muted = rgb(.38, .36, .42);
const clean = (s: string) => s.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)').replace(/[*`_]/g, '').replace(/\r/g, '');

/** Two-pass, real pagination. No invented filler to manufacture a promised page count. */
export async function composeManuscript(input: ManuscriptInput) {
  if (!input.chapters.length) throw new Error('Write your personal chapters before composing a manuscript.');
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(input.fontBytes, { subset: true });
  pdf.setTitle(`${input.name || 'My'} AstroBook`); pdf.setAuthor('Zodaci'); pdf.setSubject('Personal chart manuscript');
  const lines = (text: string, size: number, width = W - M * 2) => wrap(clean(text), font, size, width);
  const cover = pdf.addPage([W, H]);
  if (input.cover) {
    const image = input.cover[0] === 137 ? await pdf.embedPng(input.cover) : await pdf.embedJpg(input.cover);
    const scale = Math.max(W / image.width, H / image.height);
    cover.drawImage(image, { x: (W-image.width*scale)/2, y: (H-image.height*scale)/2, width: image.width*scale, height: image.height*scale });
  }
  cover.drawRectangle({ x: 0, y: H-180, width: W, height: 160, color: rgb(1,1,1), opacity: .94 });
  lines(`${input.name || 'My'} AstroBook`, 27).forEach((line,i) => cover.drawText(line,{ x:M,y:H-76-i*36,size:27,font,color:ink }));
  cover.drawText('A personal sky, in print · Zodaci', { x:M,y:H-154,size:11,font,color:ink });
  let page = pdf.addPage([W,H]), y = H-M;
  const newPage = () => { page = pdf.addPage([W,H]); y=H-M; };
  const write = (text: string, size=10.5, gap=7) => { for(const line of lines(text,size)) { if(y < BOTTOM+size) newPage(); page.drawText(line,{x:M,y,size,font,color:ink}); y-=size*1.55; } y-=gap; };
  write('About this manuscript',22); write(input.birthFacts); write(`Edition: ${input.edition}. Layout: 6 × 9 inches; printer approval required before production.`);
  write('Planet positions and calculations are distinct from traditional symbolic interpretation. Astrology does not establish personality, sexuality, diagnosis or future events. Personal examples are user reports, not independently verified facts.');
  write('Page count is determined by the actual saved content. This review PDF is not automatically expanded to 250 or 400 pages. No blank filler or invented biography is added to meet a target.');
  const sections: ManuscriptChapter[] = [
    { title: BOOK_SECTIONS[0].title, content: input.chartFacts },
    { title: BOOK_SECTIONS[1].title, content: input.chapters.filter(c => /big three|mind|communication|growth|lesson/i.test(c.title)).map(c=>`## ${c.title}\n\n${c.content}`).join('\n\n') },
    { title: BOOK_SECTIONS[2].title, content: input.chapters.filter(c => /love|relationship|sex|attract/i.test(c.title)).map(c=>`## ${c.title}\n\n${c.content}`).join('\n\n') },
    { title: BOOK_SECTIONS[3].title, content: input.chapters.filter(c => !/big three|mind|communication|growth|lesson|love|relationship|sex|attract/i.test(c.title)).map(c=>`## ${c.title}\n\n${c.content}`).join('\n\n') },
  ];
  for(const extra of input.extras) { const chapter = input.chapters.find(c => c.title.toLowerCase()===extra.toLowerCase()); if(!chapter) throw new Error(`Write the extra section “${extra}” in My Masterbook before adding it to print.`); sections.push({title:extra,content:chapter.content}); }
  if(sections.some(s=>!s.content.trim())) throw new Error('Your four foundations are incomplete. Finish the ready-made chapters in My Masterbook first.');
  // Reserve as many contents pages as needed before laying out chapters.
  const tocPages = Array.from({length:Math.ceil(sections.length/14)},()=>pdf.addPage([W,H]));
  const starts: number[]=[];
  for(const section of sections) {
    newPage(); starts.push(pdf.getPageCount()); write(section.title,22,18);
    for(const paragraph of section.content.split(/\n\s*\n/)) {
      const isHeading = /^#{1,6}\s/.test(paragraph);
      const text = paragraph.replace(/^#{1,6}\s/gm,'').replace(/^\|?[-: ]+\|[-|: ]*$/gm,'');
      if(isHeading && y<110) newPage();
      write(text,isHeading?14:10.5,isHeading?10:7);
    }
  }
  sections.forEach((s,i)=> { const p=tocPages[Math.floor(i/14)]; if(i%14===0) p.drawText('Contents',{x:M,y:H-M,size:23,font,color:ink}); const top=H-M-56-(i%14)*36; const titleLines=lines(s.title,10.5,W-M*2-35); titleLines.slice(0,2).forEach((l,n)=>p.drawText(l,{x:M,y:top-n*13,size:10.5,font,color:ink})); p.drawText(String(starts[i]),{x:W-M-25,y:top,size:10.5,font,color:ink}); });
  pdf.getPages().forEach((p,i)=> { if(i===0)return; p.drawText(`Zodaci · AstroBook     ${i+1}`,{x:M,y:28,size:8,font,color:muted}); });
  return { bytes: await pdf.save(), pages: pdf.getPageCount(), target: input.edition==='expanded'?400:250 };
}

function wrap(text:string,font:PDFFont,size:number,width:number):string[] {
  const out:string[]=[];
  for(const paragraph of text.split('\n')) {
    let current='';
    for(const word of paragraph.split(/\s+/).filter(Boolean)) {
      if(font.widthOfTextAtSize(word,size)>width) {
        if(current){out.push(current);current='';}
        let piece=''; for(const letter of word) { if(font.widthOfTextAtSize(piece+letter,size)>width){out.push(piece);piece='';} piece+=letter; } current=piece;
      } else if(current && font.widthOfTextAtSize(`${current} ${word}`,size)>width) {out.push(current);current=word;}
      else current=current?`${current} ${word}`:word;
    }
    out.push(current);
  }
  return out;
}