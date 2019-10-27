/// <reference lib="webworker" />

import { decode } from 'fast-png';
import { timeString, makeUrl } from './util';

addEventListener('message', async ({ data }) => {
  const { service, name, times, limit, legendUrl } = data;
  const [toRGBres, toRealRes] = await Promise.all([
    fetch(legendUrl.substr(0, legendUrl.length - 4) + '.act.json'),
    fetch(legendUrl.substr(0, legendUrl.length - 4) + '_diddy.xml.json')
  ]);
  const [toRGB, toReal] = await Promise.all([
    toRGBres.json(),
    toRealRes.json()
  ]);
  postMessage({
    type: 'init',
    value: { toRGB, toReal }
  });
  const step = Math.ceil(times.length / limit);
  for (let i = 0; i < times.length; i += step) {
    try {
      const req = await fetch(makeUrl(service, name, timeString(times[i])));
      const buf = await req.arrayBuffer();
      const png = decode(buf);
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
      const path = service + name + timeString(times[i]);

      // Microsoft Edge and Safari don't implement this feature
      if (typeof (createImageBitmap) === 'function') {
        const bitmap = await createImageBitmap(imageData);
        postMessage({
          type: 'data',
          value: { path, time: times[i], average, bitmap }
        }, [bitmap]);
      } else {
        postMessage({
          type: 'data',
          value: { path, time: times[i], average, bitmap: imageData }
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
});
