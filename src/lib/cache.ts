export class TTLCache<T> {
  private cache = new Map<string, { data: T; expires: number }>();

  constructor(private maxSize = 500) {}

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data;
  }

  set(key: string, data: T, ttlMs: number): void {
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(key, { data, expires: Date.now() + ttlMs });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiCache = new TTLCache<any>(500);

export async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const hit = apiCache.get(key) as T | undefined;
  if (hit !== undefined) {
    console.log(`[cache] HIT ${key}`);
    return hit;
  }
  console.log(`[cache] MISS ${key}`);
  const data = await fn();
  apiCache.set(key, data, ttlMs);
  return data;
}
