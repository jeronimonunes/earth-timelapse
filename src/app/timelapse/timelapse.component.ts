import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { pluck, map, shareReplay, tap, mergeMap } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

import '@nasaworldwind/worldwind';

declare var WorldWind: any;

let bkpDates: string[] = [];

@Component({
  selector: 'app-timelapse',
  templateUrl: './timelapse.component.html',
  styleUrls: ['./timelapse.component.scss']
})
export class TimelapseComponent implements AfterViewInit {

  datesSubscription!: Subscription;

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

  ngAfterViewInit() {
    const wwd = new WorldWind.WorldWindow('globe');
    wwd.addLayer(new WorldWind.BMNGOneImageLayer());
    wwd.addLayer(new WorldWind.BMNGLandsatLayer());
  }

}
