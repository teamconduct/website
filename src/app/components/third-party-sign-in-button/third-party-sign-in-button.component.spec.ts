import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdPartySignInButtonComponent } from './third-party-sign-in-button.component';

describe('ThirdPartySignInButtonComponent', () => {
  let component: ThirdPartySignInButtonComponent;
  let fixture: ComponentFixture<ThirdPartySignInButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThirdPartySignInButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThirdPartySignInButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
