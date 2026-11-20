"""Read-only Lulu-oriented PDF inspection. Never converts colors or certifies PDF/X conformance.
Usage: python3 scripts/print_preflight.py file.pdf --trim 6 9 --bleed .125 --require-pdfx --out report.json
Lulu allows consistent RGB/sRGB or CMYK; PDF/X-1a is an optional stricter project profile.
"""
import argparse, json, math
from pathlib import Path
from pypdf import PdfReader
from pypdf.generic import ContentStream

IDENTITY=(1,0,0,1,0,0)
def multiply(a,b):
    aa,ab,ac,ad,ae,af=a;ba,bb,bc,bd,be,bf=b
    return (aa*ba+ac*bb,ab*ba+ad*bb,aa*bc+ac*bd,ab*bc+ad*bd,aa*be+ac*bf+ae,ab*be+ad*bf+af)
def resolved(v): return v.get_object() if hasattr(v,'get_object') else v
def inspect_pdf(path,trim=(6,9),bleed=.125,require_pdfx=False):
    reader=PdfReader(path,strict=True)
    errors=[]; warnings=[]; images=[]; fonts=[]; pages=[]; colors=set(); transparencies=[]; inspected=set()
    if reader.is_encrypted: errors.append('Encrypted PDFs are not print-ready')
    metadata=reader.metadata or {}; root=resolved(reader.trailer['/Root'])
    output_intents=[str(resolved(i).get('/S','')) for i in root.get('/OutputIntents',[])]
    pdfx_marker=str(metadata.get('/GTS_PDFXVersion',''))
    def resources_check(resources,page_no):
        for name,ref in resolved(resources.get('/Font',{})).items():
            f=resolved(ref); descriptor=resolved(f.get('/FontDescriptor',{}))
            if f.get('/DescendantFonts'): descriptor=resolved(resolved(f['/DescendantFonts'][0]).get('/FontDescriptor',{}))
            embedded=any(k in descriptor for k in ['/FontFile','/FontFile2','/FontFile3'])
            fonts.append({'page':page_no,'font':str(f.get('/BaseFont',name)),'embedded':embedded})
            if not embedded: errors.append(f'Page {page_no}: font {name} is not embedded')
        for gs in resolved(resources.get('/ExtGState',{})).values():
            g=resolved(gs)
            if float(g.get('/ca',1))<1 or float(g.get('/CA',1))<1 or g.get('/SMask','/None')!='/None': transparencies.append(page_no)
    def walk(stream,resources,page_no,ctm=IDENTITY,depth=0):
        if depth>12: errors.append(f'Page {page_no}: nested artwork exceeds inspection depth');return
        resources=resolved(resources);resources_check(resources,page_no);stack=[]
        try: operations=ContentStream(stream,reader).operations
        except Exception: errors.append(f'Page {page_no}: artwork stream could not be inspected');return
        for args,op in operations:
            if op==b'q': stack.append(ctm)
            elif op==b'Q': ctm=stack.pop() if stack else IDENTITY
            elif op==b'cm': ctm=multiply(ctm,tuple(float(x) for x in args))
            elif op in [b'rg',b'RG']: colors.add('DeviceRGB')
            elif op in [b'k',b'K']: colors.add('DeviceCMYK')
            elif op in [b'g',b'G']: colors.add('DeviceGray')
            elif op==b'Do':
                x=resolved(resolved(resources.get('/XObject',{})).get(args[0]))
                if not x: errors.append(f'Page {page_no}: missing artwork {args[0]}');continue
                if x.get('/Subtype')=='/Image':
                    sx=math.hypot(ctm[0],ctm[1]);sy=math.hypot(ctm[2],ctm[3]);w=int(x.get('/Width',0));h=int(x.get('/Height',0))
                    ppi=min(w/sx*72 if sx else 0,h/sy*72 if sy else 0)
                    colors.add(str(x.get('/ColorSpace','unknown')).lstrip('/'))
                    images.append({'page':page_no,'pixels':[w,h],'effective_ppi':round(ppi,2)})
                    if ppi<300-.01: errors.append(f'Page {page_no}: image effective resolution {ppi:.1f} PPI is below 300')
                    if ppi>600: warnings.append(f'Page {page_no}: image exceeds recommended 600 PPI')
                    if x.get('/SMask'): transparencies.append(page_no)
                elif x.get('/Subtype')=='/Form':
                    walk(x,x.get('/Resources',resources),page_no,multiply(ctm,tuple(float(v) for v in x.get('/Matrix',IDENTITY))),depth+1)
            elif op==b'INLINE IMAGE': errors.append(f'Page {page_no}: inline-image resolution requires additional inspection')
    for n,page in enumerate(reader.pages,1):
        media=page.mediabox; tr=page.trimbox
        explicit_trim='/TrimBox' in page
        width=float(tr.width);height=float(tr.height);margins=[float(tr.left-media.left),float(tr.bottom-media.bottom),float(media.right-tr.right),float(media.top-tr.top)]
        pages.append({'page':n,'media_points':[float(media.width),float(media.height)],'trim_points':[width,height],'bleed_points':margins,'explicit_trimbox':explicit_trim})
        if abs(width-trim[0]*72)>.5 or abs(height-trim[1]*72)>.5: errors.append(f'Page {n}: trim differs from requested {trim[0]} × {trim[1]} inches')
        if bleed and (not explicit_trim or min(margins)<bleed*72-.5): errors.append(f'Page {n}: explicit trim and {bleed} inch bleed are not present on every edge')
        if '/Annots' in page: warnings.append(f'Page {n}: annotations should be removed for printing')
        if int(page.get('/Rotate',0))%360: warnings.append(f'Page {n}: rotated page needs supplier review')
        walk(page.get_contents(),page.get('/Resources',{}),n)
    if len(reader.pages)%2: warnings.append('Interior has an odd page count; binding may require padding')
    if transparencies:
        (errors if require_pdfx else warnings).append('Live transparency found; flatten before strict print export')
    if len(colors)>1: warnings.append('Multiple color spaces found; review supplier color consistency')
    if require_pdfx:
        if 'PDF/X-1' not in pdfx_marker: errors.append('PDF/X-1a metadata marker missing')
        if '/GTS_PDFX' not in output_intents: errors.append('PDF/X output intent missing')
        if any('RGB' in c for c in colors): errors.append('RGB content is incompatible with PDF/X-1a')
    warnings.append('Artwork bleed coverage, ink limits and formal PDF/X conformance require specialist/supplier validation; box and metadata checks are not certification')
    return {'profile':'Lulu 300 PPI / explicit trim and bleed'+(' / PDF/X-1a indicators' if require_pdfx else ''),'local_checks_pass':not errors,'pdfx_certified':False,'page_count':len(reader.pages),'pages':pages,'images':images,'fonts':fonts,'color_spaces':sorted(colors),'pdfx_marker':pdfx_marker,'output_intents':output_intents,'errors':list(dict.fromkeys(errors)),'warnings':list(dict.fromkeys(warnings)),'references':['https://assets.lulu.com/media/guides/en/lulu-api-file-setup-guide.pdf','https://help.lulu.com/en/support/solutions/articles/64000255584-what-is-full-bleed-']}
def main():
    p=argparse.ArgumentParser();p.add_argument('pdf');p.add_argument('--trim',nargs=2,type=float,default=[6,9]);p.add_argument('--bleed',type=float,default=.125);p.add_argument('--require-pdfx',action='store_true');p.add_argument('--out');a=p.parse_args()
    try: result=inspect_pdf(a.pdf,a.trim,a.bleed,a.require_pdfx)
    except Exception as e: result={'local_checks_pass':False,'pdfx_certified':False,'errors':[f'PDF inspection failed: {type(e).__name__}']}
    text=json.dumps(result,indent=2)
    if a.out: Path(a.out).write_text(text)
    print(text);return 0 if result['local_checks_pass'] else 1
if __name__=='__main__': raise SystemExit(main())