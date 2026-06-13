const Storage = {
  get(key: string) {
    if (typeof window !== "undefined") {
       const item = localStorage.getItem(key);
       return item ? (JSON.parse(item)) : null;
    }
  },
  set(key: string, value: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
  remove(key: string) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  },
  clear() {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  },
};

export default Storage;
