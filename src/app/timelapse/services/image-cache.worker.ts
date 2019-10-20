/// <reference lib="webworker" />

import { from, forkJoin } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { map, flatMap, reduce } from 'rxjs/operators';


addEventListener('message', ({ data }) => {
  postMessage({ type: 'init' });
  const { name, dates }: { name: string, dates: string[] } = data;
  postMessage({ type: 'success' });
  return;
  from(dates).pipe(
    flatMap(date => {
      const url = new URL('https://neo.sci.gsfc.nasa.gov/wms/wms');
      url.searchParams.set('service', 'WMS');
      url.searchParams.set('request', 'GetMap');
      url.searchParams.set('version', '1.3.0');
      url.searchParams.set('transparent', 'TRUE');
      url.searchParams.set('layers', name);
      url.searchParams.set('styles', '');
      url.searchParams.set('format', 'image/png');
      url.searchParams.set('width', '2560');
      url.searchParams.set('height', '1280');
      url.searchParams.set('time', date);
      url.searchParams.set('crs', 'CRS:84');
      url.searchParams.set('bbox', '-180,-90,180,90');
      return fromFetch(url.toString()).pipe(
        flatMap(res => res.blob()),
        flatMap(blob => createImageBitmap(blob)),
        map(bitmap => [date, bitmap])
      );
    }),
    reduce((acc, val: any) => acc.set(val[0], val[1]), new Map<string, ImageBitmap>())
  ).subscribe(cache => {
    postMessage({ type: 'success', cache });
    console.log('success');
  });
});
