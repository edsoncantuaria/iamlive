/**
 * Gera os PNG referenciados em app.json a partir de `assets/app-icon-source.svg`.
 * Sem estes ficheiros, o EAS/prebuild pode gerar ícone preto ou placeholder.
 *
 * Uso: npm run icons:export
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'assets', 'app-icon-source.svg');
const svg = fs.readFileSync(svgPath);

const density = 300;

async function write1024(name) {
  const out = path.join(root, 'assets', name);
  await sharp(svg, { density })
    .resize(1024, 1024)
    .png()
    .toFile(out);
  console.log('OK:', out);
}

async function main() {
  await write1024('icon.png');
  await write1024('adaptive-icon.png');
  await sharp(svg, { density })
    .resize(48, 48)
    .png()
    .toFile(path.join(root, 'assets', 'favicon.png'));
  console.log('OK:', path.join(root, 'assets', 'favicon.png'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
