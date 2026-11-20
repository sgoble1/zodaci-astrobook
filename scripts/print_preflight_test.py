import tempfile,unittest
from pathlib import Path
from pypdf import PdfWriter
from pypdf.generic import NameObject,ArrayObject,FloatObject,DictionaryObject,DecodedStreamObject,NumberObject
from print_preflight import inspect_pdf
class PrintPreflightTests(unittest.TestCase):
    def create_pdf(self,dpi=300,bleed=True):
        w=PdfWriter();p=w.add_blank_page(width=450,height=666)
        if bleed: p[NameObject('/TrimBox')]=ArrayObject([FloatObject(v) for v in [9,9,441,657]])
        image=DecodedStreamObject();image.set_data(bytes([0,0,0])*dpi*dpi)
        image.update({NameObject('/Type'):NameObject('/XObject'),NameObject('/Subtype'):NameObject('/Image'),NameObject('/Width'):NumberObject(dpi),NameObject('/Height'):NumberObject(dpi),NameObject('/ColorSpace'):NameObject('/DeviceRGB'),NameObject('/BitsPerComponent'):NumberObject(8)})
        p[NameObject('/Resources')]=DictionaryObject({NameObject('/XObject'):DictionaryObject({NameObject('/Im1'):w._add_object(image)})})
        content=DecodedStreamObject();content.set_data(b'q 72 0 0 72 20 20 cm /Im1 Do Q');p[NameObject('/Contents')]=w._add_object(content)
        path=Path(self.temp.name)/'sample.pdf';w.write(path);return path
    def setUp(self):self.temp=tempfile.TemporaryDirectory()
    def tearDown(self):self.temp.cleanup()
    def test_effective_300ppi_and_eighth_inch_bleed(self):
        r=inspect_pdf(self.create_pdf());self.assertTrue(r['local_checks_pass']);self.assertEqual(r['images'][0]['effective_ppi'],300);self.assertEqual(r['pages'][0]['bleed_points'],[9,9,9,9]);self.assertFalse(r['pdfx_certified'])
    def test_low_resolution_fails(self):self.assertFalse(inspect_pdf(self.create_pdf(100))['local_checks_pass'])
    def test_missing_trim_and_bleed_fail(self):self.assertFalse(inspect_pdf(self.create_pdf(300,False))['local_checks_pass'])
    def test_rgb_preview_is_never_certified_pdfx(self):
        r=inspect_pdf(self.create_pdf(),require_pdfx=True);self.assertFalse(r['local_checks_pass']);self.assertIn('PDF/X-1a metadata marker missing',r['errors']);self.assertFalse(r['pdfx_certified'])
if __name__=='__main__':unittest.main()