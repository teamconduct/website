import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { AppStateManagerService } from './app-state-manager.service';

describe('AppStateManagerService', () => {
  let service: AppStateManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: jasmine.createSpyObj('Firestore', ['collection']) }
      ]
    });
    service = TestBed.inject(AppStateManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
