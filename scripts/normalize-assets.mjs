import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const assetDir = path.join(rootDir, 'asset');
const publicDir = path.join(rootDir, 'public');
const imagesDir = path.join(publicDir, 'images');

const chapters = [
  { folderName: 'เกาะเกร็ด', targetDir: 'ch1-kohkret', name: 'เกาะเกร็ด' },
  { folderName: 'ทรงวาด', targetDir: 'ch2-songwat', name: 'ทรงวาด' },
  { folderName: 'ตลาดน้อย', targetDir: 'ch3-taladnoi', name: 'ตลาดน้อย' },
  { folderName: 'สวนลุมพินี', targetDir: 'ch4-lumphini', name: 'สวนลุมพินี' },
  { folderName: 'คาเฟ่นายปาร์คเลิศ', targetDir: 'ch5-nailert', name: 'คาเฟ่นายปาร์คเลิศ' },
  { folderName: 'The Lake Club เมืองทอง', targetDir: 'ch6-lakeclub', name: 'The Lake Club เมืองทอง' },
  { folderName: 'พัทยา', targetDir: 'ch7-pattaya', name: 'พัทยา' },
];

console.log('🚀 Starting asset normalization...');

if (!fs.existsSync(assetDir)) {
  console.error('❌ asset/ folder not found!');
  process.exit(1);
}

fs.mkdirSync(imagesDir, { recursive: true });

chapters.forEach((ch, index) => {
  const srcFolderPath = path.join(assetDir, ch.folderName);
  const destFolderPath = path.join(imagesDir, ch.targetDir);

  if (!fs.existsSync(srcFolderPath)) {
    console.warn(`⚠️ Folder not found: ${ch.folderName}`);
    return;
  }

  fs.mkdirSync(destFolderPath, { recursive: true });

  const files = fs.readdirSync(srcFolderPath).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  console.log(`📁 Chapter ${index + 1}: ${ch.name} — Found ${files.length} images`);

  files.forEach((file, fileIdx) => {
    const srcFile = path.join(srcFolderPath, file);
    const ext = path.extname(file).toLowerCase();
    
    // Assign systematic names: photo-1, photo-2, photo-3, polaroid
    let targetFileName;
    if (fileIdx === 3) {
      targetFileName = `polaroid${ext}`;
    } else {
      targetFileName = `photo-${fileIdx + 1}${ext}`;
    }

    const destFile = path.join(destFolderPath, targetFileName);
    fs.copyFileSync(srcFile, destFile);
    console.log(`  └─ Copied: ${file} ➔ ${ch.targetDir}/${targetFileName}`);
  });
});

// Ensure public/audio directory exists
const audioDir = path.join(publicDir, 'audio');
fs.mkdirSync(audioDir, { recursive: true });

console.log('✅ Asset normalization completed successfully!');
