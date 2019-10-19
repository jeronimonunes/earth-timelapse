import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import '@nasaworldwind/worldwind/build/dist/worldwind.js';

declare const WorldWind: any;
export const WorldWindExport = WorldWind;
const Logger = WorldWind.Logger;

// tslint:disable: only-arrow-functions

@Injectable()
export class ImageCacheService {

  private cache: Map<string, Map<string, ImageBitmap>> = new Map();

  preloadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement('img');
      img.crossOrigin = '';
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      img.src = src;
    });
  }

  async cacheImage(layers: string | null, time: string | null) {
    if (layers && time) {
      let layerImages = this.cache.get(layers);
      if (!layerImages) {
        this.cache.set(layers, layerImages = new Map());
      }
      let image = layerImages.get(time);
      if (!image) {
        // tslint:disable-next-line: max-line-length
        const url = new URL('https://neo.sci.gsfc.nasa.gov/wms/wms');
        url.searchParams.set('service', 'WMS');
        url.searchParams.set('request', 'GetMap');
        url.searchParams.set('version', '1.3.0');
        url.searchParams.set('transparent', 'TRUE');
        url.searchParams.set('layers', layers);
        url.searchParams.set('styles', '');
        url.searchParams.set('format', 'image/png');
        url.searchParams.set('width', '2560');
        url.searchParams.set('height', '1280');
        url.searchParams.set('time', time);
        url.searchParams.set('crs', 'CRS:84');
        url.searchParams.set('bbox', '-180,-90,180,90');
        const img = await this.preloadImage(url.toString());
        image = await createImageBitmap(img);
        layerImages.set(time, image);
        return image;
      } else {
        return image;
      }
    }
  }

  private async getCachedImage(stringUrl: string) {
    const url = new URL(stringUrl);
    const layers = url.searchParams.get('layers');
    const time = url.searchParams.get('time');
    const bbox = url.searchParams.get('bbox');
    const width = url.searchParams.get('width');
    const height = url.searchParams.get('height');
    const crs = url.searchParams.get('crs');
    if (layers && time && bbox && width && height) {
      const pertime = this.cache.get(layers);
      if (pertime) {
        const data = pertime.get(time);
        if (data) {
          const bboxparts = bbox.split(',');
          let minLonge = -180;
          let minLat = -90;
          let maxLonge = 180;
          let maxLat = 90;
          if (crs === 'CRS:84') {
            minLonge = +bboxparts[0];
            minLat = +bboxparts[1];
            maxLonge = +bboxparts[2];
            maxLat = +bboxparts[3];
          } else {
            minLat = +bboxparts[0];
            minLonge = +bboxparts[1];
            maxLat = +bboxparts[2];
            maxLonge = +bboxparts[3];
          }
          const sx = (minLonge + 180) * data.width / 360;
          const sWidth = Math.abs(maxLonge - minLonge) * data.width / 360;
          const sHeight = Math.abs(maxLat - minLat) * data.height / 180;
          const sy = data.height - sHeight - (minLat + 90) * data.height / 180;
          return await createImageBitmap(data, sx, sy, sWidth, sHeight);
        }
      }
    }
  }

  constructor(private httpClient: HttpClient) {

    const service = this;

    WorldWind.TiledImageLayer.prototype.retrieveTileImage = async function (dc: any, tile: any, suppressRedraw: boolean) {
      if (this.currentRetrievals.indexOf(tile.imagePath) < 0) {
        if (this.absentResourceList.isResourceAbsent(tile.imagePath)) {
          return;
        }

        this.currentRetrievals.push(tile.imagePath);

        const url: any = this.resourceUrlForTile(tile, this.retrievalImageFormat);
        const urlObj = new URL(url);
        await service.cacheImage(urlObj.searchParams.get('layers'), urlObj.searchParams.get('time'));
        let image = await service.getCachedImage(url);
        if (!image) {
          const img = await service.preloadImage(url);
          image = await createImageBitmap(img);
        }
        const cache = dc.gpuResourceCache;
        const canvas = dc.currentGlContext.canvas;
        const layer = this;

        const texture = layer.createTexture(dc, tile, image);
        layer.removeFromCurrentRetrievals(tile.imagePath);
        if (texture) {
          cache.putResource(tile.imagePath, texture, texture.size);

          layer.currentTilesInvalid = true;
          layer.absentResourceList.unmarkResourceAbsent(tile.imagePath);

          if (!suppressRedraw) {
            // Send an event to request a redraw.
            const e = document.createEvent('Event');
            e.initEvent(WorldWind.REDRAW_EVENT_TYPE, true, true);
            canvas.dispatchEvent(e);
          }
        }

        /*onerror = function () {
          layer.removeFromCurrentRetrievals(imagePath);
          layer.absentResourceList.markResourceAbsent(imagePath);
          Logger.log(Logger.LEVEL_WARNING, 'Image retrieval failed: ' + url);
        };*/
      }
    };
  }

}
