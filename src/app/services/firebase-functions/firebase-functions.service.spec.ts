import { TestBed } from '@angular/core/testing';
import { Functions } from '@angular/fire/functions';
import { FirebaseFunctionsService } from './firebase-functions.service';

describe('FirebaseFunctionsService', () => {
    let service: FirebaseFunctionsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Functions, useValue: jasmine.createSpyObj('Functions', ['httpsCallable']) }
            ]
        });
        service = TestBed.inject(FirebaseFunctionsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
