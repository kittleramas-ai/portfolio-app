const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assertsDir = path.join(__dirname, 'src', 'asserts');

const filesToOptimize = [
  { name: 'SSRG-WHITE.png', maxWidth: 256, maxHeight: 256 },
  { name: 'infodazz_white.png', maxWidth: 384, maxHeight: 128 },
  { name: 'kittle_white.png', maxWidth: 384, maxHeight: 128 },
  { name: 'signature-dark.png', maxWidth: 360, maxHeight: 100 },
  { name: 'signature-mark-dark.png', maxWidth: 360, maxHeight: 100 },
  { name: 'bni_icon.png', maxWidth: 128, maxHeight: 128 },
  { name: 'Elegant White Calligraphy Signature (1).png', maxWidth: 400, maxHeight: 150 },
  { name: 'heroimg.png', maxWidth: 800, maxHeight: 800 },
  { name: 'background-removed.png', maxWidth: 600, maxHeight: 800 },
];

async function run() {
  for (const item of filesToOptimize) {
    const filePath = path.join(assertsDir, item.name);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping missing ${item.name}`);
      continue;
    }
    const statBefore = fs.statSync(filePath);
    const buffer = await sharp(filePath)
      .resize({
        width: item.maxWidth,
        height: item.maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({ compressionLevel: 9, quality: 85, palette: true })
      .toBuffer();

    fs.writeFileSync(filePath, buffer);
    const statAfter = fs.statSync(filePath);
    console.log(
      `Optimized ${item.name}: ${(statBefore.size / 1024).toFixed(1)} KB -> ${(statAfter.size / 1024).toFixed(1)} KB`
    );
  }
}

run().catch(console.error);
