const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG icon Atom dari Lucide (https://lucide.dev/icons/atom) - Optimized for PWA
const atomIconSVG = `
<svg width="512" height="512" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Central nucleus -->
  <circle cx="12" cy="12" r="1.5" fill="#059669"/>
  
  <!-- Electron orbits -->
  <ellipse cx="12" cy="12" rx="10.5" ry="4.5" stroke="#059669" stroke-width="1.5" fill="none"/>
  <ellipse cx="12" cy="12" rx="10.5" ry="4.5" stroke="#059669" stroke-width="1.5" fill="none" transform="rotate(60 12 12)"/>
  <ellipse cx="12" cy="12" rx="10.5" ry="4.5" stroke="#059669" stroke-width="1.5" fill="none" transform="rotate(120 12 12)"/>
  
  <!-- Electron particles -->
  <circle cx="22" cy="12" r="1" fill="#059669"/>
  <circle cx="2" cy="12" r="1" fill="#059669"/>
  <circle cx="12" cy="2" r="1" fill="#059669"/>
  <circle cx="12" cy="22" r="1" fill="#059669"/>
  <circle cx="18.4" cy="6.4" r="1" fill="#059669"/>
  <circle cx="5.6" cy="17.6" r="1" fill="#059669"/>
</svg>
`.trim();

// Ukuran icon yang dibutuhkan untuk PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

const outputDir = path.join(__dirname, '../public/icon');

async function generateIcons() {
  console.log('🎨 Generating PWA icons with Atom symbol...');
  
  // Pastikan direktori output ada
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    console.log('📁 Output directory:', outputDir);
    console.log('⚛️ Using Atom icon from Lucide');

    // Generate setiap ukuran dari SVG
    for (const icon of iconSizes) {
      const outputPath = path.join(outputDir, icon.name);
      
      // Create SVG buffer dengan ukuran yang disesuaikan
      const scaledSVG = atomIconSVG.replace('width="512" height="512"', `width="${icon.size}" height="${icon.size}"`);
      
      await sharp(Buffer.from(scaledSVG))
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);
        
      console.log(`✅ Generated: ${icon.name} (${icon.size}x${icon.size})`);
    }

    // Generate juga base icon hope.png
    const baseIconPath = path.join(outputDir, 'hope.png');
    const baseSVG = atomIconSVG.replace('width="512" height="512"', 'width="512" height="512"');
    
    await sharp(Buffer.from(baseSVG))
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(baseIconPath);
      
    console.log(`✅ Generated: hope.png (512x512) - Base icon`);

    console.log('🎉 Semua icon PWA berhasil di-generate dengan Atom symbol!');
    console.log('\n📱 Icons yang di-generate:');
    console.log(`   - hope.png (512x512px) - Base icon`);
    iconSizes.forEach(icon => {
      console.log(`   - ${icon.name} (${icon.size}x${icon.size}px)`);
    });

  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

// Jalankan function
generateIcons();
