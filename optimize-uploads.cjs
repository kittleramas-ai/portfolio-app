const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'public', 'uploads');

async function runUploads() {
  if (!fs.existsSync(uploadsDir)) return;
  const files = fs.readdirSync(uploadsDir);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') continue;
    const filePath = path.join(uploadsDir, file);
    const statBefore = fs.statSync(filePath);
    if (statBefore.size < 30000) continue; // Skip already small files (< 30 KB)

    try {
      let pipeline = sharp(filePath).resize({
        width: 800,
        height: 800,
        fit: 'inside',
        withoutEnlargement: true,
      });

      let buffer;
      if (ext === '.png') {
        buffer = await pipeline.png({ compressionLevel: 9, quality: 85, palette: true }).toBuffer();
      } else {
        buffer = await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
      }

      const tmpPath = filePath + '.tmp';
      fs.writeFileSync(tmpPath, buffer);
      fs.renameSync(tmpPath, filePath);
      const statAfter = fs.statSync(filePath);
      console.log(
        `Optimized Upload ${file}: ${(statBefore.size / 1024).toFixed(1)} KB -> ${(statAfter.size / 1024).toFixed(1)} KB`
      );
    } catch (err) {
      console.error(`Failed ${file}: ${err.message}`);
    }
  }
}

runUploads().catch(console.error);
