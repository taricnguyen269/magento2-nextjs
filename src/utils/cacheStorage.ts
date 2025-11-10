import localforage from 'localforage';

/**
 * Storage adapter for Apollo Cache Persistor using IndexedDB (via localforage)
 * This provides better performance and storage capacity than localStorage
 */
export const cacheStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (typeof window === 'undefined') {
        return null;
      }
      const value = await localforage.getItem<string>(key);
      return value ? JSON.stringify(value) : null;
    } catch (error) {
      console.error('Error getting item from cache storage:', error);
      return null;
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      await localforage.setItem(key, JSON.parse(value));
    } catch (error) {
      console.error('Error setting item in cache storage:', error);
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      await localforage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from cache storage:', error);
    }
  }
};

/**
 * Cache persist prefix constant
 */
export const CACHE_PERSIST_PREFIX = 'apollo-cache-persist';

