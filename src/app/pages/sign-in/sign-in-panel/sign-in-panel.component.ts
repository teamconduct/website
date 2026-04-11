import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, viewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { SignInThirdPartyButtonComponent } from '../sign-in-third-party-button/sign-in-third-party-button.component';
import { SignInUsernamePasswordFormComponent } from '../sign-in-username-password-form/sign-in-username-password-form.component';
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component';
import { FirebaseFunctionsService } from '../../../services/firebase-functions/firebase-functions.service';
import { SIGN_IN_THEME, SignInColorScheme } from '../sign-in-theme';
import { AuthProvider, FormSubmitResult, FormRegisterResult } from '../types';
import { SignInService } from '../../../services/sign-in/sign-in.service';
import { Guid, Result } from '@stevenkellner/typescript-common-functionality';
import { User } from '@stevenkellner/team-conduct-api';
import { Router } from '@angular/router';
import { routeNames } from '../../../app.routes';
import { UserManagerService } from '../../../services/user-manager/user-manager.service';
import { RandomDataGeneratorService } from '../../../services/random-data-generator/random-data-generator.service';
import { AppleAuthProvider, GoogleAuthProvider, UsernamePasswordAuthProvider } from './auth-providers';

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
    private readonly routerService = inject(Router);
    private readonly userManager = inject(UserManagerService);
    private readonly randomDataGeneratorService = inject(RandomDataGeneratorService);
    private readonly usernamePasswordForm = viewChild.required<SignInUsernamePasswordFormComponent>('usernamePasswordForm');

    // Authentication providers
    public readonly usernamePasswordAuth = new UsernamePasswordAuthProvider(
        this.signInService,
        this.cdr,
        () => this.registerMode
    );
    public readonly googleAuth = new GoogleAuthProvider(this.signInService, this.cdr);
    public readonly appleAuth = new AppleAuthProvider(this.signInService, this.cdr);

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
        this.clearAllErrors();

        if (event === 'input-invalid') {
            this.usernamePasswordAuth.setError('username-password-invalid');
            return;
        }

        if (this.isAnyLoading() || this.usernamePasswordAuth.disabled) {
            return;
        }

        this.setLoadingState('username-password', true);

        const authResult = await this.usernamePasswordAuth.authenticate(event.email, event.password);

        if (Result.isFailure(authResult)) {
            this.usernamePasswordAuth.setError(authResult.error === 'wrong-password'
                ? 'wrong-password'
                : 'internal-error');
            this.finishAuthentication('username-password');
            return;
        }

        await this.completeLoginFlow('username-password');
    }

    /**
     * Handles Google sign-in button click
     */
    public async onGoogleSignInClicked(): Promise<void> {
        await this.handleThirdPartySignIn(this.googleAuth);
    }

    /**
     * Handles Apple sign-in button click
     */
    public async onAppleSignInClicked(): Promise<void> {
        await this.handleThirdPartySignIn(this.appleAuth);
    }

    /**
     * Handles third-party authentication flow (Google/Apple)
     */
    private async handleThirdPartySignIn(authProvider: GoogleAuthProvider | AppleAuthProvider): Promise<void> {
        this.usernamePasswordForm().markAsUndirty();
        this.clearAllErrors();

        if (this.isAnyLoading() || authProvider.disabled) {
            return;
        }

        this.setLoadingState(authProvider.providerType, true);

        const authResult = await authProvider.authenticate();

        if (Result.isFailure(authResult)) {
            authProvider.setError(authProvider.mapAuthError(authResult.error));
            this.finishAuthentication(authProvider.providerType);
            return;
        }

        await this.completeLoginFlow(authProvider.providerType);
    }

    /**
     * Handles registration form submission for all authentication providers
     * (username/password, Google, Apple)
     */
    public async onRegisterFormSubmit(event: FormRegisterResult): Promise<void> {
        this.clearAllErrors();

        if (event === 'input-invalid') {
            this.usernamePasswordAuth.setError('username-password-invalid');
            return;
        }

        if (this.isAnyLoading() || this.usernamePasswordAuth.disabled || this.registerMode === null) {
            return;
        }

        this.setLoadingState('username-password', true);
        this.cancelButtonDisabled = true;

        const signInType = this.getSignInType(event.email);
        const registerResult = await this.firebaseFunctions.functions.user.register.executeWithResult({
            userId: User.Id.builder.build(Guid.generate().flatten),
            signInType: signInType,
            firstName: event.firstName,
            lastName: event.lastName
        });
        if (Result.isFailure(registerResult)) {
            this.usernamePasswordAuth.setError(registerResult.error.code === 'already-exists'
                ? 'username-taken'
                : 'internal-error');
            this.finishRegistration();
            return;
        }

        try {
            await this.randomDataGeneratorService.createDevelopmentTeamsForNewUser();
        } catch {
            this.usernamePasswordAuth.setError('internal-error');
            this.finishRegistration();
            return;
        }

        const loginResult = await this.firebaseFunctions.functions.user.login.executeWithResult(null);
        if (Result.isFailure(loginResult)) {
            this.usernamePasswordAuth.setError('internal-error');
            this.finishRegistration();
            return;
        }

        this.exitRegisterMode();
        this.finishRegistration();

        this.userManager.setUser(loginResult.value);
        await this.routerService.navigate([`/${routeNames.userDashboard}`]);
    }

    /**
     * Handles registration cancellation
     */
    public onRegisterFormCancel(): void {
        this.exitRegisterMode();
    }

    /**
     * Completes the login flow after successful authentication
     * Handles user login, registration mode entry on not-found, and navigation on success
     */
    private async completeLoginFlow(provider: AuthProvider): Promise<void> {
        const loginResult = await this.firebaseFunctions.functions.user.login.executeWithResult(null);

        if (Result.isFailure(loginResult)) {
            if (loginResult.error.code === 'not-found') {
                if (provider === 'username-password') {
                    this.usernamePasswordAuth.clearError();
                } else if (provider === 'google') {
                    this.googleAuth.clearError();
                } else {
                    this.appleAuth.clearError();
                }
                this.enterRegisterMode(provider);
                return;
            }

            if (provider === 'username-password') {
                this.usernamePasswordAuth.setError('internal-error');
            } else if (provider === 'google') {
                this.googleAuth.setError('internal-error');
            } else {
                this.appleAuth.setError('internal-error');
            }
            this.finishAuthentication(provider);
            return;
        }

        this.finishAuthentication(provider);
        this.userManager.setUser(loginResult.value);
        await this.routerService.navigate([`/${routeNames.userDashboard}`]);
    }

    /**
     * Clears all error states across all authentication methods
     */
    private clearAllErrors(): void {
        this.usernamePasswordAuth.clearError();
        this.googleAuth.clearError();
        this.appleAuth.clearError();
    }

    /**
     * Gets the appropriate sign-in type based on register mode
     */
    private getSignInType(email: string | null): User.SignInType {
        if (this.registerMode === 'username-password') {
            if (email === null) {
                throw new Error('Email must be present for email/password registration.');
            }

            return new User.SignInType.Email(email);
        }
        return new User.SignInType.OAuth(this.registerMode === 'google' ? 'google' : 'apple');
    }

    /**
     * Finishes authentication attempt and updates UI state
     */
    private finishAuthentication(provider: AuthProvider): void {
        this.setLoadingState(provider, false);
        this.cdr.markForCheck();
    }

    /**
     * Finishes registration attempt and updates UI state
     */
    private finishRegistration(): void {
        this.cancelButtonDisabled = false;
        this.setLoadingState('username-password', false);
        this.cdr.markForCheck();
    }

    /**
     * Checks if any authentication method is currently in loading state
     */
    private isAnyLoading(): boolean {
        return this.usernamePasswordAuth.loading
            || this.googleAuth.loading
            || this.appleAuth.loading;
    }

    /**
     * Enters registration mode for a specific authentication provider
     * @param source The authentication provider that triggered registration mode
     */
    private enterRegisterMode(source: AuthProvider): void {
        this.registerMode = source;
        this.registerButtonShown = true;

        if (source !== 'username-password') {
            // Clear password and switch the form into name-only registration
            this.usernamePasswordForm().loginForm.get('password')?.setValue(null);
            this.passwordShown = false;
        }

        // Stop loading for the source provider
        if (source === 'username-password') {
            this.usernamePasswordAuth.stopLoading();
        } else if (source === 'google') {
            this.googleAuth.stopLoading();
        } else {
            this.appleAuth.stopLoading();
        }

        // Keep form enabled, but disable other methods
        this.usernamePasswordAuth.setDisabled(false);
        this.googleAuth.setDisabled(true);
        this.appleAuth.setDisabled(true);

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

        // Enable all methods and stop loading
        this.usernamePasswordAuth.setDisabled(false);
        this.usernamePasswordAuth.stopLoading();
        this.googleAuth.setDisabled(false);
        this.googleAuth.stopLoading();
        this.appleAuth.setDisabled(false);
        this.appleAuth.stopLoading();

        this.cdr.markForCheck();
    }

    /**
     * Sets loading state for a specific authentication method
     * @param provider The authentication provider type
     * @param isLoading Whether to start or stop loading
     */
    private setLoadingState(provider: AuthProvider, isLoading: boolean): void {
        switch (provider) {
            case 'username-password':
                if (isLoading) {
                    this.usernamePasswordAuth.startLoading();
                } else {
                    this.usernamePasswordAuth.stopLoading();
                }
                this.googleAuth.setDisabled(isLoading);
                this.appleAuth.setDisabled(isLoading);
                break;
            case 'google':
                if (isLoading) {
                    this.googleAuth.startLoading();
                } else {
                    this.googleAuth.stopLoading();
                }
                this.usernamePasswordAuth.setDisabled(isLoading);
                this.appleAuth.setDisabled(isLoading);
                break;
            case 'apple':
                if (isLoading) {
                    this.appleAuth.startLoading();
                } else {
                    this.appleAuth.stopLoading();
                }
                this.usernamePasswordAuth.setDisabled(isLoading);
                this.googleAuth.setDisabled(isLoading);
                break;
        }
    }

    /**
     * Gets the error message for username/password form
     */
    public get usernamePasswordFormErrorMessage(): string | null {
        return this.usernamePasswordAuth.errorMessage;
    }

    /**
     * Gets the error message for Google sign-in
     */
    public get googleSignInErrorMessage(): string | null {
        return this.googleAuth.errorMessage;
    }

    /**
     * Gets the error message for Apple sign-in
     */
    public get appleSignInErrorMessage(): string | null {
        return this.appleAuth.errorMessage;
    }

    /**
     * Displays terms of service (to be implemented)
     */
    public showTermsOfService(): void {
        // TODO: Implement terms of service display
    }

    /**
     * Displays privacy policy (to be implemented)
     */
    public showPrivacyPolicy(): void {
        // TODO: Implement privacy policy display
    }
}

