/**
 * Конфигурация для разделения webpack бандлов по разделам приложения
 * Используется в nuxt.config.ts для создания отдельных чанков для каждого раздела
 */

export const webpackChunksConfig = {
  // Основные разделы приложения
  sections: {
    login: {
      name: 'login-section',
      includes: [
        'pages/login.vue',
        'components/login/',
        'layouts/login.vue'
      ],
      priority: 30
    },
    dashboard: {
      name: 'dashboard-section',
      includes: [
        'pages/dashboard.vue',
        'components/dashboard/'
      ],
      priority: 30
    },
    articles: {
      name: 'articles-section',
      includes: [
        'pages/articles.vue',
        'components/articles/',
        'composables/api/useArticlesApi.ts',
        'store/articles.ts',
        'types/articles.ts'
      ],
      priority: 30
    },
    tests: {
      name: 'tests-section',
      includes: [
        'pages/tests.vue',
        'components/tests/',
        'composables/api/useTestsApi.ts',
        'composables/api/useQuestionsApi.ts',
        'composables/api/useAnswersApi.ts',
        'store/tests.ts',
        'store/questions.ts',
        'store/answers.ts',
        'types/tests.ts',
        'types/questions.ts',
        'types/answers.ts'
      ],
      priority: 30
    }
  },

  // Вендорные библиотеки
  vendors: {
    primevue: {
      name: 'vendor-primevue',
      test: /[\\/]node_modules[\\/](@primevue|primevue)/,
      priority: 20
    },
    supabase: {
      name: 'vendor-supabase',
      test: /[\\/]node_modules[\\/]@supabase/,
      priority: 20
    },
    ui: {
      name: 'vendor-ui',
      test: /[\\/]node_modules[\\/](vue|@vue|nuxt|@nuxt)/,
      priority: 15
    }
  },

  // Общие компоненты и утилиты
  shared: {
    base: {
      name: 'base-components',
      test: /[\\/]components[\\/]base[\\/]/,
      priority: 10
    },
    composables: {
      name: 'shared-composables',
      test: /[\\/]composables[\\/](?!(api[\\/](useArticlesApi|useTestsApi|useQuestionsApi|useAnswersApi)))/,
      priority: 10
    },
    store: {
      name: 'shared-store',
      test: /[\\/]store[\\/](?!(articles|tests|questions|answers)\.ts)/,
      priority: 10
    }
  }
};

/**
 * Функция для создания манифеста chunks для отладки
 */
export function createChunksManifest() {
  return {
    sections: Object.keys(webpackChunksConfig.sections),
    vendors: Object.keys(webpackChunksConfig.vendors),
    shared: Object.keys(webpackChunksConfig.shared),
    totalChunks: Object.keys(webpackChunksConfig.sections).length + 
                  Object.keys(webpackChunksConfig.vendors).length + 
                  Object.keys(webpackChunksConfig.shared).length
  };
}

/**
 * Функция для получения регулярного выражения для раздела
 */
export function getSectionRegex(sectionName) {
  const section = webpackChunksConfig.sections[sectionName];
  if (!section) return null;
  
  const patterns = section.includes.map(path => 
    path.replace(/\//g, '[\\\\/]').replace(/\./g, '\\.')
  );
  
  return new RegExp(`[\\\\/](${patterns.join('|')})`);
}

export default webpackChunksConfig; 