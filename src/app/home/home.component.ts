import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  what = new FormControl('', Validators.compose([
    Validators.required,
    c => typeof (c.value) === 'string' ? { type: true } : null
  ]));

  // tslint:disable-next-line: max-line-length
  allLayers$ = this.httpClient.get('https://neo.sci.gsfc.nasa.gov/wms/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0', { responseType: 'text' })
    .pipe(
      map(text => new DOMParser().parseFromString(text, 'text/xml')),
      map(xml => xml.querySelectorAll('Capability>Layer>Layer')),
      map(nodeList => Array.from(nodeList)),
      shareReplay(1)
    );

  options$ = combineLatest([this.allLayers$, this.what.valueChanges.pipe(startWith(this.what.value))])
    .pipe(
      map(([layers, text]) => layers.filter(layer => {
        const title = layer.querySelector('Title')!.innerHTML;
        if (typeof (text) === 'string') {
          return title.toLocaleLowerCase().indexOf(text.toLocaleLowerCase()) !== -1;
        } else {
          return layer === text;
        }
      }))
    );

  constructor(
    private router: Router,
    private httpClient: HttpClient
  ) {
    this.httpClient.get('https://neo.sci.gsfc.nasa.gov/wms/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0', { responseType: 'text' })
      .pipe(
        map(text => new DOMParser().parseFromString(text, 'text/xml')),
      ).subscribe((xml => {
        let objectAny = {};
        console.log(xml.querySelector('Title'));
        console.log(xml);
      }));
  }

  displayFn(option: Element | string) {
    if (typeof (option) === 'string') {
      return option;
    } else {
      return option.querySelector('Title')!.innerHTML;
    }
  }

  go(option: Element) {
    const name = option.querySelector('Name')!.innerHTML;
    this.router.navigateByUrl('/timelapse/' + name);
  }

}
