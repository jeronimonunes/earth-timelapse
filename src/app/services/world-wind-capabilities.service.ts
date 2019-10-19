import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DatabaseService } from './database.service';

@Injectable()
export class WorldWindCapabilitiesService implements Resolve<any> {

  constructor(
    private httpClient: HttpClient,
    private databaseService: DatabaseService
  ) { }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let capabilitiesText = await this.databaseService.getFromCaches('capabilities');
    if (!capabilitiesText) {
      capabilitiesText =
        await this.httpClient.get('https://neo.sci.gsfc.nasa.gov/wms/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0',
          { responseType: 'text' }).toPromise();

      // Do something to renew the data
      // document.documentElement.setAttribute('date', new Date().toISOString());
      this.databaseService.saveOnCaches('capabilities', capabilitiesText);
    }
    return new DOMParser().parseFromString(capabilitiesText, 'text/xml');
  }
}
