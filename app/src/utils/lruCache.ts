export class LruCache<Key, Value> {
  private readonly entries = new Map<Key, Value>();

  constructor(private readonly maxEntries: number) {}

  get(key: Key): Value | undefined {
    if (!this.entries.has(key)) {
      return undefined;
    }

    const value = this.entries.get(key) as Value;
    this.entries.delete(key);
    this.entries.set(key, value);
    return value;
  }

  has(key: Key): boolean {
    return this.entries.has(key);
  }

  set(key: Key, value: Value) {
    if (this.maxEntries <= 0) {
      return;
    }

    if (this.entries.has(key)) {
      this.entries.delete(key);
    }

    this.entries.set(key, value);

    while (this.entries.size > this.maxEntries) {
      const oldestEntry = this.entries.keys().next();

      if (oldestEntry.done) {
        return;
      }

      this.entries.delete(oldestEntry.value);
    }
  }

  clear() {
    this.entries.clear();
  }
}
