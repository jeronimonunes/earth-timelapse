import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { DatabaseService } from './database.service';

@Injectable()
export class WorldWindCapabilitiesService implements Resolve<Document> {

  constructor(private databaseService: DatabaseService) { }

  async fetchCapabilities() {
    const r = await fetch('https://neo.sci.gsfc.nasa.gov/wms/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0');
    const t = await r.text();
    this.databaseService.saveOnCaches('capabilities', t);
    return t;
  }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // cache first approach
    const cacheItem = await this.databaseService.getFromCaches('capabilities');
    let txt: string;
    if (cacheItem && cacheItem.content) {
      txt = cacheItem.content;
      // if old, refresh async
      if (cacheItem.date.setDate(cacheItem.date.getDate() + 3) < new Date().getTime()) {
        this.fetchCapabilities();
      }
    } else {
      // first execution, await needed
      txt = await this.fetchCapabilities();
    }
    return new DOMParser().parseFromString(txt, 'text/xml');
  }
}
