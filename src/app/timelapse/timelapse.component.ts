import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import '@nasaworldwind/worldwind';

declare var WorldWind: any;

@Component({
  selector: 'app-timelapse',
  templateUrl: './timelapse.component.html',
  styleUrls: ['./timelapse.component.scss']
})
export class TimelapseComponent implements AfterViewInit {

  constructor() { }

  @ViewChild('globe', { static: true }) set globe(globe: ElementRef<HTMLCanvasElement>) {
    const cvs = globe.nativeElement;
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
  }

  ngAfterViewInit() {
    const wwd = new WorldWind.WorldWindow('globe');
    wwd.addLayer(new WorldWind.BMNGOneImageLayer());
    wwd.addLayer(new WorldWind.BMNGLandsatLayer());
  }

}
