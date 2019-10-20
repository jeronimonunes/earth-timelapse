import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { pluck, map, shareReplay, tap, mergeMap, startWith, bufferCount, filter, switchMap } from 'rxjs/operators';
import { of, combineLatest, Subscription } from 'rxjs';

import { FormControl } from '@angular/forms';
import { ImageCacheService, WorldWindExport as WorldWind } from './services/image-cache.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadingComponent } from '../loading/loading.component';

let bkpDates: string[] = [];

@Component({
  selector: 'app-timelapse',
  templateUrl: './timelapse.component.html',
  styleUrls: ['./timelapse.component.scss']
})
export class TimelapseComponent implements AfterViewInit, OnDestroy {

  drawSubscription: Subscription | undefined;
  preloadImagesSubscription: Subscription | undefined;
  loadingRef: MatDialogRef<LoadingComponent> | null = null;

  selectedDate = new FormControl(0);

  wmsCapabilities$ = this.route.data.pipe(
    pluck('capabilities'),
    map(capabilities => new WorldWind.WmsCapabilities(capabilities))
  );

  wmsConfig$ = combineLatest([this.wmsCapabilities$, this.route.params.pipe(pluck('name'))])
    .pipe(
      map(([wmsCapabilities, name]) => wmsCapabilities.getNamedLayer(name)),
      map(wmsLayerCapabilities => WorldWind.WmsLayer.formLayerConfiguration(wmsLayerCapabilities))
    );

  metadata$ = this.route.params.pipe(
    pluck('name'),
    filter(name => !!name),
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
    map(sngdates => sngdates.map(sngdate => {
      const text = sngdate.querySelector('caldate')!.innerHTML;
      return text.substring(0, 4) + '-' + text.substring(4, 6) + '-' + text.substring(6, 8);
    })),
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
    private httpClient: HttpClient,
    private matDialog: MatDialog
  ) { }

  @ViewChild('globe', { static: true }) set globe(globe: ElementRef<HTMLCanvasElement>) {
    const cvs = globe.nativeElement;
    const size = Math.min(window.innerWidth, window.innerHeight);
    cvs.width = size;
    cvs.height = size;
  }

  displayDate(value: number) {
    if (bkpDates) {
      return bkpDates[value];
    }
    return '';
  }

  async ngAfterViewInit() {
    const wwd = new WorldWind.WorldWindow('globe');

    this.preloadImagesSubscription = combineLatest([
      this.route.params.pipe(pluck('name')),
      this.dates$
    ]).pipe(
      switchMap(([name, dates]) => this.imageCacheService.newWorker(name, dates))
    ).subscribe(({ type }) => {
      if (type === 'init') {
        if (this.loadingRef) {
          this.loadingRef.close();
        }
        this.loadingRef = this.matDialog.open(LoadingComponent, { disableClose: true });
      } else if (type === 'success') {
        if (this.loadingRef) {
          this.loadingRef.close();
        }
        this.loadingRef = null;
      }
    });

    this.drawSubscription = combineLatest([
      this.wmsConfig$,
      this.dates$,
      this.selectedDate.valueChanges.pipe(startWith(this.selectedDate.value))
    ]).pipe(
      map(([wmsConfig, dates, dateIndex]) => {
        const date = dates[Math.round(dateIndex)];
        if (wmsConfig && typeof (date) === 'string') {
          return new WorldWind.WmsLayer(wmsConfig, date);
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

  ngOnDestroy() {
    if (this.drawSubscription) {
      this.drawSubscription.unsubscribe();
    }
    if (this.preloadImagesSubscription) {
      this.preloadImagesSubscription.unsubscribe();
    }
  }

}
