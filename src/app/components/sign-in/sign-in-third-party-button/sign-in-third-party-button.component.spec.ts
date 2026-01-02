import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInThirdPartyButtonComponent } from './sign-in-third-party-button.component';

describe('SignInThirdPartyButtonComponent', () => {
  let component: SignInThirdPartyButtonComponent;
  let fixture: ComponentFixture<SignInThirdPartyButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInThirdPartyButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignInThirdPartyButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
