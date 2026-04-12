import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { DataManagerService } from './data-manager.service';

describe('DataManagerService', () => {
  let service: DataManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: jasmine.createSpyObj('Firestore', ['collection']) }
      ]
    });
    service = TestBed.inject(DataManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
