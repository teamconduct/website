import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, viewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { SignInThirdPartyButtonComponent } from '../sign-in-third-party-button/sign-in-third-party-button.component';
import { SignInUsernamePasswordFormComponent } from '../sign-in-username-password-form/sign-in-username-password-form.component';
import { ErrorMessageComponent } from '../../error-message/error-message.component';
import { FirebaseFunctionsService } from '../../../services/firebase-functions/firebase-functions.service';
import { SIGN_IN_THEME, SignInColorScheme } from '../sign-in-theme';
import {
    AuthProvider,
    UsernamePasswordError,
    ThirdPartyError,
    FormSubmitResult,
    FormRegisterResult
} from '../types';
import { SignInService } from '../../../services/sign-in/sign-in.service';
import { AppleSignInProvider, EmailSignInProvider, GoogleSignInProvider } from '../../../services/sign-in/providers';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { User } from '@stevenkellner/team-conduct-api';

/**
 * Main sign-in panel component
 * Orchestrates the sign-in/registration flow with username/password and third-party authentication
 */
@Component({
    selector: 'app-sign-in-panel',
    imports: [
        FontAwesomeModule,
        ErrorMessageComponent,
        SignInThirdPartyButtonComponent,
        ButtonModule,
        SignInUsernamePasswordFormComponent
    ],
    templateUrl: './sign-in-panel.component.html',
    styleUrl: './sign-in-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPanelComponent {

    private readonly cdr = inject(ChangeDetectorRef);
    private readonly firebaseFunctions = inject(FirebaseFunctionsService);
    private readonly signInService = inject(SignInService);
    private readonly usernamePasswordForm = viewChild.required<SignInUsernamePasswordFormComponent>('usernamePasswordForm');

    // Loading states
    public usernamePasswordFormLoading = false;
    public googleSignInLoading = false;
    public appleSignInLoading = false;

    // Disabled states
    public usernamePasswordFormDisabled = false;
    public googleSignInDisabled = false;
    public appleSignInDisabled = false;

    // Error states
    private usernamePasswordFormError: UsernamePasswordError | null = null;
    private googleSignInError: ThirdPartyError | null = null;
    private appleSignInError: ThirdPartyError | null = null;

    // UI states
    public registerMode: AuthProvider | null = null;
    public passwordShown = true;
    public registerButtonShown = false;
    public cancelButtonDisabled = false;

    public get colors(): SignInColorScheme {
        return SIGN_IN_THEME;
    }

    /**
     * Handles username/password form submission
     */
    public async onUsernamePasswordFormSubmit(event: FormSubmitResult): Promise<void> {
        this.resetErrors();

        if (event === 'input-invalid') {
            this.usernamePasswordFormError = 'username-password-invalid';
            return;
        }

        if (this.isLoading() || this.usernamePasswordFormDisabled) {
            return;
        }

        this.startLoading('username-password');

        const signInProvider = new EmailSignInProvider(`${event.username}@team-conduct.com`, event.password);
        const authResult = await this.signInService.auth(signInProvider);
        if (Result.isFailure(authResult)) {
            switch (authResult.error) {
            case 'wrong-password':
                this.usernamePasswordFormError = 'username-password-invalid';
                break;
            case 'unknown':
                this.usernamePasswordFormError = 'internal-error';
                break;
            }
            this.stopLoading('username-password');
            this.cdr.markForCheck();
            return;
        }

        const loginResult = await this.firebaseFunctions.functions.user.login.executeWithResult(null);
        if (Result.isFailure(loginResult)) {
            switch (loginResult.error.code) {
            case 'unauthenticated':
                this.usernamePasswordFormError = 'internal-error';
                this.stopLoading('username-password');
                this.cdr.markForCheck();
                return;
            case 'not-found':
                this.usernamePasswordFormError = null;
                this.enterRegisterMode('username-password');
                this.stopLoading('username-password');
                this.cdr.markForCheck();
                return;
            default:
                this.usernamePasswordFormError = 'internal-error';
                this.stopLoading('username-password');
                this.cdr.markForCheck();
                return;
            }
        }

        this.stopLoading('username-password');
        this.cdr.markForCheck();

        console.log('Login with username-password successful');
        // TODO: navigate to home page
    }

    /**
     * Handles username/password registration form submission
     */
    public async onUsernamePasswordFormRegister(event: FormRegisterResult): Promise<void> {
        this.resetErrors();

        if (event === 'input-invalid') {
            this.usernamePasswordFormError = 'username-password-invalid';
            return;
        }

        if (this.isLoading() || this.usernamePasswordFormDisabled || this.registerMode === null) {
            return;
        }

        this.startLoading('username-password');
        this.cancelButtonDisabled = true;

        let signInType: User.SignInType;
        if (this.registerMode === 'username-password') {
            signInType = new User.SignInTypeEmail(`${event.username}@team-conduct.com`);
        } else if (this.registerMode === 'google') {
            signInType = new User.SignInTypeOAuth('google');
        } else /* this.registerMode === 'apple' */ {
            signInType = new User.SignInTypeOAuth('apple');
        }
        const registerResult = await this.firebaseFunctions.functions.user.register.executeWithResult({
            userId: User.Id.builder.build(event.username),
            signInType: signInType
        });
        if (Result.isFailure(registerResult)) {
            switch (registerResult.error.code) {
            case 'unauthenticated':
                this.usernamePasswordFormError = 'internal-error';
                break;
            case 'already-exists':
                this.usernamePasswordFormError = 'username-taken';
                break;
            default:
                this.usernamePasswordFormError = 'internal-error';
                break;
            }
            this.cancelButtonDisabled = false;
            this.stopLoading('username-password');
            this.cdr.markForCheck();
            return;
        }

        this.exitRegisterMode();
        this.stopLoading('username-password');
        this.cancelButtonDisabled = false;
        this.cdr.markForCheck();

        console.log('Registration with username-password successful');
        // Navigate to home page
    }

    /**
     * Handles registration cancellation
     */
    public onUsernamePasswordFormRegisterCancel(): void {
        this.exitRegisterMode();
    }

    /**
     * Handles Google sign-in button click
     */
    public async onGoogleSignInClicked(): Promise<void> {
        this.usernamePasswordForm().markAsUndirty();
        this.resetErrors();

        if (this.isLoading() || this.googleSignInDisabled) {
            return;
        }

        this.startLoading('google');

        const signInProvider = new GoogleSignInProvider();
        const authResult = await this.signInService.auth(signInProvider);
        console.log('Google auth result:', authResult);
        if (Result.isFailure(authResult)) {
            switch (authResult.error) {
            case 'popup-cancelled':
            case 'popup-blocked':
                this.googleSignInError = 'popup-closed';
                break;
            case 'unknown':
                this.googleSignInError = 'internal-error';
                break;
            }
            this.stopLoading('google');
            this.cdr.markForCheck();
            return;
        }

        const loginResult = await this.firebaseFunctions.functions.user.login.executeWithResult(null);
        console.log('Login result after Google sign-in:', loginResult);
        if (Result.isFailure(loginResult)) {
            switch (loginResult.error.code) {
            case 'unauthenticated':
                this.googleSignInError = 'internal-error';
                this.stopLoading('google');
                this.cdr.markForCheck();
                return;
            case 'not-found':
                this.googleSignInError = null;
                this.enterRegisterMode('google');
                this.stopLoading('google');
                this.cdr.markForCheck();
                return;
            default:
                this.googleSignInError = 'internal-error';
                this.stopLoading('google');
                this.cdr.markForCheck();
                return;
            }
        }
        this.stopLoading('google');
        this.cdr.markForCheck();

        console.log('Login with Google successful');
        // TODO: navigate to home page
    }

    /**
     * Handles Apple sign-in button click
     */
    public async onAppleSignInClicked(): Promise<void> {
        this.usernamePasswordForm().markAsUndirty();
        this.resetErrors();

        if (this.isLoading() || this.appleSignInDisabled) {
            return;
        }

        this.startLoading('apple');

        const signInProvider = new AppleSignInProvider();
        const authResult = await this.signInService.auth(signInProvider);
        if (Result.isFailure(authResult)) {
            switch (authResult.error) {
            case 'popup-cancelled':
            case 'popup-blocked':
                this.appleSignInError = 'popup-closed';
                break;
            case 'unknown':
                this.appleSignInError = 'internal-error';
                break;
            }
            this.stopLoading('apple');
            this.cdr.markForCheck();
            return;
        }

        const loginResult = await this.firebaseFunctions.functions.user.login.executeWithResult(null);
        if (Result.isFailure(loginResult)) {
            switch (loginResult.error.code) {
            case 'unauthenticated':
                this.appleSignInError = 'internal-error';
                this.stopLoading('apple');
                this.cdr.markForCheck();
                return;
            case 'not-found':
                this.appleSignInError = null;
                this.enterRegisterMode('apple');
                this.stopLoading('apple');
                this.cdr.markForCheck();
                return;
            default:
                this.appleSignInError = 'internal-error';
                this.stopLoading('apple');
                this.cdr.markForCheck();
                return;
            }
        }
        this.stopLoading('apple');

        console.log('Login with Apple successful');
        this.cdr.markForCheck();
        // TODO: navigate to home page
    }

    /**
     * Resets all error states
     */
    private resetErrors(): void {
        this.usernamePasswordFormError = null;
        this.googleSignInError = null;
        this.appleSignInError = null;
    }

    /**
     * Checks if any authentication method is currently loading
     */
    private isLoading(): boolean {
        return this.usernamePasswordFormLoading
            || this.googleSignInLoading
            || this.appleSignInLoading;
    }

    /**
     * Enters registration mode for a specific authentication provider
     * @param source The authentication provider that triggered registration mode
     */
    private enterRegisterMode(source: AuthProvider): void {
        this.registerMode = source;
        this.registerButtonShown = true;

        if (source === 'google' || source === 'apple') {
            // Clear password but keep username, hide password field
            this.usernamePasswordForm().loginForm.get('password')?.setValue(null);
            this.passwordShown = false;
        }

        // Keep other methods disabled, stop loading
        if (source === 'username-password') {
            this.usernamePasswordFormLoading = false;
        } else if (source === 'google') {
            this.googleSignInLoading = false;
        } else if (source === 'apple') {
            this.appleSignInLoading = false;
        }
    }

    /**
     * Exits registration mode and returns to normal sign-in state
     */
    private exitRegisterMode(): void {
        this.registerMode = null;
        this.registerButtonShown = false;
        this.cancelButtonDisabled = false;

        if (!this.passwordShown) {
            // Was in third-party register mode - clear username, show password
            this.usernamePasswordForm().loginForm.reset();
            this.passwordShown = true;
        }

        // Enable all methods
        this.usernamePasswordFormDisabled = false;
        this.googleSignInDisabled = false;
        this.appleSignInDisabled = false;
        this.usernamePasswordFormLoading = false;
        this.googleSignInLoading = false;
        this.appleSignInLoading = false;
    }

    /**
     * Starts loading state for a specific authentication method
     * Disables other methods while one is loading
     * @param type The authentication provider type
     */
    private startLoading(type: AuthProvider): void {
        switch (type) {
            case 'username-password':
                this.usernamePasswordFormLoading = true;
                this.googleSignInDisabled = true;
                this.appleSignInDisabled = true;
                break;
            case 'google':
                this.googleSignInLoading = true;
                this.usernamePasswordFormDisabled = true;
                this.appleSignInDisabled = true;
                break;
            case 'apple':
                this.appleSignInLoading = true;
                this.usernamePasswordFormDisabled = true;
                this.googleSignInDisabled = true;
                break;
        }
    }

    /**
     * Stops loading state for a specific authentication method
     * Re-enables other methods after loading completes
     * @param type The authentication provider type
     */
    private stopLoading(type: AuthProvider): void {
        switch (type) {
            case 'username-password':
                this.usernamePasswordFormLoading = false;
                this.googleSignInDisabled = false;
                this.appleSignInDisabled = false;
                break;
            case 'google':
                this.googleSignInLoading = false;
                this.usernamePasswordFormDisabled = false;
                this.appleSignInDisabled = false;
                break;
            case 'apple':
                this.appleSignInLoading = false;
                this.usernamePasswordFormDisabled = false;
                this.googleSignInDisabled = false;
                break;
        }
    }

    /**
     * Gets the error message for username/password form
     */
    public get usernamePasswordFormErrorMessage(): string | null {
        switch (this.usernamePasswordFormError) {
            case 'username-password-invalid':
                return $localize`:Generic username/password sign-in error@@usernamePasswordInvalid:Invalid username or password. Please try again.`;
            case 'internal-error':
                return $localize`:Internal error message@@internalError:An internal error occurred. Please try again later.`;
            case 'not-registered':
                if (this.registerMode) {
                    return $localize`:Not registered message in register mode@@notRegisteredRegisterMode:Click Register to create your account.`;
                }
                return $localize`:Not registered message@@notRegistered:This account is not registered. Click Sign in again to register.`;
            case 'wrong-password':
                return $localize`:Wrong password error@@wrongPassword:Incorrect password. Please try again.`;
            case 'username-taken':
                return $localize`:Username taken error@@usernameTaken:The username is already taken. Please choose a different one.`;
            case null:
                return null;
        }
    }

    /**
     * Gets the error message for Google sign-in
     */
    public get googleSignInErrorMessage(): string | null {
        switch (this.googleSignInError) {
            case 'internal-error':
                return $localize`:Google sign-in internal error@@googleInternalError:An internal error occurred with Google sign-in. Please try again later.`;
            case 'popup-closed':
                return $localize`:Google sign-in popup closed error@@googlePopupClosed:Google sign-in was cancelled. Please try again.`;
            case null:
                return null;
        }
    }

    /**
     * Gets the error message for Apple sign-in
     */
    public get appleSignInErrorMessage(): string | null {
        switch (this.appleSignInError) {
            case 'internal-error':
                return $localize`:Apple sign-in internal error@@appleInternalError:An internal error occurred with Apple sign-in. Please try again later.`;
            case 'popup-closed':
                return $localize`:Apple sign-in popup closed error@@applePopupClosed:Apple sign-in was cancelled. Please try again.`;
            case null:
                return null;
        }
    }

    /**
     * Shows terms of service (to be implemented)
     */
    public shownTermsOfService(): void {
        // TODO: Implement terms of service display
    }

    /**
     * Shows privacy policy (to be implemented)
     */
    public showPrivacyPolicy(): void {
        // TODO: Implement privacy policy display
    }
}

