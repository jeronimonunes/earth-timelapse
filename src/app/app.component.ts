import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { filter } from 'minimatch';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  what = new FormControl('');

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
        return title.toLocaleLowerCase().indexOf(text.toLocaleLowerCase()) !== -1;
      }))
    );

  constructor(private httpClient: HttpClient) {

  }

}
