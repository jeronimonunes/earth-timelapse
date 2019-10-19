import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { pluck, map, shareReplay, tap, mergeMap, startWith, bufferCount } from 'rxjs/operators';
import { of, combineLatest } from 'rxjs';

import { FormControl } from '@angular/forms';
import { ImageCacheService, WorldWindExport as WorldWind } from './services/image-cache.service';

let bkpDates: string[] = [];

@Component({
  selector: 'app-timelapse',
  templateUrl: './timelapse.component.html',
  styleUrls: ['./timelapse.component.scss']
})
export class TimelapseComponent implements AfterViewInit {

  selectedDate = new FormControl(0);

  capabilities$ = this.httpClient.get(
    'https://neo.sci.gsfc.nasa.gov/wms/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0',
    { responseType: 'text' }
  ).pipe(
    map(text => new DOMParser().parseFromString(text, 'text/xml')),
  );

  wmsCapabilities$ = this.capabilities$.pipe(map(capabilities => new WorldWind.WmsCapabilities(capabilities)));

  wmsLayerCapabilities$ = combineLatest([this.wmsCapabilities$, this.route.params.pipe(pluck('name'))])
    .pipe(map(([wmsCapabilities, name]) => wmsCapabilities.getNamedLayer(name)));

  wmsConfig$ = this.wmsLayerCapabilities$.pipe(
    map(wmsLayerCapabilities => WorldWind.WmsLayer.formLayerConfiguration(wmsLayerCapabilities))
  );

  metadata$ = this.route.params.pipe(
    pluck('name'),
    mergeMap(name =>
      this.httpClient.get(`https://neo.sci.gsfc.nasa.gov/servlet/FGDCMetadata?datasetId=${name}`, { responseType: 'text' })
    ),
    map(text => new DOMParser().parseFromString(text, 'text/xml')),
    shareReplay(1)
  );

  title$ = this.metadata$.pipe(map(metadata => metadata.querySelector('title')!.innerHTML));

  dates$ = this.metadata$.pipe(
    map(xml => xml.querySelectorAll('idinfo>timeperd>timeinfo>mdattim>sngdate')),
    map(sngdates => Array.from(sngdates)),
    map(sngdates => sngdates.map(sngdate => sngdate.querySelector('caldate')!.innerHTML)),
    shareReplay(1)
  );

  sliderMin$ = of(0);
  sliderMax$ = this.dates$.pipe(
    tap(dates => bkpDates = dates),
    map(dates => dates.length - 1)
  );

  constructor(
    private route: ActivatedRoute,
    private imageCacheService: ImageCacheService,
    private httpClient: HttpClient
  ) { }

  @ViewChild('globe', { static: true }) set globe(globe: ElementRef<HTMLCanvasElement>) {
    const cvs = globe.nativeElement;
    const size = Math.min(window.innerWidth, window.innerHeight);
    cvs.width = size;
    cvs.height = size;
  }

  displayDate(value: number) {
    if (bkpDates) {
      const v = bkpDates[value];
      if (typeof (v) === 'string') {
        return v.substring(0, 4) + '-' + v.substring(4, 6) + '-' + v.substring(6, 8);
      }
    }
    return '';
  }

  async ngAfterViewInit() {
    const wwd = new WorldWind.WorldWindow('globe');

    combineLatest([this.wmsConfig$, this.selectedDate.valueChanges.pipe(startWith(this.selectedDate.value))])
      .pipe(
        map(([wmsConfig, dateIndex]) => {
          const date = bkpDates[Math.round(dateIndex)];
          if (wmsConfig && typeof (date) === 'string') {
            const formatedDate = date.substring(0, 4) + '-' + date.substring(4, 6) + '-' + date.substring(6, 8);
            return new WorldWind.WmsLayer(wmsConfig, formatedDate);
          }
          return null;
        }),
        startWith(null),
        bufferCount(2, 1)
      ).subscribe(([oldLayer, newLayer]) => {
        if (oldLayer) {
          wwd.removeLayer(oldLayer);
        }
        if (newLayer) {
          wwd.addLayer(newLayer);
        }
        wwd.redraw();
      });
  }

}
