import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { pluck, map, take } from 'rxjs/operators';
import { Subscription, combineLatest, fromEvent, interval } from 'rxjs';

import { WorldWindExport as WorldWind, Layer } from '../world-wind/layer';
import { MatDialog } from '@angular/material/dialog';
import { LoadingComponent } from '../loading/loading.component';
import { Chart } from 'chart.js';
import { blue, red } from './colors';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { DataMessage } from './services/data-message';
import { MatSliderChange } from '@angular/material/slider';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';

@Component({
  selector: 'app-timelapse',
  templateUrl: './timelapse.component.html',
  styleUrls: ['./timelapse.component.scss']
})
export class TimelapseComponent implements AfterViewInit, OnDestroy, OnInit {

  faEdit = faEdit;
  cvs!: HTMLCanvasElement;

  layers: Layer[] = [];
  chart: Chart | null = null;
  theOneThatPlotsTheLayer: Subscription | undefined;
  animationSubscription!: Subscription;

  wwd: any;
  selectedLayer = -1;

  constructor(
    private route: ActivatedRoute,
    private matDialog: MatDialog
  ) { }

  @ViewChild('globe', { static: true }) set globe(globe: ElementRef<HTMLCanvasElement>) {
    this.cvs = globe.nativeElement;
    this.cvs.width = window.innerWidth;
    this.cvs.height = window.innerHeight - 200;
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
            distribution: 'linear',
            ticks: {
              fontColor: 'white'
            },
            gridLines: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }],
          yAxes: [{
            ticks: {
              fontColor: 'white'
            },
            gridLines: {
              color: 'rgba(255, 255, 255, 0.1)'
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

  ngOnInit() {
    // How long to fade out outgoing layer
    const fadeOutDuration = 500;

    // How long to fade in ingoing layer
    const fadeInDuration = 300;

    // Our code runs with the animationFrameScheduler
    const scheduler = animationFrame;

    // Current start time in millisseconds
    let lastStart = scheduler.now();

    // Observable that emits once every animationFrame ~60fps
    this.animationSubscription = interval(0, scheduler).subscribe(() => {

      const workStart = scheduler.now();
      const elapsedMs = workStart - lastStart;

      let changed = false; // Did something change?

      const wwdLayers = this.wwd.layers as Layer[];
      let currentLayer: Layer | undefined;
      for (let i = 0; i < this.layers.length; i++) {
        const layer = this.layers[i];
        if (i === this.selectedLayer) { // layer to fade in
          if (layer.opacity < 1) { // if it is not already in
            layer.opacity += elapsedMs / fadeInDuration; // increment based on elapsed time
            changed = true;
            currentLayer = layer;
          }
          if (layer.opacity > 0) {
            if (layer.opacity > 1) {
              layer.opacity = 1;
            }
            const index = wwdLayers.indexOf(layer) as number;
            if (index < 0) {
              wwdLayers.push(layer); // the layer needs to be on top
            }
          }
        } else { // layers to fade out
          if (layer.opacity > 0) { // if it is not already out
            layer.opacity -= elapsedMs / fadeOutDuration;
            changed = true;
          }
          if (layer.opacity <= 0) {
            layer.opacity = 0;
            const index = wwdLayers.indexOf(layer) as number;
            if (index >= 0) {
              wwdLayers.splice(index, 1); // we need to remove layers, worldwind breaks with too many
            }
          }
        }
      }
      if (changed) {
        if (currentLayer) {
          currentLayer.currentTilesInvalid = true;
        }
        this.wwd.redraw();
      }
      lastStart = workStart;
    });
  }

  async ngAfterViewInit() {
    const loading = this.matDialog.open(LoadingComponent, { disableClose: true });
    try {
      /** Base globe */
      this.wwd = new WorldWind.WorldWindow('globe');
      this.wwd.addLayer(new WorldWind.BMNGOneImageLayer());
      this.wwd.addLayer(new WorldWind.BMNGLandsatLayer());
      this.wwd.addLayer(new WorldWind.StarFieldLayer());
      this.wwd.addLayer(new WorldWind.AtmosphereLayer());
      if (this.cvs.width < 350) {

      } else if (this.cvs.width < 700) {
        this.wwd.navigator.range *= 2;
      } else {
        this.wwd.navigator.range *= 4;
      }
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
    this.animationSubscription.unsubscribe();
  }

  select(point: number) {
    if (this.chart) {
      const bg = this.chart.data.datasets![0].backgroundColor as string[];
      if (this.selectedLayer !== -1) {
        bg[this.selectedLayer] = blue.backgroundColor;
      }
      this.selectedLayer = point;
      if (this.selectedLayer !== -1) {
        bg[this.selectedLayer] = red.backgroundColor;
      }
      this.chart.update();
    }
  }

  chartClicked(evt: Event) {
    if (this.chart) {
      const points: any = this.chart.getElementAtEvent(evt);
      try {
        this.select(points[0]._index);
      } catch {
        this.select(-1);
      }
    }
  }

  sliderChange(evt: MatSliderChange) {
    const value = typeof (evt.value) === 'number' ? evt.value : -1;
    this.select(value);
  }

}
