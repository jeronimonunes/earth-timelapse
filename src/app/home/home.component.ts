import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { map, shareReplay, startWith, pluck, filter } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

declare const WorldWind: any;

interface Layer {
  title: string;
  name: string;
}

interface Group {
  title: string;
  items: Layer[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

  what = new FormControl('', Validators.compose([
    Validators.required,
    c => typeof (c.value) === 'string' ? { type: true } : null
  ]));

  layerGroups$ = this.route.data.pipe(
    pluck('capabilities'),
    filter(v => !!v),
    map((xml: Document) => this.workLayers(xml)),
    shareReplay(1)
  );

  typingText$ = this.what.valueChanges.pipe(
    startWith(this.what.value),
    map(obj => {
      if (!obj) {
        return '';
      } else if (typeof (obj) === 'string') {
        return obj.toLocaleLowerCase();
      } else {
        return (obj.title || '').toLocaleLowerCase();
      }
    })
  );

  options$ = combineLatest([this.layerGroups$, this.typingText$])
    .pipe(map(([groups, text]) => {
      return groups.map(group => {
        const items: any[] = group.items.filter(item => {
          return item.title.toLocaleLowerCase().indexOf(text) !== -1;
        });
        return { ...group, items };
      }).filter(group => group.items.length);
    }));

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  @ViewChild('stars', { static: true }) set stars(stars: ElementRef<HTMLCanvasElement>) {
    const cvs = stars.nativeElement;
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
  }

  ngAfterViewInit() {
    const wwd = new WorldWind.WorldWindow('stars');
    wwd.addLayer(new WorldWind.StarFieldLayer());
  }

  workLayers(xml: Document): Group[] {
    const groups = new Map<string, Layer[]>();
    for (const name of Array.from(xml.querySelectorAll('Layer>Name'))) {
      const layer = name.parentElement!;
      const group = this.findGroup(layer);
      let items = groups.get(group);
      if (!items) {
        groups.set(group, items = []);
      }
      items.push({
        name: name.innerHTML,
        title: layer.querySelector('Title')!.innerHTML
      });
    }
    return Array.from(groups.entries()).map(([title, items]) => ({ title, items }));
  }

  findGroup(layer: Element): string {
    const parent = layer.parentElement!;
    if (parent.parentElement!.tagName !== 'Layer') {
      return '';
    } else {
      const parentGroup = this.findGroup(parent);
      const localGroup = parent.querySelector('Title')!.innerHTML;
      if (parentGroup) {
        return this.findGroup(parent) + ' - ' + localGroup;
      } else {
        return localGroup;
      }
    }
  }

  displayFn(option: Layer | string) {
    if (typeof (option) === 'string') {
      return option;
    } else {
      return option.title;
    }
  }

  go(option: Layer) {
    this.router.navigateByUrl('/timelapse/' + option.name);
  }

}
