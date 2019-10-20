/// <reference lib="webworker" />

import { Observable, fromEvent, combineLatest } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { map, filter, flatMap, takeWhile } from 'rxjs/operators';
import { rgb2hsv } from './rgb2hsv';

const messages$ = fromEvent<MessageEvent>(self, 'message');

const dates$ = messages$.pipe(
  map(({ data }) => data),
  filter(({ type }) => type === 'dates'),
  map(({ value }) => value)
);

const limit$ = messages$.pipe(
  map(({ data }) => data),
  filter(({ type }) => type === 'limit'),
  map(({ value }) => value)
);

const name$ = messages$.pipe(
  map(({ data }) => data),
  filter(({ type }) => type === 'name'),
  map(({ value }) => value)
);

const next$ = messages$.pipe(
  map(({ data }) => data),
  filter(({ type }) => type === 'next')
)

const currentItem$ = combineLatest([next$, limit$, dates$]).pipe(
  map(([next, N, dates], idx) => {
    let step = dates.length / N;
    step = Math.ceil(step);
    const i = idx * step;
    return [dates, i];
  }),
  takeWhile(([array, i]) => i < array.length),
  map(([array, i]) => array[i])
)

const pictureURL = combineLatest([currentItem$, name$]).pipe(
  map(([date, name]) => {
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
    return [url.toString(), date];
  })
) as Observable<[string, string]>;

const bitmap$ = pictureURL.pipe(
  flatMap(([url, date]) => fromFetch(url).pipe(
    flatMap(res => res.blob()),
    flatMap(blob => createImageBitmap(blob)),
    map(bitmap => [bitmap, date])
  ))
) as Observable<[ImageBitmap, string]>;


bitmap$.pipe(
  map(([bitmap, date]) => {
    const cvs = new OffscreenCanvas(bitmap.width, bitmap.height);
    const twoD = cvs.getContext('2d')! as any;
    twoD.drawImage(bitmap, 0, 0);
    const data = twoD.getImageData(0, 0, cvs.width, cvs.height).data;
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i + 0];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const { h, s, v } = rgb2hsv(r, g, b);
      total += v;
    }
    const average = total * 4 / data.length;
    return [average, bitmap, date];
  })
).subscribe(([average, bitmap, date]) => {
  postMessage({
    type: 'data',
    value: { average, bitmap, date }
  });
});
