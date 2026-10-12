import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uploadsDir = join(__dirname, '..', 'public', 'uploads')

// Target dimensions based on Lighthouse report
const imageTargets = {
  'hero_portrait.png': { width: 300, height: 354, quality: 80 }, // displayed at 300x354
  'custom-8939fa4a-0336-4955-abb4-5cbc18c5a585.png': { width: 400, height: 300, quality: 80 },
  'custom-55e20d24-af10-4f80-bfcc-882eee07953c.png': { width: 48, height: 48, quality: 80 },
  'custom-f152092a-45f6-41fe-8f3e-2a2ddf0f494a.png': { width: 96, height: 32, quality: 80 },
  'custom-61d772b0-08db-4c8e-8975-92a5b0c3932c.png': { width: 800, height: 800, quality: 80 },
  'custom-8fcaa95b-79b1-498d-aa54-7c12a86af5de.jpg': { width: 800, height: 600, quality: 80 },
  'custom-642f7724-1af8-47c5-867b-16cad11b7a59.jpg': { width: 600, height: 450, quality: 80 },
  'custom-70b881f0-7f9b-4d00-9944-95c5674c549b.png': { width: 400, height: 300, quality: 80 },
  'custom-8939fa4a-0336-4955-abb4-5cbc18c5a585.png': { width: 400, height: 300, quality: 80 },
  'custom-4cdc310b-c4b9-466f-8084-395f7e5a931f.png': { width: 400, height: 300, quality: 80 },
  'custom-61f062ef-be59-4766-9595-03395bec498e.png': { width: 400, height: 300, quality: 80 },
  'custom-2c9c64fe-c16f-4681-bb6c-dd6b309edeaa.png': { width: 400, height: 300, quality: 80 },
  'custom-61f062ef-be59-4766-9595-03395bec498e.png': { width: 400, height: 300, quality: 80 },
  'whatsapp_icon.png': { width: 32, height: 32, quality: 80 },
  'favicon.png': { width: 32, height: 32, quality: 80 },
}

async function optimizeImages() {
  const files = await readdir(uploadsDir)
  
  for (const file of files) {
    const inputPath = join(uploadsDir, file)
    const stats = await stat(inputPath)
    
    if (!stats.isFile()) continue
    
    const ext = file.split('.').pop().toLowerCase()
    if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext)) continue
    
    const target = imageTargets[file]
    if (!target) {
      // Skip files without specific targets, but convert to webp anyway
      try {
        await sharp(inputPath)
          .webp({ quality: 85 })
          .toFile(inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp'))
        console.log(`Converted ${file} to WebP`)
      } catch (e) {
        console.error(`Failed to convert ${file}:`, e.message)
      }
      continue
    }
    
    try {
      // Create WebP version
      const webpPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp')
      await sharp(inputPath)
        .resize(target.width, target.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: target.quality })
        .toFile(webpPath)
      
      // Also create optimized original format
      await sharp(inputPath)
        .resize(target.width, target.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFile(inputPath + '.optimized')
      
      const origSize = (await stat(inputPath)).size
      const webpSize = (await stat(webpPath)).size
      const savings = ((origSize - webpSize) / origSize * 100).toFixed(1)
      
      console.log(`✓ ${file}: ${(origSize/1024).toFixed(1)}KB -> ${(webpSize/1024).toFixed(1)}KB (${savings}% savings) -> ${webpPath}`)
    } catch (e) {
      console.error(`Failed to optimize ${file}:`, e.message)
    }
  }
  
  console.log('\nOptimization complete!')
}

optimizeImages().catch(console.error)