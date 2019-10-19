import { TestBed } from '@angular/core/testing';

import { ImageCacheService } from './image-cache.service';

describe('ImageCacheService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImageCacheService = TestBed.get(ImageCacheService);
    expect(service).toBeTruthy();
  });
});
