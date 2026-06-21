const memory = new Map<string, string>();

export default {
  async getItem(key: string): Promise<string | null> {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return memory.get(key) ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
      return;
    }
    memory.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
      return;
    }
    memory.delete(key);
  },
};
