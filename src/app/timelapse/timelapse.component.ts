import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { pluck, map, shareReplay, mergeMap, filter, take } from 'rxjs/operators';
import { combineLatest, fromEvent, interval, Subscription } from 'rxjs';

import { FormControl } from '@angular/forms';
import { ImageCacheService, WorldWindExport as WorldWind } from './services/image-cache.service';
import { MatDialog } from '@angular/material/dialog';
import { LoadingComponent } from '../loading/loading.component';
import { Chart } from 'chart.js';
import { blue } from './colors';
import { faEdit } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-timelapse',
  templateUrl: './timelapse.component.html',
  styleUrls: ['./timelapse.component.scss']
})
export class TimelapseComponent implements AfterViewInit, OnDestroy {

  faEdit = faEdit;

  wmsCapabilities$ = this.route.data.pipe(
    pluck('capabilities'),
    map(capabilities => new WorldWind.WmsCapabilities(capabilities))
  );

  wmsConfig$ = combineLatest([this.wmsCapabilities$, this.route.params.pipe(pluck('name'))])
    .pipe(
      map(([wmsCapabilities, name]) => wmsCapabilities.getNamedLayer(name)),
      map(wmsLayerCapabilities => WorldWind.WmsLayer.formLayerConfiguration(wmsLayerCapabilities)),
      shareReplay(1)
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
    }))
  );

  selectedDate = new FormControl(null);
  layers: any = [];
  chart: Chart | null = null;
  theOneThatPlotsTheLayer: Subscription | undefined;
  theOneWhoAsksForLayers: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private imageCacheService: ImageCacheService,
    private httpClient: HttpClient,
    private matDialog: MatDialog
  ) { }

  @ViewChild('globe', { static: true }) set globe(globe: ElementRef<HTMLCanvasElement>) {
    const cvs = globe.nativeElement;
    const size = 600;
    cvs.width = size;
    cvs.height = size;
  }

  @ViewChild('graph', { static: true }) set graph(graph: ElementRef<HTMLCanvasElement>) {
    const cvs = graph.nativeElement;
    cvs.width = window.innerWidth;
    cvs.height = 200;
    this.chart = new Chart(cvs, {
      type: 'bar',
      data: {
        datasets: [{
          data: [],
          fill: false,
          ...blue
        }]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            type: 'time',
            distribution: 'series'
          }],
          yAxes: [{
            ticks: {
              display: false
            }
          }]
        }
      }
    });
  }

  wwd: any;

  async ngAfterViewInit() {
    const loading = this.matDialog.open(LoadingComponent, { disableClose: true });
    try {
      this.wwd = new WorldWind.WorldWindow('globe');

      const worker = new Worker('./services/image-cache.worker', { type: 'module' });
      const name = await this.route.params.pipe(pluck('name'), take(1)).toPromise();
      const dates = await this.dates$.pipe(take(1)).toPromise();

      this.wwd.addLayer(new WorldWind.BMNGOneImageLayer());
      this.wwd.addLayer(new WorldWind.BMNGLandsatLayer());
      this.wwd.redraw();

      worker.postMessage({
        type: 'dates',
        value: dates
      });

      worker.postMessage({
        type: 'limit',
        value: 20
      });

      worker.postMessage({
        type: 'name',
        value: name
      });

      const workerData$ = fromEvent<MessageEvent>(worker, 'message').pipe(
        map(({ data }) => data.value as { average: number, bitmap: ImageBitmap, date: string }),
      );

      this.theOneThatPlotsTheLayer = combineLatest([workerData$, this.wmsConfig$])
        .subscribe(async ([{ average, bitmap, date }, wmsConfig]) => {
          if (this.chart) {
            const datasets = this.chart.data.datasets![0]!;
            const data = datasets.data! as Chart.ChartPoint[];
            data.push({
              t: new Date(date),
              y: average
            });
            this.chart.update();
          }
          const layer = new WorldWind.WmsLayer(wmsConfig, date);
          layer.imageBitmap = bitmap;
          this.layers.push(layer);
        });

      this.theOneWhoAsksForLayers = interval(1000)
        .pipe(take(20))
        .subscribe(a => {
          worker.postMessage({ type: 'next' });
        });

      worker.postMessage({
        type: 'next'
      });
    } finally {
      loading.close();
    }
  }

  ngOnDestroy() {
    if (this.theOneThatPlotsTheLayer) {
      this.theOneThatPlotsTheLayer.unsubscribe();
    }
    if (this.theOneWhoAsksForLayers) {
      this.theOneWhoAsksForLayers.unsubscribe();
    }
  }

  oldLayer: any;

  chartClicked(evt: Event) {
    if (this.chart) {
      const points: any = this.chart.getElementAtEvent(evt);
      if (points.length) {
        const point = points[0]._index;
        if (this.oldLayer) {
          this.wwd.removeLayer(this.oldLayer);
        }
        // old layer
        this.oldLayer = this.layers[point];
        this.wwd.addLayer(this.oldLayer);
        this.wwd.redraw();
      }
    }
  }

}
