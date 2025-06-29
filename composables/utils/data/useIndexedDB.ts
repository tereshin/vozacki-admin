import type { LanguageResource } from '~/types/languages'
import type { RoleResource } from '~/types/administrators'

const DB_NAME = 'VozackiAdminCache'
const DB_VERSION = 3
const LANGUAGES_STORE = 'languages'
const ROLES_STORE = 'roles'
const CACHE_META_STORE = 'cache_meta'

interface IndexedDBStore {
  languages: LanguageResource[]
  roles: RoleResource[]
}

interface CacheMeta {
  id: string
  lastUpdate: string
  version: string
}

export const useIndexedDB = () => {
  let db: IDBDatabase | null = null

  const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (db) {
        resolve(db)
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(request.error)
      }

      request.onsuccess = () => {
        db = request.result
        resolve(db)
      }

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result

        // Создаем хранилище для языков
        if (!database.objectStoreNames.contains(LANGUAGES_STORE)) {
          const languagesStore = database.createObjectStore(LANGUAGES_STORE, { keyPath: 'id' })
          languagesStore.createIndex('code', 'code', { unique: true })
        }

        // Создаем хранилище для ролей
        if (!database.objectStoreNames.contains(ROLES_STORE)) {
          const rolesStore = database.createObjectStore(ROLES_STORE, { keyPath: 'id' })
          rolesStore.createIndex('code', 'code', { unique: true })
        }

        // Создаем хранилище для метаданных кэша
        if (!database.objectStoreNames.contains(CACHE_META_STORE)) {
          database.createObjectStore(CACHE_META_STORE, { keyPath: 'id' })
        }
      }
    })
  }

  const saveLanguages = async (languages: LanguageResource[]): Promise<void> => {
    const database = await initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([LANGUAGES_STORE], 'readwrite')
      const store = transaction.objectStore(LANGUAGES_STORE)

      // Очищаем старые данные
      const clearRequest = store.clear()
      
      clearRequest.onsuccess = () => {
        // Добавляем новые данные
        languages.forEach((language) => {
          store.add(language)
        })
      }

      transaction.oncomplete = () => {
        resolve()
      }

      transaction.onerror = () => {
        reject(transaction.error)
      }
    })
  }

  const saveRoles = async (roles: RoleResource[]): Promise<void> => {
    const database = await initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([ROLES_STORE], 'readwrite')
      const store = transaction.objectStore(ROLES_STORE)

      // Очищаем старые данные
      const clearRequest = store.clear()
      
      clearRequest.onsuccess = () => {
        // Добавляем новые данные
        roles.forEach((role) => {
          store.add(role)
        })
      }

      transaction.oncomplete = () => {
        resolve()
      }

      transaction.onerror = () => {
        reject(transaction.error)
      }
    })
  }

  const getLanguages = async (): Promise<LanguageResource[]> => {
    const database = await initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([LANGUAGES_STORE], 'readonly')
      const store = transaction.objectStore(LANGUAGES_STORE)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  const getRoles = async (): Promise<RoleResource[]> => {
    const database = await initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([ROLES_STORE], 'readonly')
      const store = transaction.objectStore(ROLES_STORE)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  const getActiveLanguages = async (): Promise<LanguageResource[]> => {
    try {
      // Получаем все языки и фильтруем активные
      const allLanguages = await getLanguages()
      return allLanguages.filter(lang => lang.is_active === true)
    } catch (error) {
      throw error
    }
  }

  const saveCacheMeta = async (lastUpdate: Date): Promise<void> => {
    const database = await initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([CACHE_META_STORE], 'readwrite')
      const store = transaction.objectStore(CACHE_META_STORE)

      const meta: CacheMeta = {
        id: 'cache_info',
        lastUpdate: lastUpdate.toISOString(),
        version: '1.0'
      }

      const request = store.put(meta)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  const getCacheMeta = async (): Promise<Date | null> => {
    const database = await initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([CACHE_META_STORE], 'readonly')
      const store = transaction.objectStore(CACHE_META_STORE)
      const request = store.get('cache_info')

      request.onsuccess = () => {
        if (request.result) {
          resolve(new Date(request.result.lastUpdate))
        } else {
          resolve(null)
        }
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  const clearCache = async (): Promise<void> => {
    const database = await initDB()
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([LANGUAGES_STORE, ROLES_STORE, CACHE_META_STORE], 'readwrite')
      
      transaction.objectStore(LANGUAGES_STORE).clear()
      transaction.objectStore(ROLES_STORE).clear()
      transaction.objectStore(CACHE_META_STORE).clear()

      transaction.oncomplete = () => {
        resolve()
      }

      transaction.onerror = () => {
        reject(transaction.error)
      }
    })
  }

  return {
    initDB,
    saveLanguages,
    saveRoles,
    getLanguages,
    getRoles,
    getActiveLanguages,
    saveCacheMeta,
    getCacheMeta,
    clearCache
  }
} 