import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { TeamDataManagerService } from './team-data-manager.service';

describe('TeamDataManagerService', () => {
  let service: TeamDataManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: jasmine.createSpyObj('Firestore', ['collection']) }
      ]
    });
    service = TestBed.inject(TeamDataManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
