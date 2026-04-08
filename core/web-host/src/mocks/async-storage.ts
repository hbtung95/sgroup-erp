/**
 * AsyncStorage mock for web — uses localStorage
 * Drop-in replacement for @react-native-async-storage/async-storage
 */
const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  },
  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch {
      // Silently fail
    }
  },
  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(localStorage);
    } catch {
      return [];
    }
  },
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    return keys.map(key => [key, localStorage.getItem(key)]);
  },
  async multiSet(pairs: [string, string][]): Promise<void> {
    pairs.forEach(([key, value]) => localStorage.setItem(key, value));
  },
  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach(key => localStorage.removeItem(key));
  },
};

export default AsyncStorage;
