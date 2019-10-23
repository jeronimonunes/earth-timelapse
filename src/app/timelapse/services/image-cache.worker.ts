/// <reference lib="webworker" />

import { decode, IDecodedPNG } from 'fast-png';

import { fromEvent, combineLatest, forkJoin } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { map, filter, flatMap, tap } from 'rxjs/operators';
import { DataMessage } from './data-message';

const messages$ = fromEvent<MessageEvent>(self, 'message');

const data$ = messages$.pipe(
  map(({ data }) => data),
  filter(({ type }) => type === 'data'),
  map(({ value }) => value as DataMessage)
);

const next$ = messages$.pipe(
  map(({ data }) => data),
  filter(({ type }) => type === 'next'),
  map((val, idx) => idx)
);

const current$ = combineLatest([next$, data$]).pipe(
  map(([next, data]) => {
    const { times, limit } = data;
    const step = Math.ceil(times.length / limit);
    const idx = next * step;
    return [data, idx] as [DataMessage, number];
  }),
  filter(([{ times }, idx]) => idx < times.length)
);

const integerFixedWidth = (int: number, width: number) => {
  let str = int.toFixed(0);
  while (str.length < width) {
    str = '0' + str;
  }
  return str;
};

const timeString = (date: Date) =>
  integerFixedWidth(date.getUTCFullYear(), 4) + '-' +
  integerFixedWidth(date.getUTCMonth() + 1, 2) + '-' +
  integerFixedWidth(date.getUTCDate(), 2);

const pictureURL = current$.pipe(
  map(([data, idx]) => {
    const url = new URL('https://neo.sci.gsfc.nasa.gov/wms/wms');
    url.searchParams.set('service', data.service);
    url.searchParams.set('request', 'GetMap');
    url.searchParams.set('version', '1.3.0');
    url.searchParams.set('transparent', 'FALSE');
    url.searchParams.set('layers', data.name);
    url.searchParams.set('styles', 'gs');
    url.searchParams.set('format', 'image/png');
    url.searchParams.set('width', '3600');
    url.searchParams.set('height', '1800');
    url.searchParams.set('time', timeString(data.times[idx]));
    url.searchParams.set('crs', 'CRS:84');
    url.searchParams.set('bbox', '-180,-90,180,90');
    return [data, idx, url.toString()] as [DataMessage, number, string];
  })
);

const bitmap$ = pictureURL.pipe(
  flatMap(([data, idx, bitmapUrl]) =>
    forkJoin([
      fromFetch(bitmapUrl),
      fromFetch(data.legendUrl.substr(0, data.legendUrl.length - 4) + '.act.json'),
      fromFetch(data.legendUrl.substr(0, data.legendUrl.length - 4) + '_diddy.xml.json')
    ]).pipe(
      flatMap(([bitmapRes, toRGBRes, realRes]) => forkJoin([bitmapRes.arrayBuffer(), toRGBRes.json(), realRes.json()])),
      map(([pngData, toRGB, toReal]) => [data, idx, decode(pngData), toRGB, toReal] as [DataMessage, number, IDecodedPNG, any, any])
    )
  ));


bitmap$.pipe(
  flatMap(async ([data, idx, png, toRGB, toReal]) => {
    const imageData = new ImageData(png.width, png.height);
    let average = 0;
    let count = 0;
    for (let pngIdx = 0; pngIdx < png.data.length; pngIdx++) {
      const imgIdx = pngIdx * 4;
      const pngValue = png.data[pngIdx];
      const [r, g, b] = toRGB[pngValue];
      const real = toReal.valueMap[pngValue];
      if (typeof (real) === 'number') {
        imageData.data[imgIdx + 0] = r;
        imageData.data[imgIdx + 1] = g;
        imageData.data[imgIdx + 2] = b;
        imageData.data[imgIdx + 3] = 255;
        average += real;
        count++;
      } else {
        imageData.data[imgIdx + 0] = 0;
        imageData.data[imgIdx + 1] = 0;
        imageData.data[imgIdx + 2] = 0;
        imageData.data[imgIdx + 3] = 0;
      }
    }
    average /= count;
    const bitmap = await createImageBitmap(imageData);
    return { data, idx, average, toRGB, toReal, bitmap };
  })
).subscribe(({ data, idx, average, toRGB, toReal, bitmap }) => {
  const title = data.title;
  const path = data.service + data.name + timeString(data.times[idx]);
  const time = data.times[idx];
  postMessage({
    type: 'data',
    value: { path, title, time, average, toRGB, toReal, bitmap }
  }, [bitmap]);
});
