import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Functions } from '@angular/fire/functions';
import { RandomDataGeneratorService } from './random-data-generator.service';

describe('RandomDataGeneratorService', () => {
  let service: RandomDataGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: jasmine.createSpyObj('Firestore', ['collection']) },
        { provide: Functions, useValue: jasmine.createSpyObj('Functions', ['httpsCallable']) }
      ]
    });
    service = TestBed.inject(RandomDataGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
