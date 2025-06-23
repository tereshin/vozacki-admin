/**
 * Плагин для анализа загрузки бандлов в браузере
 * Показывает какие чанки загружаются для каждого раздела
 */

interface ChunkInfo {
  name: string;
  size: number;
  url: string;
  section: string;
}

interface BundleAnalytics {
  currentSection: string;
  loadedChunks: ChunkInfo[];
  totalSize: number;
  loadTime: number;
}

export default defineNuxtPlugin(() => {
  if (process.client) {
    const analytics: BundleAnalytics = {
      currentSection: '',
      loadedChunks: [],
      totalSize: 0,
      loadTime: 0
    };

    // Определяем текущий раздел по маршруту
    const router = useRouter();
    
    const getSectionFromRoute = (path: string): string => {
      if (path.includes('/login')) return 'login';
      if (path.includes('/dashboard')) return 'dashboard';
      if (path.includes('/articles')) return 'articles';
      if (path.includes('/tests')) return 'tests';
      return 'common';
    };

    // Отслеживаем загрузку ресурсов
    const trackResourceLoading = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes('.js') || entry.name.includes('.css')) {
            const resourceEntry = entry as PerformanceResourceTiming;
            const chunkInfo: ChunkInfo = {
              name: entry.name.split('/').pop() || '',
              size: resourceEntry.transferSize || 0,
              url: entry.name,
              section: analytics.currentSection
            };
            
            analytics.loadedChunks.push(chunkInfo);
            analytics.totalSize += chunkInfo.size;
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    };

    // Логирование информации о бандлах
    const logBundleInfo = () => {
      if (process.dev) {
        console.group(`📦 Bundle Analytics - ${analytics.currentSection}`);
        console.log(`Total chunks loaded: ${analytics.loadedChunks.length}`);
        console.log(`Total size: ${(analytics.totalSize / 1024).toFixed(2)} KB`);
        
        const sectionChunks = analytics.loadedChunks.filter(chunk => 
          chunk.name.includes(analytics.currentSection) || 
          chunk.name.includes(`${analytics.currentSection}-section`)
        );
        
        if (sectionChunks.length > 0) {
          console.log(`Section-specific chunks:`);
          sectionChunks.forEach(chunk => {
            console.log(`  - ${chunk.name}: ${(chunk.size / 1024).toFixed(2)} KB`);
          });
        }
        
        console.groupEnd();
      }
    };

    // Отслеживаем изменения маршрута
    router.afterEach((to) => {
      analytics.currentSection = getSectionFromRoute(to.path);
      
      // Небольшая задержка для загрузки чанков
      setTimeout(() => {
        logBundleInfo();
      }, 1000);
    });

    // Инициализация
    analytics.currentSection = getSectionFromRoute(router.currentRoute.value.path);
    trackResourceLoading();

    // Экспорт аналитики в глобальную область для отладки
    if (process.dev) {
      (window as any).__BUNDLE_ANALYTICS__ = analytics;
      console.log('Bundle analytics available at window.__BUNDLE_ANALYTICS__');
    }

    return {
      provide: {
        bundleAnalytics: analytics
      }
    };
  }
}); 