import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Functions } from '@angular/fire/functions';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faKey, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { NotificationProperties, User } from '@stevenkellner/team-conduct-api';
import { Guid, Result, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunctionsService } from '../../../services/firebase-functions/firebase-functions.service';
import { RandomDataGeneratorService } from '../../../services/random-data-generator/random-data-generator.service';
import { SignInService } from '../../../services/sign-in/sign-in.service';
import { SignInPanelComponent } from './sign-in-panel.component';

describe('SignInPanelComponent', () => {
  let component: SignInPanelComponent;
  let fixture: ComponentFixture<SignInPanelComponent>;
  let mockFirebaseFunctions: {
    functions: {
      user: {
        login: { executeWithResult: jasmine.Spy };
        register: { executeWithResult: jasmine.Spy };
      };
    };
  };
  let mockSignInService: {
    auth: jasmine.Spy;
  };
  let mockRandomDataGeneratorService: {
    createDevelopmentTeamsForNewUser: jasmine.Spy;
  };

  const registeredUser = new User(
    User.Id.builder.build(Guid.generate().flatten),
    UtcDate.now,
    new User.SignInType.Email('jane@example.com'),
    new User.Properties('Jane', 'Doe'),
    new User.Settings(new NotificationProperties())
  );

  beforeEach(async () => {
    mockFirebaseFunctions = {
      functions: {
        user: {
          login: { executeWithResult: jasmine.createSpy('login').and.returnValue(Promise.resolve(Result.success(registeredUser))) },
          register: { executeWithResult: jasmine.createSpy('register').and.returnValue(Promise.resolve(Result.success(registeredUser))) }
        }
      }
    };

    mockSignInService = {
      auth: jasmine.createSpy('auth').and.returnValue(Promise.resolve(Result.success(null)))
    };

    mockRandomDataGeneratorService = {
      createDevelopmentTeamsForNewUser: jasmine.createSpy('createDevelopmentTeamsForNewUser').and.returnValue(Promise.resolve())
    };

    await TestBed.configureTestingModule({
      imports: [SignInPanelComponent],
      providers: [
        { provide: Functions, useValue: jasmine.createSpyObj('Functions', ['httpsCallable']) },
        { provide: FirebaseFunctionsService, useValue: mockFirebaseFunctions },
        { provide: SignInService, useValue: mockSignInService },
        { provide: RandomDataGeneratorService, useValue: mockRandomDataGeneratorService }
      ]
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

  it('should authenticate with the submitted email and password', async () => {
    mockFirebaseFunctions.functions.user.login.executeWithResult.and.returnValue(Promise.resolve(Result.failure({ code: 'not-found' })));

    await component.onUsernamePasswordFormSubmit({ email: 'jane@example.com', password: 'password123' });

    expect(mockSignInService.auth).toHaveBeenCalled();
    expect(component.registerMode).toBe('username-password');
  });

  it('should show an invalid credentials message for invalid sign-in input', async () => {
    await component.onUsernamePasswordFormSubmit('input-invalid');

    expect(component.usernamePasswordFormErrorMessage).toContain('Invalid email or password');
  });

  it('should register an email/password user with names and a generated user id', async () => {
    component.registerMode = 'username-password';

    await component.onRegisterFormSubmit({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'password123'
    });

    const registerArgs = mockFirebaseFunctions.functions.user.register.executeWithResult.calls.mostRecent().args[0];
    expect(registerArgs.firstName).toBe('Jane');
    expect(registerArgs.lastName).toBe('Doe');
    expect(registerArgs.signInType.flatten).toEqual({ type: 'email', email: 'jane@example.com' });
    expect(registerArgs.userId.flatten).toMatch(/^[0-9a-f-]{36}$/);
    expect(mockRandomDataGeneratorService.createDevelopmentTeamsForNewUser).toHaveBeenCalled();
  });

  it('should use an oauth sign-in type for third-party registration', async () => {
    component.registerMode = 'google';

    await component.onRegisterFormSubmit({
      firstName: 'Jane',
      lastName: 'Doe',
      email: null,
      password: null
    });

    const registerArgs = mockFirebaseFunctions.functions.user.register.executeWithResult.calls.mostRecent().args[0];
    expect(registerArgs.signInType.flatten).toEqual({ type: 'google' });
  });

  it('should return an email-specific not-registered message', () => {
    component.usernamePasswordAuth.setError('not-registered');

    expect(component.usernamePasswordFormErrorMessage).toContain('email address');
  });
});
