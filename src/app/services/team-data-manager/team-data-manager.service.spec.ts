import { TestBed } from '@angular/core/testing';

import { TeamDataManagerService } from './team-data-manager.service';

describe('TeamDataManagerService', () => {
  let service: TeamDataManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamDataManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
