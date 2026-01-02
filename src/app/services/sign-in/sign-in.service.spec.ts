import { TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { SignInService } from './sign-in.service';

describe('SignInService', () => {
  let service: SignInService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: jasmine.createSpyObj('Auth', ['signInWithPopup']) }
      ]
    });
    service = TestBed.inject(SignInService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
