"""Extract approved vector artwork and verbatim content; originals stay untouched."""
import json, re, copy, argparse
from pathlib import Path
import pymupdf
import xml.etree.ElementTree as ET
from PIL import Image

root = Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--image-dir',type=Path,help='Optional folder containing the original generated image PNGs. Omit to preserve bundled WebP files.')
args=parser.parse_args()
out = root / 'public' / 'brand'
out.mkdir(parents=True, exist_ok=True)
doc = pymupdf.open(root / 'doc' / 'Dreniak Brand Guideline.pdf')
drawing = doc[6].get_drawings()[2]
x0,y0 = drawing['rect'].x0,drawing['rect'].y0
def point(p): return f'{p.x-x0:.3f} {p.y-y0:.3f}'
parts = ['M'+point(drawing['items'][0][1])]
for item in drawing['items']:
    if item[0] == 'l': parts.append('L'+point(item[2]))
    elif item[0] == 'c': parts.append('C'+' '.join(point(p) for p in item[2:]))
mark = ' '.join(parts)+'Z'
(out/'mark-path.json').write_text(json.dumps(mark))
def svg(body,view='0 0 122 105'): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}">{body}</svg>'
for name,color in [('red','#991923'),('indigo','#0d3251'),('white','#ffffff'),('black','#000000')]:
    (out/f'mark-{name}.svg').write_text(svg(f'<path fill="{color}" d="{mark}"/>'))
    fill = '#191919' if name=='black' else '#eeeeee' if name=='white' else color
    body = f'<defs><pattern id="m" width="250" height="115" patternUnits="userSpaceOnUse"><g fill="{fill}"><path d="{mark}" transform="translate(124 108) rotate(180)"/><path d="{mark}" transform="translate(126 108) scale(1 -1)"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#m)"/>'
    (out/f'motif-{name}.svg').write_text(svg(body,'0 0 1000 460'))

# Keep the approved outlined wordmark/tagline from the PDF (not a font recreation).
ns='{http://www.w3.org/2000/svg}'
ET.register_namespace('', 'http://www.w3.org/2000/svg')
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
original=ET.fromstring(doc[6].get_svg_image())
defs=original.find(ns+'defs')
for theme,color in [('dark','#ffffff'),('light','#000000'),('white','#ffffff')]:
    logo=ET.Element(ns+'svg',{'viewBox':'110 238 614 114','width':'614','height':'114'})
    logo.append(copy.deepcopy(defs))
    ET.SubElement(logo,ns+'path',{'d':mark,'fill':'#ffffff' if theme=='white' else '#991923','transform':f'translate({x0} {y0})'})
    for element in original.iter(ns+'use'):
        transform=element.get('transform','')
        nums=re.findall(r'-?[\d.]+',transform)
        if len(nums)==6 and 240<float(nums[4])<725 and 240<float(nums[5])<351:
            item=copy.deepcopy(element); item.set('fill',color); logo.append(item)
    ET.ElementTree(logo).write(out/f'logo-{theme}.svg',encoding='unicode')

for source,name in [('exec-2d97651c-1f0a-4a38-9f4e-2da7e03abbb2.png','asset-management'),('exec-f0ce1256-1ec0-416a-bab5-40e6ad06cc30.png','engineering')]:
    target=root/'public'/'images'/f'{name}.webp'
    if args.image_dir:
        image=Image.open(args.image_dir/source)
        image.save(target,quality=88)
    elif not target.exists():
        raise FileNotFoundError(f'{target} is missing. Supply --image-dir to create photographic assets.')

brief=(root/'doc'/'DRENIAK_SITE_BUILD_BRIEF.md').read_text(encoding='utf-8')
story=re.findall(r'^> (.+)',brief,re.M)[0]
values=[{'name':a,'text':b} for a,b in re.findall(r'^- \*\*([A-Z ]+)\*\* — (.+)$',brief,re.M)]
services=[]
for name,description,includes,value in re.findall(r'^\d\. \*\*(.+?)\*\* — (.+?) \*Includes:\* (.+?) \*\*Economic value: (.+?)\*\*',brief,re.M):
    services.append({'name':name,'description':description,'includes':includes.split('; '),'value':value})
sectors=[{'name':n,'description':d} for n,d in re.findall(r'^- \*\*(.+?)\*\* — (.+)$',brief.split('### 5.5')[1].split('### 5.6')[0],re.M)]
data={'story':story,'values':values,'services':services,'sectors':sectors,'mission':re.search(r'\*\*Mission:\*\* (.+)',brief)[1],'vision':re.search(r'\*\*Vision:\*\* (.+)',brief)[1]}
assert len(services)==6 and len(values)==5 and len(sectors)==8
dest=root/'src'/'content'; dest.mkdir(parents=True,exist_ok=True)
(dest/'brief.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print('Extracted exact vector mark, two logo lockups, four motifs, two WebP heroes, and verified source content.')
