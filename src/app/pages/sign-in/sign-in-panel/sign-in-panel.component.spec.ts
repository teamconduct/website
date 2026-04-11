import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faKey, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { SignInPanelComponent } from './sign-in-panel.component';

describe('SignInPanelComponent', () => {
  let component: SignInPanelComponent;
  let fixture: ComponentFixture<SignInPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInPanelComponent]
    }).compileComponents();

    const iconLibrary = TestBed.inject(FaIconLibrary);
    iconLibrary.addIcons(faLock, faKey, faUser);

    fixture = TestBed.createComponent(SignInPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the submitted email and password intent', () => {
    const emitSpy = spyOn(component.usernamePasswordFormSubmit, 'emit');

    component.onUsernamePasswordFormSubmit({ email: 'jane@example.com', password: 'password123' });

    expect(emitSpy).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'password123' });
  });

  it('should emit the registration cancel intent', () => {
    const emitSpy = spyOn(component.registerFormCancel, 'emit');

    component.onRegisterFormCancel();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should expose helper methods for the page-controlled auth flow', () => {
    fixture.detectChanges();

    component.clearUsernamePassword();
    component.markUsernamePasswordFormAsUndirty();

    expect(component).toBeTruthy();
  });
});
