import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Functions } from '@angular/fire/functions';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faLock, faKey, faUser } from '@fortawesome/free-solid-svg-icons';
import { SignInPanelComponent } from './sign-in-panel.component';

describe('SignInPanelComponent', () => {
  let component: SignInPanelComponent;
  let fixture: ComponentFixture<SignInPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInPanelComponent],
      providers: [
        { provide: Functions, useValue: jasmine.createSpyObj('Functions', ['httpsCallable']) }
      ]
    })
    .compileComponents();

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

  describe('Initial State', () => {
    it('should initialize with no loading states', () => {
      expect(component.usernamePasswordFormLoading).toBeFalse();
      expect(component.googleSignInLoading).toBeFalse();
      expect(component.appleSignInLoading).toBeFalse();
    });

    it('should initialize with no disabled states', () => {
      expect(component.usernamePasswordFormDisabled).toBeFalse();
      expect(component.googleSignInDisabled).toBeFalse();
      expect(component.appleSignInDisabled).toBeFalse();
    });

    it('should initialize with password shown', () => {
      expect(component.passwordShown).toBeTrue();
    });

    it('should initialize without register button shown', () => {
      expect(component.registerButtonShown).toBeFalse();
    });

    it('should initialize with register mode false', () => {
      expect(component.registerMode).toBeFalse();
    });
  });

  describe('Username/Password Sign-In', () => {
    it('should handle input-invalid error', async () => {
      await component.onUsernamePasswordFormSubmit('input-invalid');
      expect(component.usernamePasswordFormErrorMessage).toContain('Invalid username or password');
    });

    it('should set loading states when signing in', async () => {
      const promise = component.onUsernamePasswordFormSubmit({ username: 'test', password: 'password123' });
      expect(component.usernamePasswordFormLoading).toBeTrue();
      expect(component.googleSignInDisabled).toBeTrue();
      expect(component.appleSignInDisabled).toBeTrue();
      await promise;
    });

    it('should clear loading states after sign-in completes', async () => {
      await component.onUsernamePasswordFormSubmit({ username: 'test', password: 'password123' });
      expect(component.usernamePasswordFormLoading).toBeFalse();
      expect(component.googleSignInDisabled).toBeFalse();
      expect(component.appleSignInDisabled).toBeFalse();
    });

    it('should not proceed if already loading', async () => {
      component.usernamePasswordFormLoading = true;
      const initialLoading = component.usernamePasswordFormLoading;
      await component.onUsernamePasswordFormSubmit({ username: 'test', password: 'password123' });
      expect(component.usernamePasswordFormLoading).toBe(initialLoading);
    });

    it('should not proceed if disabled', async () => {
      component.usernamePasswordFormDisabled = true;
      await component.onUsernamePasswordFormSubmit({ username: 'test', password: 'password123' });
      expect(component.usernamePasswordFormLoading).toBeFalse();
    });

    it('should reset errors before sign-in', async () => {
      component['usernamePasswordFormError'] = 'username-password-invalid';
      await component.onUsernamePasswordFormSubmit({ username: 'test', password: 'password123' });
      expect(component['usernamePasswordFormError']).toBeNull();
    });
  });

  describe('Username/Password Registration', () => {
    it('should handle input-invalid error during registration', async () => {
      await component.onUsernamePasswordFormRegister('input-invalid');
      expect(component.usernamePasswordFormErrorMessage).toContain('Invalid username or password');
    });

    it('should set loading and disable cancel button when registering', async () => {
      const promise = component.onUsernamePasswordFormRegister({ username: 'test', password: 'password123' });
      expect(component.usernamePasswordFormLoading).toBeTrue();
      expect(component.cancelButtonDisabled).toBeTrue();
      await promise;
    });

    it('should clear loading and enable cancel button after registration', async () => {
      await component.onUsernamePasswordFormRegister({ username: 'test', password: 'password123' });
      expect(component.usernamePasswordFormLoading).toBeFalse();
      expect(component.cancelButtonDisabled).toBeFalse();
    });

    it('should handle registration with null password', async () => {
      await component.onUsernamePasswordFormRegister({ username: 'test', password: null });
      expect(component.usernamePasswordFormLoading).toBeFalse();
    });

    it('should not proceed if already loading', async () => {
      component.usernamePasswordFormLoading = true;
      component.cancelButtonDisabled = false;
      await component.onUsernamePasswordFormRegister({ username: 'test', password: 'password123' });
      expect(component.cancelButtonDisabled).toBeFalse();
    });
  });

  describe('Register Mode', () => {
    it('should exit register mode on cancel', () => {
      component.registerMode = true;
      component.registerButtonShown = true;
      component.onUsernamePasswordFormRegisterCancel();
      expect(component.registerMode).toBeFalse();
      expect(component.registerButtonShown).toBeFalse();
    });

    it('should enable all methods when exiting register mode', () => {
      component.registerMode = true;
      component.usernamePasswordFormDisabled = true;
      component.googleSignInDisabled = true;
      component.appleSignInDisabled = true;
      component.onUsernamePasswordFormRegisterCancel();
      expect(component.usernamePasswordFormDisabled).toBeFalse();
      expect(component.googleSignInDisabled).toBeFalse();
      expect(component.appleSignInDisabled).toBeFalse();
    });

    it('should reset form when exiting third-party register mode', () => {
      component.registerMode = true;
      component.passwordShown = false;
      component['usernamePasswordForm']().loginForm.patchValue({ username: 'test', password: null });
      component.onUsernamePasswordFormRegisterCancel();
      expect(component.passwordShown).toBeTrue();
      expect(component['usernamePasswordForm']().loginForm.get('username')?.value).toBeNull();
    });

    it('should not reset form when exiting username/password register mode', () => {
      component.registerMode = true;
      component.passwordShown = true;
      component['usernamePasswordForm']().loginForm.patchValue({ username: 'test', password: 'pass' });
      component.onUsernamePasswordFormRegisterCancel();
      expect(component['usernamePasswordForm']().loginForm.get('username')?.value).toBe('test');
    });
  });

  describe('Google Sign-In', () => {
    it('should mark form as undirty when clicking Google sign-in', async () => {
      component['usernamePasswordForm']().loginForm.markAllAsDirty();
      await component.onGoogleSignInClicked();
      expect(component['usernamePasswordForm']().loginForm.pristine).toBeTrue();
    });

    it('should set loading states when signing in with Google', async () => {
      const promise = component.onGoogleSignInClicked();
      expect(component.googleSignInLoading).toBeTrue();
      expect(component.usernamePasswordFormDisabled).toBeTrue();
      expect(component.appleSignInDisabled).toBeTrue();
      await promise;
    });

    it('should clear loading states after Google sign-in completes', async () => {
      await component.onGoogleSignInClicked();
      expect(component.googleSignInLoading).toBeFalse();
      expect(component.usernamePasswordFormDisabled).toBeFalse();
      expect(component.appleSignInDisabled).toBeFalse();
    });

    it('should not proceed if already loading', async () => {
      component.googleSignInLoading = true;
      const initialLoading = component.googleSignInLoading;
      await component.onGoogleSignInClicked();
      expect(component.googleSignInLoading).toBe(initialLoading);
    });

    it('should not proceed if disabled', async () => {
      component.googleSignInDisabled = true;
      await component.onGoogleSignInClicked();
      expect(component.googleSignInLoading).toBeFalse();
    });

    it('should reset errors before Google sign-in', async () => {
      component['googleSignInError'] = 'internal-error';
      await component.onGoogleSignInClicked();
      expect(component['googleSignInError']).toBeNull();
    });
  });

  describe('Apple Sign-In', () => {
    it('should mark form as undirty when clicking Apple sign-in', async () => {
      component['usernamePasswordForm']().loginForm.markAllAsDirty();
      await component.onAppleSignInClicked();
      expect(component['usernamePasswordForm']().loginForm.pristine).toBeTrue();
    });

    it('should set loading states when signing in with Apple', async () => {
      const promise = component.onAppleSignInClicked();
      expect(component.appleSignInLoading).toBeTrue();
      expect(component.usernamePasswordFormDisabled).toBeTrue();
      expect(component.googleSignInDisabled).toBeTrue();
      await promise;
    });

    it('should clear loading states after Apple sign-in completes', async () => {
      await component.onAppleSignInClicked();
      expect(component.appleSignInLoading).toBeFalse();
      expect(component.usernamePasswordFormDisabled).toBeFalse();
      expect(component.googleSignInDisabled).toBeFalse();
    });

    it('should not proceed if already loading', async () => {
      component.appleSignInLoading = true;
      const initialLoading = component.appleSignInLoading;
      await component.onAppleSignInClicked();
      expect(component.appleSignInLoading).toBe(initialLoading);
    });

    it('should not proceed if disabled', async () => {
      component.appleSignInDisabled = true;
      await component.onAppleSignInClicked();
      expect(component.appleSignInLoading).toBeFalse();
    });

    it('should reset errors before Apple sign-in', async () => {
      component['appleSignInError'] = 'internal-error';
      await component.onAppleSignInClicked();
      expect(component['appleSignInError']).toBeNull();
    });
  });

  describe('Error Messages', () => {
    it('should return null for no username/password error', () => {
      component['usernamePasswordFormError'] = null;
      expect(component.usernamePasswordFormErrorMessage).toBeNull();
    });

    it('should return message for username-password-invalid error', () => {
      component['usernamePasswordFormError'] = 'username-password-invalid';
      expect(component.usernamePasswordFormErrorMessage).toContain('Invalid username or password');
    });

    it('should return message for internal-error', () => {
      component['usernamePasswordFormError'] = 'internal-error';
      expect(component.usernamePasswordFormErrorMessage).toContain('internal error');
    });

    it('should return message for not-registered error', () => {
      component['usernamePasswordFormError'] = 'not-registered';
      component.registerMode = false;
      expect(component.usernamePasswordFormErrorMessage).toContain('not registered');
    });

    it('should return different message for not-registered in register mode', () => {
      component['usernamePasswordFormError'] = 'not-registered';
      component.registerMode = true;
      expect(component.usernamePasswordFormErrorMessage).toContain('Click Register');
    });

    it('should return null for no Google error', () => {
      component['googleSignInError'] = null;
      expect(component.googleSignInErrorMessage).toBeNull();
    });

    it('should return message for Google internal-error', () => {
      component['googleSignInError'] = 'internal-error';
      expect(component.googleSignInErrorMessage).toContain('Google');
    });

    it('should return null for no Apple error', () => {
      component['appleSignInError'] = null;
      expect(component.appleSignInErrorMessage).toBeNull();
    });

    it('should return message for Apple internal-error', () => {
      component['appleSignInError'] = 'internal-error';
      expect(component.appleSignInErrorMessage).toContain('Apple');
    });
  });

  describe('Colors Getter', () => {
    it('should return color configuration', () => {
      const colors = component.colors;
      expect(colors['highlight-background']).toBe('#667eea');
      expect(colors['highlight-text']).toBe('#FFFFFF');
      expect(colors.text).toBe('#202020');
    });
  });
});
