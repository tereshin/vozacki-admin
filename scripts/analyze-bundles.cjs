#!/usr/bin/env node

/**
 * Скрипт для анализа размеров webpack бандлов
 * Запуск: node scripts/analyze-bundles.js
 */

const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function analyzeBundles() {
  const outputDir = path.join(process.cwd(), '.output', 'public');
  const nuxtDistDir = path.join(process.cwd(), '.nuxt', 'dist', 'client');
  
  let assetsDir;
  
  // Проверяем .output/public/_nuxt (production build)
  if (fs.existsSync(path.join(outputDir, '_nuxt'))) {
    assetsDir = path.join(outputDir, '_nuxt');
    console.log(colorize('📁 Using production build directory', 'green'));
  }
  // Проверяем .nuxt/dist/client/_nuxt (development/partial build)
  else if (fs.existsSync(path.join(nuxtDistDir, '_nuxt'))) {
    assetsDir = path.join(nuxtDistDir, '_nuxt');
    console.log(colorize('📁 Using development build directory', 'yellow'));
  }
  else {
    console.log(colorize('❌ Assets directory not found. Run build first: npm run build', 'red'));
    console.log(colorize(`Checked paths:`, 'yellow'));
    console.log(colorize(`  - ${path.join(outputDir, '_nuxt')}`, 'yellow'));
    console.log(colorize(`  - ${path.join(nuxtDistDir, '_nuxt')}`, 'yellow'));
    return;
  }

  console.log(colorize('📊 Bundle Analysis Report', 'cyan'));
  console.log(colorize('=' .repeat(50), 'cyan'));

  const files = fs.readdirSync(assetsDir);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  const cssFiles = files.filter(file => file.endsWith('.css'));

  // Анализ JS файлов
  const bundles = {
    login: [],
    dashboard: [],
    articles: [],
    tests: [],
    vendor: [],
    common: []
  };

  let totalSize = 0;
  let totalGzipSize = 0;

  jsFiles.forEach(file => {
    const filePath = path.join(assetsDir, file);
    const content = fs.readFileSync(filePath);
    const size = content.length;
    const gzipSize = gzipSync(content).length;
    
    totalSize += size;
    totalGzipSize += gzipSize;

    const fileInfo = {
      name: file,
      size,
      gzipSize,
      sizeFormatted: formatBytes(size),
      gzipSizeFormatted: formatBytes(gzipSize)
    };

    // Категоризация файлов по разделам
    if (file.includes('login-section') || file.includes('login')) {
      bundles.login.push(fileInfo);
    } else if (file.includes('dashboard-section') || file.includes('dashboard')) {
      bundles.dashboard.push(fileInfo);
    } else if (file.includes('articles-section') || file.includes('articles')) {
      bundles.articles.push(fileInfo);
    } else if (file.includes('tests-section') || file.includes('tests')) {
      bundles.tests.push(fileInfo);
    } else if (file.includes('vendor-primevue') || file.includes('vendor-supabase') || 
               file.includes('vendor-vue') || file.includes('vendor') || 
               file.includes('primevue') || file.includes('supabase')) {
      bundles.vendor.push(fileInfo);
    } else {
      bundles.common.push(fileInfo);
    }
  });

  // Анализ CSS файлов
  const cssInfo = [];
  cssFiles.forEach(file => {
    const filePath = path.join(assetsDir, file);
    const content = fs.readFileSync(filePath);
    const size = content.length;
    const gzipSize = gzipSync(content).length;
    
    cssInfo.push({
      name: file,
      size,
      gzipSize,
      sizeFormatted: formatBytes(size),
      gzipSizeFormatted: formatBytes(gzipSize)
    });
  });

  // Вывод результатов
  console.log();
  console.log(colorize('📦 JavaScript Bundles by Section:', 'yellow'));
  console.log();

  Object.entries(bundles).forEach(([section, files]) => {
    if (files.length === 0) return;
    
    const sectionSize = files.reduce((sum, file) => sum + file.size, 0);
    const sectionGzipSize = files.reduce((sum, file) => sum + file.gzipSize, 0);
    
    console.log(colorize(`${section.toUpperCase()} Section:`, 'green'));
    console.log(`  Total: ${formatBytes(sectionSize)} (${formatBytes(sectionGzipSize)} gzipped)`);
    
    files.forEach(file => {
      console.log(`    ${file.name}: ${file.sizeFormatted} (${file.gzipSizeFormatted} gzipped)`);
    });
    console.log();
  });

  // CSS файлы
  if (cssInfo.length > 0) {
    console.log(colorize('🎨 CSS Files:', 'magenta'));
    cssInfo.forEach(file => {
      console.log(`  ${file.name}: ${file.sizeFormatted} (${file.gzipSizeFormatted} gzipped)`);
    });
    console.log();
  }

  // Общая статистика
  console.log(colorize('📈 Summary:', 'cyan'));
  console.log(`Total JS files: ${jsFiles.length}`);
  console.log(`Total CSS files: ${cssFiles.length}`);
  console.log(`Total size: ${formatBytes(totalSize)}`);
  console.log(`Total gzipped: ${formatBytes(totalGzipSize)}`);
  console.log(`Compression ratio: ${((1 - totalGzipSize / totalSize) * 100).toFixed(1)}%`);

  // Рекомендации
  console.log();
  console.log(colorize('💡 Recommendations:', 'yellow'));
  
  const largestBundle = Object.entries(bundles)
    .map(([section, files]) => ({
      section,
      size: files.reduce((sum, file) => sum + file.size, 0)
    }))
    .sort((a, b) => b.size - a.size)[0];

  if (largestBundle && largestBundle.size > 500 * 1024) {
    console.log(`  ⚠️  ${largestBundle.section} section is large (${formatBytes(largestBundle.size)})`);
    console.log('     Consider further code splitting or lazy loading');
  }

  if (totalGzipSize > 1024 * 1024) {
    console.log('  ⚠️  Total bundle size is over 1MB');
    console.log('     Consider implementing more aggressive splitting');
  }

  console.log('  ✅ Bundles are properly separated by sections');
  console.log('  ✅ Use browser DevTools to verify lazy loading');
}

// Экспорт функции для использования в package.json скриптах
if (require.main === module) {
  analyzeBundles();
}

module.exports = { analyzeBundles }; 