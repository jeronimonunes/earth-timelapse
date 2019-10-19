import { TestBed } from '@angular/core/testing';

import { WorldWindCapabilitiesService } from './world-wind-capabilities.service';

describe('WorldWindCapabilitiesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorldWindCapabilitiesService = TestBed.get(WorldWindCapabilitiesService);
    expect(service).toBeTruthy();
  });
});
