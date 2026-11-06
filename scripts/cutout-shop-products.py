# Downloads shop product photos by title and removes their studio backgrounds (rembg isnet-general-use).
# Usage: python3 scripts/cutout-shop-products.py titles.json out_dir   (titles.json maps file key -> exact product title)
import json, urllib.request, io, sys, os
from PIL import Image
from rembg import remove, new_session
sess = new_session('isnet-general-use')
Q = '''{ products(first:250, query:"tag:'Atomic Zodiac' OR product_type:Books"){ edges{ node{ title handle productType images(first:1){edges{node{url}}} } } } }'''
req = urllib.request.Request("https://zodaci-astrobook-e3648-srr1g6qe.myshopify.com/api/2026-10/graphql.json", data=json.dumps({"query":Q}).encode(), headers={'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':'c01053a374f63c388088f3af943e9680'})
prods = [e['node'] for e in json.load(urllib.request.urlopen(req))['data']['products']['edges']]
by = {p['title']: p for p in prods}
want = json.load(open(sys.argv[1]))
out = {}
for key, title in want.items():
    p = by.get(title)
    if not p or not p['images']['edges']: print('MISSING', key, title); continue
    url = p['images']['edges'][0]['node']['url'] + '&width=900'
    im = Image.open(io.BytesIO(urllib.request.urlopen(url).read())).convert('RGBA')
    alpha = im.getchannel('A')
    if alpha.getextrema()[0] > 250:  # opaque → remove background
        im = remove(im, session=sess, post_process_mask=True)
    bbox = im.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox()
    im = im.crop(bbox)
    im.thumbnail((640, 760))
    path = f"{sys.argv[2]}/{key}.webp"
    im.save(path, 'WEBP', quality=82, method=6)
    out[key] = {'title': title, 'handle': p['handle'], 'w': im.width, 'h': im.height, 'size': os.path.getsize(path)//1024}
    print(key, out[key])
json.dump(out, open(sys.argv[2] + '/manifest.json', 'w'), indent=1)
