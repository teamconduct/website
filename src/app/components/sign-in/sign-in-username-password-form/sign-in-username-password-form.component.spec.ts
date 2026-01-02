import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignInUsernamePasswordFormComponent } from './sign-in-username-password-form.component';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

describe('SignInUsernamePasswordFormComponent', () => {
  let component: SignInUsernamePasswordFormComponent;
  let fixture: ComponentFixture<SignInUsernamePasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInUsernamePasswordFormComponent]
    })
    .compileComponents();

    // Register FontAwesome icons
    const library = TestBed.inject(FaIconLibrary);
    library.addIconPacks(fas);

    fixture = TestBed.createComponent(SignInUsernamePasswordFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with empty form controls', () => {
      expect(component.loginForm.get('username')?.value).toBeNull();
      expect(component.loginForm.get('password')?.value).toBeNull();
    });

    it('should have pristine form initially', () => {
      expect(component.loginForm.pristine).toBeTruthy();
    });

    it('should have invalid form when empty', () => {
      expect(component.loginForm.invalid).toBeTruthy();
    });
  });

  describe('Username Validation', () => {
    it('should require username', () => {
      const username = component.loginForm.get('username')!;
      username.setValue('');
      expect(username.hasError('required')).toBeTruthy();
    });

    it('should accept valid username', () => {
      const username = component.loginForm.get('username')!;
      username.setValue('validUser123');
      expect(username.valid).toBeTruthy();
    });

    it('should reject username shorter than 4 characters', () => {
      const username = component.loginForm.get('username')!;
      username.setValue('abc');
      expect(username.hasError('pattern')).toBeTruthy();
    });

    it('should reject username longer than 24 characters', () => {
      const username = component.loginForm.get('username')!;
      username.setValue('a'.repeat(25));
      expect(username.hasError('pattern')).toBeTruthy();
    });

    it('should reject username starting with special character', () => {
      const username = component.loginForm.get('username')!;
      username.setValue('.invalidUser');
      expect(username.hasError('pattern')).toBeTruthy();
    });

    it('should reject username ending with special character', () => {
      const username = component.loginForm.get('username')!;
      username.setValue('invalidUser_');
      expect(username.hasError('pattern')).toBeTruthy();
    });

    it('should reject username with consecutive special characters', () => {
      const username = component.loginForm.get('username')!;
      username.setValue('invalid..user');
      expect(username.hasError('pattern')).toBeTruthy();
    });

    it('should accept username with dots, hyphens, and underscores', () => {
      const username = component.loginForm.get('username')!;
      username.setValue('valid.user-name_123');
      expect(username.valid).toBeTruthy();
    });
  });

  describe('Password Validation', () => {
    it('should require password', () => {
      const password = component.loginForm.get('password')!;
      password.setValue('');
      expect(password.hasError('required')).toBeTruthy();
    });

    it('should reject password shorter than 8 characters', () => {
      const password = component.loginForm.get('password')!;
      password.setValue('short');
      expect(password.hasError('minlength')).toBeTruthy();
    });

    it('should accept password with 8 or more characters', () => {
      const password = component.loginForm.get('password')!;
      password.setValue('validPassword123');
      expect(password.valid).toBeTruthy();
    });
  });

  describe('Login Functionality', () => {
    it('should emit input-invalid when form is invalid', () => {
      spyOn(component.onLogin, 'emit');
      component.login();
      expect(component.onLogin.emit).toHaveBeenCalledWith('input-invalid');
    });

    it('should emit credentials when form is valid', () => {
      spyOn(component.onLogin, 'emit');
      component.loginForm.patchValue({
        username: 'testUser',
        password: 'password123'
      });
      component.login();
      expect(component.onLogin.emit).toHaveBeenCalledWith({
        username: 'testUser',
        password: 'password123'
      });
    });

    it('should mark form as dirty when login is called', () => {
      component.login();
      expect(component.loginForm.dirty).toBeTruthy();
    });

    it('should not emit when loading', () => {
      spyOn(component.onLogin, 'emit');
      fixture.componentRef.setInput('loading', true);
      component.loginForm.patchValue({
        username: 'testUser',
        password: 'password123'
      });
      component.login();
      expect(component.onLogin.emit).not.toHaveBeenCalled();
    });

    it('should not emit when disabled', () => {
      spyOn(component.onLogin, 'emit');
      fixture.componentRef.setInput('disabled', true);
      component.loginForm.patchValue({
        username: 'testUser',
        password: 'password123'
      });
      component.login();
      expect(component.onLogin.emit).not.toHaveBeenCalled();
    });

    it('should not emit when register button is shown', () => {
      spyOn(component.onLogin, 'emit');
      fixture.componentRef.setInput('registerButtonShown', true);
      component.loginForm.patchValue({
        username: 'testUser',
        password: 'password123'
      });
      component.login();
      expect(component.onLogin.emit).not.toHaveBeenCalled();
    });
  });

  describe('Register Functionality', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('registerButtonShown', true);
      fixture.componentRef.setInput('passwordShown', true);
    });

    it('should emit input-invalid when form is invalid', () => {
      spyOn(component.onRegister, 'emit');
      component.register();
      expect(component.onRegister.emit).toHaveBeenCalledWith('input-invalid');
    });

    it('should emit credentials with password when form is valid', () => {
      spyOn(component.onRegister, 'emit');
      component.loginForm.patchValue({
        username: 'newUser',
        password: 'password123'
      });
      component.register();
      expect(component.onRegister.emit).toHaveBeenCalledWith({
        username: 'newUser',
        password: 'password123'
      });
    });

    it('should emit credentials with null password when password hidden', () => {
      fixture.componentRef.setInput('passwordShown', false);
      spyOn(component.onRegister, 'emit');
      component.loginForm.patchValue({
        username: 'newUser'
      });
      component.register();
      expect(component.onRegister.emit).toHaveBeenCalledWith({
        username: 'newUser',
        password: null
      });
    });

    it('should not emit when loading', () => {
      spyOn(component.onRegister, 'emit');
      fixture.componentRef.setInput('loading', true);
      component.loginForm.patchValue({
        username: 'newUser',
        password: 'password123'
      });
      component.register();
      expect(component.onRegister.emit).not.toHaveBeenCalled();
    });

    it('should not emit when disabled', () => {
      spyOn(component.onRegister, 'emit');
      fixture.componentRef.setInput('disabled', true);
      component.loginForm.patchValue({
        username: 'newUser',
        password: 'password123'
      });
      component.register();
      expect(component.onRegister.emit).not.toHaveBeenCalled();
    });

    it('should not emit when register button not shown', () => {
      fixture.componentRef.setInput('registerButtonShown', false);
      spyOn(component.onRegister, 'emit');
      component.loginForm.patchValue({
        username: 'newUser',
        password: 'password123'
      });
      component.register();
      expect(component.onRegister.emit).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Register', () => {
    it('should emit cancel event', () => {
      spyOn(component.onRegisterCancel, 'emit');
      component.cancelRegister();
      expect(component.onRegisterCancel.emit).toHaveBeenCalled();
    });

    it('should not emit when cancel button is disabled', () => {
      spyOn(component.onRegisterCancel, 'emit');
      fixture.componentRef.setInput('cancelButtonDisabled', true);
      component.cancelRegister();
      expect(component.onRegisterCancel.emit).not.toHaveBeenCalled();
    });
  });

  describe('markAsUndirty', () => {
    it('should mark form as pristine', () => {
      component.loginForm.markAllAsDirty();
      component.markAsUndirty();
      expect(component.loginForm.pristine).toBeTruthy();
    });

    it('should mark loginFormWithoutPassword as pristine', () => {
      component.loginFormWithoutPassword.markAllAsDirty();
      component.markAsUndirty();
      expect(component.loginFormWithoutPassword.pristine).toBeTruthy();
    });
  });

  describe('Error Messages', () => {
    describe('Username Error Messages', () => {
      it('should return null when username is valid', () => {
        component.loginForm.patchValue({ username: 'validUser' });
        component.loginForm.get('username')!.markAsDirty();
        expect(component.usernameErrorMessage).toBeNull();
      });

      it('should return required error message', () => {
        component.loginForm.get('username')!.setValue('');
        component.loginForm.get('username')!.markAsDirty();
        expect(component.usernameErrorMessage).toBeTruthy();
        expect(component.usernameErrorMessage).toContain('required');
      });

      it('should return length error message for short username', () => {
        component.loginForm.get('username')!.setValue('abc');
        component.loginForm.get('username')!.markAsDirty();
        expect(component.usernameErrorMessage).toBeTruthy();
        expect(component.usernameErrorMessage).toContain('4 and 24');
      });

      it('should return length error message for long username', () => {
        component.loginForm.get('username')!.setValue('a'.repeat(25));
        component.loginForm.get('username')!.markAsDirty();
        expect(component.usernameErrorMessage).toBeTruthy();
        expect(component.usernameErrorMessage).toContain('4 and 24');
      });

      it('should return character error message for invalid characters', () => {
        component.loginForm.get('username')!.setValue('user@name');
        component.loginForm.get('username')!.markAsDirty();
        expect(component.usernameErrorMessage).toBeTruthy();
        expect(component.usernameErrorMessage).toContain('letters, numbers');
      });

      it('should return start/end error message', () => {
        component.loginForm.get('username')!.setValue('.username');
        component.loginForm.get('username')!.markAsDirty();
        expect(component.usernameErrorMessage).toBeTruthy();
        expect(component.usernameErrorMessage).toContain('start and end');
      });

      it('should return consecutive special characters error message', () => {
        component.loginForm.get('username')!.setValue('user..name');
        component.loginForm.get('username')!.markAsDirty();
        expect(component.usernameErrorMessage).toBeTruthy();
        expect(component.usernameErrorMessage).toContain('consecutive');
      });
    });

    describe('Password Error Messages', () => {
      it('should return null when password is valid', () => {
        fixture.componentRef.setInput('passwordShown', true);
        component.loginForm.patchValue({ password: 'validPassword123' });
        component.loginForm.get('password')!.markAsDirty();
        expect(component.passwordErrorMessage).toBeNull();
      });

      it('should return null when password is hidden', () => {
        fixture.componentRef.setInput('passwordShown', false);
        component.loginForm.get('password')!.setValue('');
        component.loginForm.get('password')!.markAsDirty();
        expect(component.passwordErrorMessage).toBeNull();
      });

      it('should return required error message', () => {
        fixture.componentRef.setInput('passwordShown', true);
        component.loginForm.get('password')!.setValue('');
        component.loginForm.get('password')!.markAsDirty();
        expect(component.passwordErrorMessage).toBeTruthy();
        expect(component.passwordErrorMessage).toContain('required');
      });

      it('should return minlength error message', () => {
        fixture.componentRef.setInput('passwordShown', true);
        component.loginForm.get('password')!.setValue('short');
        component.loginForm.get('password')!.markAsDirty();
        expect(component.passwordErrorMessage).toBeTruthy();
        expect(component.passwordErrorMessage).toContain('8 characters');
      });
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

  describe('loginFormWithoutPassword Getter', () => {
    it('should return form group with only username', () => {
      const formWithoutPassword = component.loginFormWithoutPassword;
      expect(formWithoutPassword.get('username')).toBeTruthy();
      expect(formWithoutPassword.get('password')).toBeFalsy();
    });

    it('should share username control with main form', () => {
      component.loginForm.patchValue({ username: 'testUser' });
      expect(component.loginFormWithoutPassword.get('username')?.value).toBe('testUser');
    });
  });

  describe('UI Element Visibility', () => {
    it('should show password input when passwordShown is true', () => {
      fixture.componentRef.setInput('passwordShown', true);
      fixture.detectChanges();
      const passwordInput = fixture.nativeElement.querySelector('#password-input');
      expect(passwordInput).toBeTruthy();
    });

    it('should hide password input when passwordShown is false', () => {
      fixture.componentRef.setInput('passwordShown', false);
      fixture.detectChanges();
      const passwordInput = fixture.nativeElement.querySelector('#password-input');
      expect(passwordInput).toBeFalsy();
    });

    it('should show sign-in button when registerButtonShown is false', () => {
      fixture.componentRef.setInput('registerButtonShown', false);
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('p-button');
      expect(buttons.length).toBe(1);
    });

    it('should show cancel and register buttons when registerButtonShown is true', () => {
      fixture.componentRef.setInput('registerButtonShown', true);
      fixture.detectChanges();
      const buttons = fixture.nativeElement.querySelectorAll('p-button');
      expect(buttons.length).toBe(2);
    });

    it('should show register button as Sign in when registerButtonShown is true', () => {
      fixture.componentRef.setInput('registerButtonShown', true);
      fixture.detectChanges();
      const buttonTexts = fixture.nativeElement.querySelectorAll('p-button p');
      const signInButton = Array.from(buttonTexts).find((el: any) => el.textContent.includes('Sign in'));
      expect(signInButton).toBeTruthy();
    });

    it('should show Cancel button when registerButtonShown is true', () => {
      fixture.componentRef.setInput('registerButtonShown', true);
      fixture.detectChanges();
      const buttonTexts = fixture.nativeElement.querySelectorAll('p-button p');
      const cancelButton = Array.from(buttonTexts).find((el: any) => el.textContent.includes('Cancel'));
      expect(cancelButton).toBeTruthy();
    });
  });
});
