import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { pluck, map, take, tap } from 'rxjs/operators';
import { Subscription, combineLatest, fromEvent, interval } from 'rxjs';

import { WorldWindExport as WorldWind, Layer } from '../world-wind/layer';
import { MatDialog } from '@angular/material/dialog';
import { LoadingComponent } from '../loading/loading.component';
import { Chart } from 'chart.js';
import { blue, red } from './colors';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { DataMessage } from './services/data-message';
import { MatSliderChange } from '@angular/material/slider';
import { duration } from './services/util';

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

  wwd: any;
  selectedPoint = -1;

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
          ...blue,
          backgroundColor: []
        }]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            type: 'time',
            distribution: 'linear'
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

      const worker = new Worker('./services/loading.worker', { type: 'module' });

      worker.postMessage({ times, limit, name, title, service, legendUrl } as DataMessage);

      const workerData$ = fromEvent<MessageEvent>(worker, 'message').pipe(
        map(({ data }) => data as {
          path: string, title: string, time: Date,
          average: number, toRGB: any, toReal: any, bitmap: ImageBitmap
        }),
      );

      this.theOneThatPlotsTheLayer = workerData$
        .subscribe(async ({ path, title, time, average, toRGB, toReal, bitmap }) => {
          if (this.chart) {
            const dataset = this.chart.data.datasets![0]!;
            const data = dataset.data! as Chart.ChartPoint[];
            const bg = dataset.backgroundColor as string[];
            data.push({
              t: time,
              y: average
            });
            data.sort((a: any, b: any) => a.t - b.t);
            bg.push(blue.backgroundColor);
            this.chart.update();
          }
          const layer = new Layer(title, path, bitmap);
          this.layers.push(layer);
        });
    } finally {
      loading.close();
    }
  }

  ngOnDestroy() {
    if (this.theOneThatPlotsTheLayer) {
      this.theOneThatPlotsTheLayer.unsubscribe();
    }
  }

  async fadeOut(layer: Layer) {
    layer.opacity = 1;
    await duration(500).pipe(tap(n => {
      layer.opacity = 1 - n;
      this.wwd.redraw();
    })).toPromise();
    this.wwd.removeLayer(layer);
  }

  async fadeIn(layer: Layer) {
    layer.opacity = 0;
    this.wwd.addLayer(layer);
    await duration(300).pipe(tap(n => {
      layer.opacity = n;
      this.wwd.redraw();
    })).toPromise();
  }

  async select(point: number) {
    if (this.chart) {
      const bg = this.chart.data.datasets![0].backgroundColor as string[];
      const promises: Promise<void>[] = [];
      if (this.selectedPoint !== -1) {
        promises.push(
          this.fadeOut(this.layers[this.selectedPoint])
        );
        bg[this.selectedPoint] = blue.backgroundColor;
      }

      this.selectedPoint = point;

      if (this.selectedPoint !== -1) {
        bg[this.selectedPoint] = red.backgroundColor;
        promises.push(
          this.fadeIn(this.layers[this.selectedPoint])
        );
      }

      this.wwd.redraw();
      this.chart.update();
      await Promise.all(promises);
      this.wwd.redraw();
    }
  }

  async chartClicked(evt: Event) {
    if (this.chart) {
      const points: any = this.chart.getElementAtEvent(evt);
      try {
        await this.select(points[0]._index);
      } catch {
        await this.select(-1);
      }
    }
  }

  async sliderChange(evt: MatSliderChange) {
    const value = typeof (evt.value) === 'number' ? evt.value : -1;
    await this.select(value);
    this.wwd.redraw();
  }

}
