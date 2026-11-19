import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { UserPrefs } from '@/lib/poi/types';

interface SafeNearDB extends DBSchema {
  prefs: {
    key: string;
    value: UserPrefs;
  };
  reports: {
    key: string;
    value: import('@/lib/poi/types').IncidentReport;
    indexes: { 'by-date': string };
  };
  bundles: {
    key: string;
    value: import('@/lib/poi/types').PoiBundle;
  };
  evidence: {
    key: string;
    value: { key: string; data: ArrayBuffer; mime: string; createdAt: string };
  };
  corrections: {
    key: string;
    value: import('@/lib/poi/types').PlaceCorrection;
  };
}

let dbPromise: Promise<IDBPDatabase<SafeNearDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<SafeNearDB>('safe-near', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('prefs', { keyPath: 'id' });
          const reportStore = db.createObjectStore('reports', { keyPath: 'id' });
          reportStore.createIndex('by-date', 'createdAt');
          db.createObjectStore('bundles', { keyPath: 'id' });
          db.createObjectStore('evidence', { keyPath: 'key' });
        }
        if (oldVersion < 2) {
          db.createObjectStore('corrections', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export const prefsStore = {
  async get(): Promise<UserPrefs | null> {
    const db = await getDB();
    const val = await db.get('prefs', 'user-prefs');
    return val ?? null;
  },

  async set(prefs: UserPrefs): Promise<void> {
    const db = await getDB();
    await db.put('prefs', { ...prefs, id: 'user-prefs' });
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('prefs');
  },
};

export const reportsStore = {
  async getAll(): Promise<import('@/lib/poi/types').IncidentReport[]> {
    const db = await getDB();
    return db.getAllFromIndex('reports', 'by-date');
  },

  async get(id: string): Promise<import('@/lib/poi/types').IncidentReport | undefined> {
    const db = await getDB();
    return db.get('reports', id);
  },

  async put(report: import('@/lib/poi/types').IncidentReport): Promise<void> {
    const db = await getDB();
    await db.put('reports', report);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('reports', id);
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('reports');
  },
};

export const bundlesStore = {
  async get(id: string): Promise<import('@/lib/poi/types').PoiBundle | undefined> {
    const db = await getDB();
    return db.get('bundles', id);
  },

  async put(bundle: import('@/lib/poi/types').PoiBundle): Promise<void> {
    const db = await getDB();
    await db.put('bundles', bundle);
  },

  async getAll(): Promise<import('@/lib/poi/types').PoiBundle[]> {
    const db = await getDB();
    return db.getAll('bundles');
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('bundles', id);
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('bundles');
  },
};

export const evidenceStore = {
  async put(key: string, data: ArrayBuffer, mime: string): Promise<void> {
    const db = await getDB();
    await db.put('evidence', { key, data, mime, createdAt: new Date().toISOString() });
  },

  async get(key: string): Promise<{ data: ArrayBuffer; mime: string } | undefined> {
    const db = await getDB();
    const entry = await db.get('evidence', key);
    return entry ? { data: entry.data, mime: entry.mime } : undefined;
  },

  async delete(key: string): Promise<void> {
    const db = await getDB();
    await db.delete('evidence', key);
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('evidence');
  },
};

export const correctionsStore = {
  async put(correction: import('@/lib/poi/types').PlaceCorrection): Promise<void> {
    const db = await getDB();
    await db.put('corrections', correction);
  },
  async getAll(): Promise<import('@/lib/poi/types').PlaceCorrection[]> {
    const db = await getDB();
    return db.getAll('corrections');
  },
  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('corrections');
  },
};

export async function clearAllData(): Promise<void> {
  await prefsStore.clear();
  await reportsStore.clear();
  await bundlesStore.clear();
  await evidenceStore.clear();
  await correctionsStore.clear();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('safe-near-lang');
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }
  }
}
