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
    public usernamePasswordFormError: UsernamePasswordError | null = null;
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
            this.usernamePasswordFormError = authResult.error === 'wrong-password'
                ? 'wrong-password'
                : 'internal-error';
            this.handleAuthenticationEnd('username-password');
            return;
        }

        const loginResult = await this.firebaseFunctions.functions.user.login.executeWithResult(null);

        if (Result.isFailure(loginResult)) {
            if (loginResult.error.code === 'not-found') {
                this.usernamePasswordFormError = null;
                this.enterRegisterMode('username-password');
                return;
            } else {
                this.usernamePasswordFormError = 'internal-error';
            }
            this.handleAuthenticationEnd('username-password');
            return;
        }

        this.handleAuthenticationEnd('username-password');
        // TODO: Navigate to home page
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

        const signInType = this.getSignInType(event.username);
        const registerResult = await this.firebaseFunctions.functions.user.register.executeWithResult({
            userId: User.Id.builder.build(event.username),
            signInType: signInType
        });

        if (Result.isFailure(registerResult)) {
            this.usernamePasswordFormError = registerResult.error.code === 'already-exists'
                ? 'username-taken'
                : 'internal-error';
            this.handleRegistrationEnd();
            return;
        }

        this.exitRegisterMode();
        this.handleRegistrationEnd();
        // TODO: Navigate to home page
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

        if (Result.isFailure(authResult)) {
            this.googleSignInError = this.mapAuthErrorToThirdPartyError(authResult.error);
            this.handleAuthenticationEnd('google');
            return;
        }

        const loginResult = await this.firebaseFunctions.functions.user.login.executeWithResult(null);

        if (Result.isFailure(loginResult)) {
            if (loginResult.error.code === 'not-found') {
                this.googleSignInError = null;
                this.enterRegisterMode('google');
                return;
            } else {
                this.googleSignInError = 'internal-error';
            }
            this.handleAuthenticationEnd('google');
            return;
        }

        this.handleAuthenticationEnd('google');
        // TODO: Navigate to home page
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
            this.appleSignInError = this.mapAuthErrorToThirdPartyError(authResult.error);
            this.handleAuthenticationEnd('apple');
            return;
        }

        const loginResult = await this.firebaseFunctions.functions.user.login.executeWithResult(null);

        if (Result.isFailure(loginResult)) {
            if (loginResult.error.code === 'not-found') {
                this.appleSignInError = null;
                this.enterRegisterMode('apple');
                return;
            } else {
                this.appleSignInError = 'internal-error';
            }
            this.handleAuthenticationEnd('apple');
            return;
        }

        this.handleAuthenticationEnd('apple');
        // TODO: Navigate to home page
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
     * Maps authentication errors to third-party error types
     */
    private mapAuthErrorToThirdPartyError(error: 'popup-cancelled' | 'popup-blocked' | 'wrong-password' | 'unknown'): ThirdPartyError {
        return (error === 'popup-cancelled' || error === 'popup-blocked') ? 'popup-closed' : 'internal-error';
    }

    /**
     * Gets the appropriate sign-in type based on register mode
     */
    private getSignInType(username: string): User.SignInType {
        if (this.registerMode === 'username-password') {
            return new User.SignInTypeEmail(`${username}@team-conduct.com`);
        }
        return new User.SignInTypeOAuth(this.registerMode === 'google' ? 'google' : 'apple');
    }

    /**
     * Handles common cleanup after authentication attempt
     */
    private handleAuthenticationEnd(provider: AuthProvider): void {
        this.stopLoading(provider);
        this.cdr.markForCheck();
    }

    /**
     * Handles common cleanup after registration attempt
     */
    private handleRegistrationEnd(): void {
        this.cancelButtonDisabled = false;
        this.stopLoading('username-password');
        this.cdr.markForCheck();
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
        this.usernamePasswordFormDisabled = false;
        this.googleSignInDisabled = true;
        this.appleSignInDisabled = true;

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

        this.cdr.markForCheck();
    }

    /**
     * Exits registration mode and returns to normal sign-in state
     */
    private exitRegisterMode(): void {
        this.registerMode = null;
        this.registerButtonShown = false;
        this.cancelButtonDisabled = false;

        this.passwordShown = true;

        // Enable all methods
        this.usernamePasswordFormDisabled = false;
        this.googleSignInDisabled = false;
        this.appleSignInDisabled = false;
        this.usernamePasswordFormLoading = false;
        this.googleSignInLoading = false;
        this.appleSignInLoading = false;

        this.cdr.markForCheck();
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
                if (this.registerMode === null || this.registerMode === 'username-password') {
                    return $localize`:Generic username/password sign-in error@@usernamePasswordInvalid:Invalid username or password. Please try again.`;
                } else {
                    return $localize`:Generic username/password registration error@@usernamePasswordRegisterInvalid:Invalid username. Please try again.`;
                }
            case 'internal-error':
                return $localize`:Internal error message@@internalError:An internal error occurred. Please try again later.`;
            case 'not-registered':
                if (this.registerMode) {
                    return $localize`:Not registered message in register mode@@notRegisteredRegisterMode:Click Register to create your account.`;
                }
                return $localize`:Not registered message@@notRegistered:This account is not registered. Click Sign in again to register.`;
            case 'wrong-password':
                return $localize`:Wrong password error@@wrongPassword:Incorrect password for the given username. Please input the correct password and try again.`;
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
                return $localize`:Google sign-in internal error@@googleInternalError:An internal error occurred with Google sign in. Please try again later.`;
            case 'popup-closed':
                return $localize`:Google sign-in popup closed error@@googlePopupClosed:Google sign in was cancelled. Please try again.`;
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
                return $localize`:Apple sign-in internal error@@appleInternalError:An internal error occurred with Apple sign in. Please try again later.`;
            case 'popup-closed':
                return $localize`:Apple sign-in popup closed error@@applePopupClosed:Apple sign in was cancelled. Please try again.`;
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

