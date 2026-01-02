import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInUsernamePasswordFormComponent } from './sign-in-username-password-form.component';

describe('SignInUsernamePasswordFormComponent', () => {
  let component: SignInUsernamePasswordFormComponent;
  let fixture: ComponentFixture<SignInUsernamePasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInUsernamePasswordFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignInUsernamePasswordFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
