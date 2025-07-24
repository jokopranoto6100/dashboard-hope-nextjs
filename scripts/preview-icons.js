const fs = require('fs');
const path = require('path');

const iconDir = path.join(__dirname, '../public/icon');

console.log('📱 PWA Icons Generated:');
console.log('='.repeat(50));

if (fs.existsSync(iconDir)) {
  const files = fs.readdirSync(iconDir).filter(file => file.endsWith('.png'));
  
  files.forEach(file => {
    const filePath = path.join(iconDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    
    if (file === 'hope.png') {
      console.log(`🎯 ${file.padEnd(20)} - ${sizeKB}KB (Base Icon - Atom Symbol)`);
    } else {
      const size = file.match(/(\d+)x(\d+)/);
      if (size) {
        console.log(`⚛️  ${file.padEnd(20)} - ${sizeKB}KB (${size[1]}x${size[2]}px)`);
      }
    }
  });
  
  console.log('='.repeat(50));
  console.log(`✅ Total: ${files.length} icon files generated`);
  console.log('🎨 Design: Atom symbol from Lucide with #059669 color');
  console.log('🌟 All icons ready for PWA installation!');
} else {
  console.log('❌ Icon directory not found. Run "npm run gen:icons" first.');
}

console.log('\n🔗 Test your PWA at: http://localhost:3000');
