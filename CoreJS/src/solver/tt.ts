export type TTFlag = 'EXACT' | 'LOWER' | 'UPPER';

export type TTEntry = {
  key: bigint;
  depth: number;
  score: number;
  flag: TTFlag;
  best?: string;
};

class TranspositionTable {
  private map: Map<bigint, TTEntry> = new Map();
  constructor(private maxEntries = 1 << 18) {}

  probe(key: bigint): TTEntry | undefined {
    return this.map.get(key);
  }

  store(key: bigint, entry: TTEntry) {
    if (this.map.size >= this.maxEntries) {
      // Evict a small fraction (1%) of the oldest entries to avoid
      // clearing the whole table at once and to keep some locality.
      const toRemove = Math.max(1, Math.floor(this.maxEntries * 0.01));
      for (let i = 0; i < toRemove; i++) {
        const it = this.map.keys().next();
        if (it.done) break;
        this.map.delete(it.value);
      }
    }
    this.map.set(key, entry);
  }

  setMaxEntries(n: number) {
    this.maxEntries = n;
    while (this.map.size > this.maxEntries) {
      const it = this.map.keys().next();
      if (it.done) break;
      this.map.delete(it.value);
    }
  }

  clear() { this.map.clear(); }
}

export const TT = new TranspositionTable();

export default TT;
