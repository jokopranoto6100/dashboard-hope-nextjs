const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG icon Atom dengan background dan padding yang optimal untuk PWA
const atomIconSVG = `
<svg width="512" height="512" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle dengan gradient subtle -->
  <circle cx="24" cy="24" r="22" fill="url(#bgGradient)" stroke="#059669" stroke-width="0.5"/>
  
  <!-- Gradient definition -->
  <defs>
    <radialGradient id="bgGradient" cx="0.3" cy="0.3">
      <stop offset="0%" stop-color="#ecfdf5"/>
      <stop offset="100%" stop-color="#f0fdf4"/>
    </radialGradient>
  </defs>
  
  <!-- Central nucleus -->
  <circle cx="24" cy="24" r="2.2" fill="#059669"/>
  
  <!-- Electron orbits -->
  <ellipse cx="24" cy="24" rx="14" ry="6" stroke="#059669" stroke-width="2" fill="none"/>
  <ellipse cx="24" cy="24" rx="14" ry="6" stroke="#059669" stroke-width="2" fill="none" transform="rotate(60 24 24)"/>
  <ellipse cx="24" cy="24" rx="14" ry="6" stroke="#059669" stroke-width="2" fill="none" transform="rotate(120 24 24)"/>
  
  <!-- Electron particles -->
  <circle cx="38" cy="24" r="1.5" fill="#059669"/>
  <circle cx="10" cy="24" r="1.5" fill="#059669"/>
  <circle cx="24" cy="10" r="1.5" fill="#059669"/>
  <circle cx="24" cy="38" r="1.5" fill="#059669"/>
  <circle cx="32" cy="15" r="1.5" fill="#059669"/>
  <circle cx="16" cy="33" r="1.5" fill="#059669"/>
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
