import { Injectable } from '@angular/core';
import { DBSchema, openDB } from 'idb';

interface CacheItem {
  date: Date;
  content: any;
}

interface Store extends DBSchema {
  caches: {
    value: CacheItem;
    key: string;
  };
}

@Injectable()
export class DatabaseService {

  idb = openDB<Store>(
    'earth-timelapse', // name
    2, // version
    {
      upgrade: (db, oldVersion, newVersion, transaction) => {
        if (oldVersion === 1) {
          db.deleteObjectStore('caches');
        }
        db.createObjectStore('caches');
      }
    }
  );

  async getFromCaches(key: string) {
    const idb = await this.idb;
    return idb.get('caches', key);
  }

  async saveOnCaches(key: string, content: any) {
    const idb = await this.idb;
    return idb.put('caches', { date: new Date(), content }, key);
  }

}
