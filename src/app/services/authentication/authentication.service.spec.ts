import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: jasmine.createSpyObj('Auth', ['signInWithEmailAndPassword']) }
      ]
    });
    service = TestBed.inject(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
