# Adding Character Images

To replace the placeholder images with actual character images:

1. Add your character images to the `images/` folder with these exact filenames:
   - `rand.jpg` - Rand al'Thor
   - `perrin.jpg` - Perrin Aybara
   - `mat.jpg` - Mat Cauthon
   - `egwene.jpg` - Egwene al'Vere
   - `nynaeve.jpg` - Nynaeve al'Meara
   - `moiraine.jpg` - Moiraine Damodred
   - `lan.jpg` - Lan Mandragoran
   - `thom.jpg` - Thom Merrilin
   - `elayne.jpg` - Elayne Trakand
   - `aviendha.jpg` - Aviendha

2. Supported formats: `.jpg`, `.png`, `.jpeg`, `.gif`

3. Recommended image size: 80x80 pixels (square images work best)

4. The visualization will automatically fall back to colored placeholder images if the local images are not found.

## Tips:
- Use square images for best results
- Images will be automatically cropped to fit the circular nodes
- If you want to change the image filenames, update the `characterImages` object in `index.js`
