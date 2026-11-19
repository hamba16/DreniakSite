"""Build the Decoded SVG originals with Inter outlines and the existing logo."""
from pathlib import Path
from html import escape
import json
import re
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/brand/decoded'
OUT.mkdir(parents=True, exist_ok=True)
font = instantiateVariableFont(TTFont(ROOT / 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'), {'wght': 500})
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
units = font['head'].unitsPerEm
RED, INDIGO, WHITE, BLACK = '#991923', '#0d3251', '#ffffff', '#000000'
mark = json.loads((ROOT / 'public/brand/mark-path.json').read_text())

def text(value, x, y, size=28, color=INDIGO):
    cursor, paths = 0, []
    for character in value:
        name = cmap.get(ord(character), '.notdef')
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        paths.append(f'<path transform="translate({cursor} 0)" d="{pen.getCommands()}"/>')
        cursor += glyphs[name].width
    return f'<g aria-hidden="true" fill="{color}" transform="translate({x} {y}) scale({size / units} {-size / units})">{"".join(paths)}</g>'

def svg(name, w, h, title, desc, body):
    result = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-labelledby="{name}-title {name}-desc"><title id="{name}-title">{escape(title)}</title><desc id="{name}-desc">{escape(desc)}</desc>{body}</svg>'
    (OUT / f'{name}.svg').write_text(result, encoding='utf-8')
    return result

def dd(x=0, y=0, w=244, h=105, color=INDIGO):
    return f'<svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="0 0 244 105"><g fill="{color}"><path transform="translate(122 0) scale(-1 1)" d="{mark}"/><path transform="translate(122 0)" d="{mark}"/></g></svg>'

def primary(x, y, w, h, dark=False):
    logo = (ROOT / ('public/brand/logo-dark.svg' if dark else 'public/brand/logo-light.svg')).read_text()
    logo = re.sub(r'\s(?:width|height)="[^"]*"', '', logo, count=2)
    return logo.replace('<svg ', f'<svg data-primary="true" x="{x}" y="{y}" width="{w}" height="{h}" ', 1)

def descriptor(x, y, dark=False):
    color = WHITE if dark else INDIGO
    return f'<svg data-decoded="true" x="{x}" y="{y}" width="180" height="40" viewBox="0 0 180 40">{dd(0, 10, 42, 18, color)}{text("Decoded", 54, 29, 26, color)}</svg>'

svg('dd', 244, 105, 'Decoded monogram', 'Two reflected forms derived from the Dreniak mark, sharing a central spine.', dd())
svg('wordmark', 180, 40, 'Decoded', 'The Decoded descriptor, set in Dreniak’s Inter typeface.', descriptor(0, 0))
svg('lockup-horizontal', 640, 130, 'Dreniak Limited — Decoded', 'Dreniak Limited is the primary identity; Decoded is a smaller series descriptor.', primary(20, 24, 330, 80) + f'<path d="M380 40V90" stroke="{INDIGO}"/>' + descriptor(410, 45))
svg('lockup-stacked', 400, 210, 'Dreniak Limited — Decoded', 'Primary Dreniak logo above a smaller Decoded descriptor.', primary(20, 20, 360, 88) + descriptor(24, 140))
svg('issue-chip', 130, 40, 'Issue 01', 'Dreniak Decoded issue number 01.', f'<rect x="1" y="1" width="128" height="38" fill="{WHITE}" stroke="{INDIGO}"/>' + text('Issue 01', 19, 27, 20))
svg('section-divider', 680, 40, 'Section divider', 'A quiet rule with the Decoded monogram.', f'<path d="M0 20H290M390 20H680" stroke="{INDIGO}"/>' + dd(318, 10, 44, 19))
svg('stat-card', 1200, 630, 'Distribution loss rate: 16.7% to 18.1%', 'Distribution loss rate rose from 16.7% in 2024 to 18.1% in 2025, an increase of 1.4 percentage points.', f'<rect width="1200" height="630" fill="{INDIGO}"/>' + primary(48, 30, 330, 80, True) + descriptor(940, 50, True) + text('DISTRIBUTION LOSS RATE', 64, 188, 28, WHITE) + text('16.7%', 64, 330, 104, WHITE) + text('18.1%', 690, 330, 104, WHITE) + f'<path d="M470 292H610L590 272M610 292L590 312" stroke="{WHITE}" stroke-width="4" fill="none"/>' + text('2024', 64, 385, 30, WHITE) + text('2025', 690, 385, 30, WHITE) + f'<path d="M64 440H1136" stroke="{WHITE}"/>' + text('+1.4 percentage points', 64, 505, 40, WHITE) + text('Source: ERA distribution data; Dreniak calculations.', 64, 568, 23, WHITE))

chart = f'<rect width="1200" height="675" fill="{WHITE}"/>' + text('Electricity purchased and sold', 50, 65, 40) + text('Uganda · 2024–2025 · GWh', 50, 110, 26)
for index, (year, label, value, color) in enumerate([(2024, 'Purchased', 5815, INDIGO), (2024, 'Sold', 4846, RED), (2025, 'Purchased', 6630, INDIGO), (2025, 'Sold', 5430, RED)]):
    y = 165 + index * 96
    chart += text(f'{year}  {label}', 50, y + 35, 28) + f'<rect x="340" y="{y}" width="{value / 7000 * 650:.3f}" height="52" fill="{color}"/>' + text(f'{value:,}', 355 + value / 7000 * 650, y + 35, 26)
chart += f'<path d="M340 150V545H990" stroke="{INDIGO}" stroke-width="2"/>'
for value in [0, 3500, 7000]:
    x = 340 + value / 7000 * 650
    chart += f'<path d="M{x} 545v8" stroke="{INDIGO}"/>' + text(f'{value:,}', x - 10, 585, 23)
chart += text('Source: ERA distribution data. Volumes are rounded.', 50, 640, 23)
svg('energy-chart', 1200, 675, 'Electricity purchased and sold, 2024 and 2025', '2024: purchased 5,815 GWh and sold 4,846 GWh. 2025: purchased 6,630 GWh and sold 5,430 GWh. Bars start at zero on a common scale of 0 to 7,000 GWh.', chart)

decision = f'<rect width="680" height="270" fill="{WHITE}"/><g stroke="{INDIGO}" stroke-width="3" fill="none"><path d="M70 170V85L165 40L260 85V170ZM145 80h40v25h25v40h-25v25h-40v-25h-25v-40h25ZM420 95h190v75H420ZM410 95l20-40h170l20 40ZM480 100v70M550 100v70"/><path d="M340 35V240" stroke-dasharray="4 8"/></g>' + text('A · Health centre', 40, 230, 30) + text('B · Trading centre', 390, 230, 30)
svg('decision', 680, 270, 'Health centre or trading centre?', 'Option A: investigate health centre outages. Option B: investigate the trading centre’s purchased-versus-sold energy gap. The icons do not imply a preferred answer.', decision)
process = f'<rect width="680" height="190" fill="{WHITE}"/><path d="M85 62H595" stroke="{INDIGO}" stroke-width="2"/>'
for index, (x, label) in enumerate([(85, 'Map'), (340, 'Compare'), (595, 'Baseline')]):
    process += f'<circle cx="{x}" cy="62" r="28" fill="{INDIGO}"/>' + text(str(index + 1), x - 9, 72, 28, WHITE) + text(label, x - len(label) * 9, 140, 34)
svg('process', 680, 190, 'Map, Compare, Baseline', 'Map equipment and service records; compare causes and options; baseline outcomes before work starts.', process)
svg('email-header', 1200, 400, 'Dreniak Limited — Decoded, Issue 01', 'Dreniak Limited presents Decoded. Issue 01: After the connection.', f'<rect width="1200" height="400" fill="{INDIGO}"/>' + primary(48, 36, 420, 102, True) + descriptor(62, 164, True) + text('After the connection', 62, 300, 52, WHITE) + text('Issue 01', 62, 354, 26, WHITE))
(OUT / 'chart-tokens.json').write_text(json.dumps({'font': 'Inter', 'axis': INDIGO, 'barPurchased': INDIGO, 'barSold': RED, 'label': INDIGO, 'surface': WHITE, 'scale': {'min': 0, 'max': 7000, 'unit': 'GWh'}}, indent=2) + '\n')
print(f'Built {len(list(OUT.glob("*.svg")))} SVG originals using Inter outlines.')
