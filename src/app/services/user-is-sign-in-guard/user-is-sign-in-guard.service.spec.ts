import { TestBed } from '@angular/core/testing';

import { UserIsSignInGuardService } from './user-is-sign-in-guard.service';

describe('UserIsSignInGuardService', () => {
  let service: UserIsSignInGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserIsSignInGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
