import { imagePresets, getOptimizedImageUrl, optimizeExistingUrl } from '../lib/imageBuilder';

/**
 * Тестовый файл для демонстрации оптимизации изображений
 * 
 * Запуск: не требуется, это примеры кода
 */

// Пример Sanity image reference
const sampleImageRef = {
  _type: 'image',
  asset: {
    _ref: 'image-abc123-1920x1080-jpg',
    _type: 'reference',
  },
  alt: 'Sample artwork',
};

// Пример полного объекта с URL
const sampleImageWithUrl = {
  _type: 'image',
  asset: {
    _id: 'image-abc123-1920x1080-jpg',
    _type: 'sanity.imageAsset',
    url: 'https://cdn.sanity.io/images/o1yl0ri9/blog/abc123-1920x1080.jpg',
  },
  alt: 'Sample artwork',
};

// ============================================
// ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
// ============================================

console.log('=== IMAGE OPTIMIZATION EXAMPLES ===\n');

// 1. Использование готовых пресетов
console.log('1. ГОТОВЫЕ ПРЕСЕТЫ:');
console.log('Hero (1600px, quality 85):', imagePresets.hero(sampleImageRef));
console.log('Card (600px, quality 80):', imagePresets.card(sampleImageRef));
console.log('Thumbnail (400px, quality 75):', imagePresets.thumbnail(sampleImageRef));
console.log('Avatar (200x200 crop, quality 80):', imagePresets.avatar(sampleImageRef));
console.log('Logo (300px PNG, quality 90):', imagePresets.logo(sampleImageRef));
console.log('Content (1200px, quality 82):', imagePresets.content(sampleImageRef));
console.log('');

// 2. Кастомная оптимизация
console.log('2. КАСТОМНАЯ ОПТИМИЗАЦИЯ:');
const customOptimized = getOptimizedImageUrl(sampleImageRef, {
  width: 800,
  height: 600,
  quality: 70,
  format: 'jpg',
  fit: 'crop',
});
console.log('Custom 800x600 crop:', customOptimized);
console.log('');

// 3. Оптимизация существующего URL
console.log('3. ОПТИМИЗАЦИЯ СУЩЕСТВУЮЩЕГО URL:');
const existingUrl = 'https://cdn.sanity.io/images/o1yl0ri9/blog/abc123-1920x1080.jpg';
const optimized = optimizeExistingUrl(existingUrl, {
  width: 1000,
  quality: 75,
  format: 'webp',
});
console.log('До:', existingUrl);
console.log('После:', optimized);
console.log('');

// ============================================
// СРАВНЕНИЕ РАЗМЕРОВ
// ============================================

console.log('=== COMPARISON: BEFORE vs AFTER ===\n');

interface ImageComparison {
  scenario: string;
  before: {
    size: string;
    format: string;
    url: string;
  };
  after: {
    size: string;
    format: string;
    url: string;
  };
  savings: string;
}

const comparisons: ImageComparison[] = [
  {
    scenario: 'Review main image',
    before: {
      size: '~5-8 MB',
      format: 'Original JPEG',
      url: 'review.mainImage?.asset?.url',
    },
    after: {
      size: '~150-300 KB',
      format: 'WebP (quality 80)',
      url: 'imagePresets.hero(review.mainImage)',
    },
    savings: '~95%',
  },
  {
    scenario: 'Card thumbnail',
    before: {
      size: '~3-5 MB',
      format: 'Original JPEG',
      url: 'guide.coverImage?.asset?.url',
    },
    after: {
      size: '~50-100 KB',
      format: 'WebP (quality 80, 600px)',
      url: 'imagePresets.card(guide.coverImage)',
    },
    savings: '~97%',
  },
  {
    scenario: 'Author avatar',
    before: {
      size: '~2-4 MB',
      format: 'Original JPEG',
      url: 'author.photo?.asset?.url',
    },
    after: {
      size: '~10-20 KB',
      format: 'WebP (quality 80, 200x200 crop)',
      url: 'imagePresets.avatar(author.photo)',
    },
    savings: '~99%',
  },
  {
    scenario: 'Content image',
    before: {
      size: '~4-6 MB',
      format: 'Original JPEG',
      url: 'block.asset?.url',
    },
    after: {
      size: '~100-200 KB',
      format: 'WebP (quality 82, 1200px)',
      url: 'imagePresets.content(block)',
    },
    savings: '~96%',
  },
];

comparisons.forEach((comp) => {
  console.log(`📊 ${comp.scenario}`);
  console.log(`   До:    ${comp.before.size.padEnd(15)} ${comp.before.format}`);
  console.log(`          ${comp.before.url}`);
  console.log(`   После: ${comp.after.size.padEnd(15)} ${comp.after.format}`);
  console.log(`          ${comp.after.url}`);
  console.log(`   💰 Экономия: ${comp.savings}`);
  console.log('');
});

// ============================================
// РЕКОМЕНДАЦИИ
// ============================================

console.log('=== BEST PRACTICES ===\n');

const bestPractices = [
  '✅ Всегда используйте imagePresets вместо прямого asset.url',
  '✅ WebP для всех изображений (кроме логотипов с прозрачностью)',
  '✅ PNG только для логотипов и иконок с прозрачностью',
  '✅ Quality 75-85 для оптимального баланса',
  '✅ Crop для аватаров и квадратных изображений',
  '✅ Max fit для сохранения пропорций',
  '✅ Responsive srcSet для адаптивных изображений',
];

bestPractices.forEach((practice) => console.log(practice));

export {};
