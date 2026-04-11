import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { SignInUsernamePasswordFormComponent } from './sign-in-username-password-form.component';

describe('SignInUsernamePasswordFormComponent', () => {
  let component: SignInUsernamePasswordFormComponent;
  let fixture: ComponentFixture<SignInUsernamePasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInUsernamePasswordFormComponent]
    }).compileComponents();

    const iconLibrary = TestBed.inject(FaIconLibrary);
    iconLibrary.addIconPacks(fas);

    fixture = TestBed.createComponent(SignInUsernamePasswordFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty controls', () => {
    expect(component.loginForm.get('firstName')?.value).toBeNull();
    expect(component.loginForm.get('lastName')?.value).toBeNull();
    expect(component.loginForm.get('email')?.value).toBeNull();
    expect(component.loginForm.get('password')?.value).toBeNull();
  });

  it('should emit input-invalid when login fields are invalid', () => {
    spyOn(component.onLogin, 'emit');

    component.login();

    expect(component.onLogin.emit).toHaveBeenCalledWith('input-invalid');
    expect(component.emailErrorMessage).toContain('Email is required to log in');
  });

  it('should emit email and password when login fields are valid', () => {
    spyOn(component.onLogin, 'emit');
    component.loginForm.patchValue({
      email: 'person@example.com',
      password: 'password123'
    });

    component.login();

    expect(component.onLogin.emit).toHaveBeenCalledWith({
      email: 'person@example.com',
      password: 'password123'
    });
  });

  it('should show an invalid email error for malformed email addresses', () => {
    component.loginForm.get('email')!.setValue('invalid-email');
    component.loginForm.get('email')!.markAsDirty();

    expect(component.emailErrorMessage).toContain('Please enter a valid email address');
  });

  it('should require first and last name in register mode', () => {
    fixture.componentRef.setInput('registerButtonShown', true);

    component.register();

    expect(component.firstNameErrorMessage).toContain('first name');
    expect(component.lastNameErrorMessage).toContain('last name');
  });

  it('should emit registration details for email/password registration', () => {
    fixture.componentRef.setInput('registerButtonShown', true);
    fixture.componentRef.setInput('passwordShown', true);
    spyOn(component.onRegister, 'emit');
    component.loginForm.patchValue({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'password123'
    });

    component.register();

    expect(component.onRegister.emit).toHaveBeenCalledWith({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'password123'
    });
  });

  it('should emit only names for third-party registration', () => {
    fixture.componentRef.setInput('registerButtonShown', true);
    fixture.componentRef.setInput('passwordShown', false);
    spyOn(component.onRegister, 'emit');
    component.loginForm.patchValue({
      firstName: 'Jane',
      lastName: 'Doe'
    });

    component.register();

    expect(component.onRegister.emit).toHaveBeenCalledWith({
      firstName: 'Jane',
      lastName: 'Doe',
      email: null,
      password: null
    });
  });

  it('should emit cancel when the cancel button is clicked', () => {
    spyOn(component.onRegisterCancel, 'emit');

    component.cancelRegister();

    expect(component.onRegisterCancel.emit).toHaveBeenCalled();
  });

  it('should mark the form as pristine when markAsUndirty is called', () => {
    component.loginForm.markAllAsDirty();

    component.markAsUndirty();

    expect(component.loginForm.pristine).toBeTrue();
  });

  it('should hide the email field for third-party registration', () => {
    fixture.componentRef.setInput('registerButtonShown', true);
    fixture.componentRef.setInput('passwordShown', false);

    expect(component.emailShown).toBeFalse();
  });
});
