/**
 * Gera `assets/splash-icon.png` a partir de `assets/splash-estou-vivo-static.svg`
 * (splash nativa Expo alinhada ao ecrã Cloudive em JS).
 *
 * Uso: npm run splash:cloudive
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'assets', 'splash-estou-vivo-static.svg');
const outPath = path.join(root, 'assets', 'splash-icon.png');

const svg = fs.readFileSync(svgPath);

sharp(svg, { density: 300 })
  .resize(1024, 1024)
  .png()
  .toFile(outPath)
  .then(() => {
    console.log('OK:', outPath);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
