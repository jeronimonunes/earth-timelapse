import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { DatabaseService } from './database.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class WorldWindCapabilitiesService implements Resolve<any> {

  constructor(
    private httpClient: HttpClient,
    private databaseService: DatabaseService
  ) { }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    // get from server if needed
    const fetch$ = this.httpClient.get('https://neo.sci.gsfc.nasa.gov/wms/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0',
      { responseType: 'text' }).pipe(tap(txt =>
        this.databaseService.saveOnCaches('capabilities', txt)
      ));

    // cache first approach
    const cacheItem = await this.databaseService.getFromCaches('capabilities');

    let txt: string;
    if (cacheItem) {
      txt = cacheItem.content;

      // if old, refresh async
      if (cacheItem.date.setDate(cacheItem.date.getDate() + 3) < new Date().getTime()) {
        fetch$.toPromise();
      }
    } else {
      // first execution, await needed
      txt = await fetch$.toPromise();
    }
    return new DOMParser().parseFromString(txt, 'text/xml');
  }
}
