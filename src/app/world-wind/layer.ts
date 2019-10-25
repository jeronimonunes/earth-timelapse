declare const WorldWind: any;

export class Layer extends WorldWind.TiledImageLayer {

  bitmap: ImageBitmap;
  currentTilesInvalid: boolean;
  pickEnabled: boolean;
  displayName: any;
  opacity = 0;

  constructor(title: string, path: string, bitmap: ImageBitmap) {
    super(
      { minLatitude: -90, minLongitude: -180, maxLatitude: 90, maxLongitude: 180 }, // the sector the layer covers
      { latitude: 180, longitude: 360 }, // tile is the entire globe
      1, // one level
      'image/png', // download the png
      path, // to think cachePath
      3600, // width
      1800 // height
    );

    this.bitmap = bitmap;
    this.displayName = title;
    this.pickEnabled = false;
    this.currentTilesInvalid = true;
  }

  retrieveTileImage(dc: any, tile: any, suppressRedraw: boolean) {
    const texture = this.createTexture(dc, tile, this.bitmap);
    const canvas = dc.currentGlContext.canvas;
    const cache = dc.gpuResourceCache;

    cache.putResource(tile.imagePath, texture, texture.size);
    this.currentTilesInvalid = true;

    if (!suppressRedraw) {
      // Send an event to request a redraw.
      const e = document.createEvent('Event');
      e.initEvent(WorldWind.REDRAW_EVENT_TYPE, true, true);
      canvas.dispatchEvent(e);
    }
  }
}
