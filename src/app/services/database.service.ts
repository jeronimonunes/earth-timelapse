import { Injectable } from '@angular/core';
import { openDB } from 'idb';
import { from } from 'rxjs';
import { shareReplay, map, switchMap } from 'rxjs/operators';

@Injectable()
export class DatabaseService {

  idb = openDB(
    'earth-timelapse', // name
    1, // version
    {
      upgrade: (db, oldVersion, newVersion, transaction) => {
        db.createObjectStore('caches');
      }
    }
  );

  constructor() {

  }

  async transaction(stores: string[], mode: IDBTransactionMode) {
    const db = await this.idb;
    return db.transaction(stores, mode);
  }

  async getFromCaches(key: string) {
    const tx = await this.transaction(['caches'], 'readonly');
    return tx.objectStore('caches').get(key);
  }

  async saveOnCaches(key: string, data: any) {
    const tx = await this.transaction(['caches'], 'readwrite');
    return tx.objectStore('caches').put(data, key);
  }

}
