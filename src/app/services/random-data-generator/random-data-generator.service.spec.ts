import { TestBed } from '@angular/core/testing';

import { RandomDataGeneratorService } from './random-data-generator.service';

describe('RandomDataGeneratorService', () => {
  let service: RandomDataGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RandomDataGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
