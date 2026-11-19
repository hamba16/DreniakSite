# Image generation record
Built-in imagegen; two calls, zero retries. Original plates retained in assets/images/decoded-01/.

1. Hero prompt: “Use case: photorealistic-natural. Create an image plate only, wide 16:9. Late afternoon in a Ugandan trading centre, a pole-mounted distribution transformer and overhead lines in the foreground, red earth road, low warm light, natural colour, realistic documentary style, no people, no text, no logos, wide 16:9 composition with open sky on the left for text overlay. No lettering, shop signs, watermarks, branding, marks or UI anywhere. This is an illustrative scene, not a real project record.”
2. Research prompt: “Use case: stylized-concept. Asset: a quiet abstract research-brief header background plate, wide 16:9. A sparse electrical network geometry of branching feeders, fine lines and small nodes, a grid fading into dusk. Restrained Dreniak palette: deep indigo #0d3251 background, white network lines fading in intensity and a few restrained business red #991923 nodes. Spacious and calm, with most detail towards the right, gentle grain and subtle depth. No people. No text, letters, numbers, logos, marks, signage or UI. Imagery only.”

Visual inspection of both generated plates found no text, logos, marks, UI or people. This is a visual assessment, not an OCR guarantee. All typography and branding in derivatives are composed from SVG after generation.
The original hero is an illustration of a Ugandan setting, not verified documentary photography or a Dreniak project record.
Natural image colours and tonal variation in the generated plates are not UI palette tokens.
Sharp already ships with Next; no package dependencies were added. Existing Python fontTools outlines the installed Inter font for SVG portability.
Run `node scripts/export-decoded-assets.mjs` to reproduce all nine raster derivatives and their dimension/alt manifest.
