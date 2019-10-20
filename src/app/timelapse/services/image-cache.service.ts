import { Injectable, ɵConsole } from '@angular/core';
import '@nasaworldwind/worldwind/build/dist/worldwind.js';

declare const WorldWind: any;
export const WorldWindExport = WorldWind;

// tslint:disable: only-arrow-functions

@Injectable()
export class ImageCacheService {

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

  private async getCachedImage(stringUrl: string, layer: any) {
    const url = new URL(stringUrl);
    const layers = url.searchParams.get('layers');
    const time = url.searchParams.get('time');
    const bbox = url.searchParams.get('bbox');
    const width = url.searchParams.get('width');
    const height = url.searchParams.get('height');
    const crs = url.searchParams.get('crs');
    if (layers && time && bbox && width && height) {
      const data = layer.imageBitmap;
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

  constructor() {

    const service = this;

    WorldWind.TiledImageLayer.prototype.retrieveTileImage = async function (dc: any, tile: any, suppressRedraw: boolean) {
      if (this.currentRetrievals.indexOf(tile.imagePath) < 0) {
        if (this.absentResourceList.isResourceAbsent(tile.imagePath)) {
          return;
        }

        this.currentRetrievals.push(tile.imagePath);

        const url: any = this.resourceUrlForTile(tile, this.retrievalImageFormat);
        const layer = this;
        try {
          let image = await service.getCachedImage(url, layer);
          if (!image) {
            const img = await service.preloadImage(url);
            image = await createImageBitmap(img);
          }
          const cache = dc.gpuResourceCache;
          const canvas = dc.currentGlContext.canvas;

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
        } catch (e) {
          layer.removeFromCurrentRetrievals(layer.imagePath);
          layer.absentResourceList.markResourceAbsent(layer.imagePath);
        }
      }
    };
  }

}
