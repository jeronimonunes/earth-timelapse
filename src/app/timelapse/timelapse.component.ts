import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { pluck, map, take } from 'rxjs/operators';
import { Subscription, combineLatest, fromEvent, interval } from 'rxjs';

import { WorldWindExport as WorldWind, Layer } from '../world-wind/layer';
import { MatDialog } from '@angular/material/dialog';
import { LoadingComponent } from '../loading/loading.component';
import { Chart } from 'chart.js';
import { blue } from './colors';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { DataMessage } from './services/data-message';

@Component({
  selector: 'app-timelapse',
  templateUrl: './timelapse.component.html',
  styleUrls: ['./timelapse.component.scss']
})
export class TimelapseComponent implements AfterViewInit, OnDestroy {

  faEdit = faEdit;

  layers: Layer[] = [];
  chart: Chart | null = null;
  theOneThatPlotsTheLayer: Subscription | undefined;
  theOneWhoAsksForLayers: Subscription | undefined;

  wwd: any;
  oldLayer: any;

  constructor(
    private route: ActivatedRoute,
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
              display: true
            }
          }]
        }
      }
    });
  }

  wmsCapabilities$ = this.route.data.pipe(
    pluck('capabilities'),
    map(capabilities => new WorldWind.WmsCapabilities(capabilities))
  );

  layer$ = combineLatest([this.wmsCapabilities$, this.route.params.pipe(pluck('name'))]).pipe(
    map(([wmsCapabilities, name]) => wmsCapabilities.getNamedLayer(name))
  );

  async ngAfterViewInit() {
    const loading = this.matDialog.open(LoadingComponent, { disableClose: true });
    try {
      /** Base globe */
      this.wwd = new WorldWind.WorldWindow('globe');
      this.wwd.addLayer(new WorldWind.BMNGOneImageLayer());
      this.wwd.addLayer(new WorldWind.BMNGLandsatLayer());
      this.wwd.redraw();

      const layer = await this.layer$.pipe(take(1)).toPromise();

      const title: string = layer.title;
      const name: string = layer.name;
      const limit = 20;
      const service = 'WMS';
      const times: Date[] = [];

      let rgb = null;
      let gs = null;
      let legendUrl = null;
      for (const style of layer.styles) {
        if (style.name === 'rgb') {
          rgb = style;
        } else if (style.name === 'gs') {
          gs = style;
        }
      }
      if (!rgb || !gs) {
        // should error
      } else {
        for (const legend of rgb.legendUrls) { // why string?
          legendUrl = legend.url;
        }
      }
      const periods = WorldWind.WmsLayer.parseTimeDimensions(layer);
      for (const period of periods) {
        period.reset();
        let time: Date | null = period.next();
        while (time != null) {
          times.push(time);
          time = period.next();
        }
      }

      const worker = new Worker('./services/image-cache.worker', { type: 'module' });

      worker.postMessage({
        type: 'data',
        value: { times, limit, name, title, service, legendUrl } as DataMessage
      });

      const workerData$ = fromEvent<MessageEvent>(worker, 'message').pipe(
        map(({ data }) => data.value as {
          path: string, title: string, time: Date,
          average: number, toRGB: any, toReal: any, bitmap: ImageBitmap
        }),
      );

      this.theOneThatPlotsTheLayer = workerData$
        .subscribe(async ({ path, title, time, average, toRGB, toReal, bitmap }) => {
          if (this.chart) {
            const datasets = this.chart.data.datasets![0]!;
            const data = datasets.data! as Chart.ChartPoint[];
            data.push({
              t: time,
              y: average
            });
            data.sort((a: any, b: any) => a.t - b.t)
            this.chart.update();
          }
          const layer = new Layer(title, path, bitmap);
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
