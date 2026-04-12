import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Guid, Result } from '@stevenkellner/typescript-common-functionality';
import { User } from '@stevenkellner/team-conduct-api';
import { routeNames } from '../../app.routes';
import { FirebaseFunctionsService } from '../../services/firebase-functions/firebase-functions.service';
import { RandomDataGeneratorService } from '../../services/random-data-generator/random-data-generator.service';
import { SignInService } from '../../services/sign-in/sign-in.service';
import { AppStateManagerService } from '../../services/app-state-manager/app-state-manager.service';
import { SignInLeftPanelComponent, SignInPanelComponent } from './index';
import { SignInColorScheme, SIGN_IN_THEME } from './sign-in-theme';
import { AuthProvider, FormRegisterResult, FormSubmitResult } from './types';
import { AppleAuthProvider, GoogleAuthProvider, UsernamePasswordAuthProvider } from './auth-providers';

@Component({
    selector: 'page-sign-in',
    imports: [SignInLeftPanelComponent, SignInPanelComponent],
    templateUrl: './sign-in.page.html',
    styleUrl: './sign-in.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInPage implements OnInit {

    private readonly titleService = inject(Title);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly firebaseFunctions = inject(FirebaseFunctionsService);
    private readonly signInService = inject(SignInService);
    private readonly routerService = inject(Router);
    private readonly appStateManager = inject(AppStateManagerService);
    private readonly randomDataGeneratorService = inject(RandomDataGeneratorService);
    public readonly signInPanel = viewChild('signInPanel');
    private readonly signInPanelComponent = viewChild(SignInPanelComponent);

    public readonly usernamePasswordAuth = new UsernamePasswordAuthProvider(
        this.signInService,
        this.cdr,
        () => this.registerMode
    );
    public readonly googleAuth = new GoogleAuthProvider(this.signInService, this.cdr);
    public readonly appleAuth = new AppleAuthProvider(this.signInService, this.cdr);

    public registerMode: AuthProvider | null = null;
    public passwordShown = true;
    public registerButtonShown = false;
    public cancelButtonDisabled = false;

    public get colors(): SignInColorScheme {
        return SIGN_IN_THEME;
    }

    public get usernamePasswordFormErrorMessage(): string | null {
        return this.usernamePasswordAuth.errorMessage;
    }

    public get googleSignInErrorMessage(): string | null {
        return this.googleAuth.errorMessage;
    }

    public get appleSignInErrorMessage(): string | null {
        return this.appleAuth.errorMessage;
    }

    public ngOnInit() {
        this.titleService.setTitle($localize `:Sign In Page Title:Sign In - Team Conduct`);
    }

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

    public async onGoogleSignInClicked(): Promise<void> {
        await this.handleThirdPartySignIn(this.googleAuth);
    }

    public async onAppleSignInClicked(): Promise<void> {
        await this.handleThirdPartySignIn(this.appleAuth);
    }

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

        this.exitRegisterMode();
        this.finishRegistration();

        this.appStateManager.setUser(registerResult.value);
        await this.routerService.navigate([`/${routeNames.userDashboard}`]);
    }

    public onRegisterFormCancel(): void {
        this.exitRegisterMode();
    }

    public scrollToLogin() {
        const panel = this.signInPanel();
        if (panel && panel instanceof ElementRef) {
            panel.nativeElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    private async handleThirdPartySignIn(authProvider: GoogleAuthProvider | AppleAuthProvider): Promise<void> {
        this.signInPanelComponent()?.markUsernamePasswordFormAsUndirty();
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
        this.appStateManager.setUser(loginResult.value);
        await this.routerService.navigate([`/${routeNames.userDashboard}`]);
    }

    private clearAllErrors(): void {
        this.usernamePasswordAuth.clearError();
        this.googleAuth.clearError();
        this.appleAuth.clearError();
    }

    private getSignInType(email: string | null): User.SignInType {
        if (this.registerMode === 'username-password') {
            if (email === null) {
                throw new Error('Email must be present for email/password registration.');
            }

            return new User.SignInType.Email(email);
        }

        return new User.SignInType.OAuth(this.registerMode === 'google' ? 'google' : 'apple');
    }

    private finishAuthentication(provider: AuthProvider): void {
        this.setLoadingState(provider, false);
        this.cdr.markForCheck();
    }

    private finishRegistration(): void {
        this.setLoadingState('username-password', false);
        this.cancelButtonDisabled = false;
        this.cdr.markForCheck();
    }

    private isAnyLoading(): boolean {
        return this.usernamePasswordAuth.loading
            || this.googleAuth.loading
            || this.appleAuth.loading;
    }

    private enterRegisterMode(source: AuthProvider): void {
        this.registerMode = source;
        this.registerButtonShown = true;

        if (source !== 'username-password') {
            this.signInPanelComponent()?.clearUsernamePassword();
            this.passwordShown = false;
        }

        if (source === 'username-password') {
            this.usernamePasswordAuth.stopLoading();
        } else if (source === 'google') {
            this.googleAuth.stopLoading();
        } else {
            this.appleAuth.stopLoading();
        }

        this.usernamePasswordAuth.setDisabled(false);
        this.googleAuth.setDisabled(true);
        this.appleAuth.setDisabled(true);

        this.cdr.markForCheck();
    }

    private exitRegisterMode(): void {
        this.registerMode = null;
        this.registerButtonShown = false;
        this.cancelButtonDisabled = false;
        this.passwordShown = true;

        this.usernamePasswordAuth.setDisabled(false);
        this.usernamePasswordAuth.stopLoading();
        this.googleAuth.setDisabled(false);
        this.googleAuth.stopLoading();
        this.appleAuth.setDisabled(false);
        this.appleAuth.stopLoading();

        this.cdr.markForCheck();
    }

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
}
