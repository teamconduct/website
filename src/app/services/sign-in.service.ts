import { inject, Injectable } from '@angular/core';
import { AppleAuthProvider, AuthService, EmailAuthProvider, GoogleAuthProvider, IAuthProvider } from './auth.service';
import { FormControl, FormGroup } from '@angular/forms';
import { markAllAsDirty } from '../../utils/markAllAsDirty';
import { AuthErrorCodes } from '@angular/fire/auth';

export type SignInState = 'email' | 'google' | 'apple';

export type SignInErrorCode = typeof AuthErrorCodes[keyof typeof AuthErrorCodes];

export interface ISignInProvider {

    state: SignInState;

    error: 'validation-failed' | string | null;

    checkValidation: () => Promise<boolean> | boolean;

    getAuthProvider: () => IAuthProvider;

    cleanup: () => Promise<void> | void;

    handleAuthError(code: SignInErrorCode | null): void;
}

export class EmailSignInProvider implements ISignInProvider {

    public readonly state: SignInState = 'email';

    public error: 'validation-failed' |'wrong-password' | 'unknown' | null = null;

    public constructor(
        private readonly loginForm: FormGroup<{
            email: FormControl<string | null>;
            password: FormControl<string |null>;
        }>
    ) {}

    public checkValidation(): boolean {
        markAllAsDirty(this.loginForm);
        return !this.loginForm.invalid;
    }

    public getAuthProvider(): IAuthProvider {
        return new EmailAuthProvider(this.loginForm.value.email!, this.loginForm.value.password!);
    }

    public cleanup() {
        this.loginForm.reset();
    }

    public handleAuthError(code: SignInErrorCode | null) {
        if (code === 'auth/wrong-password')
            this.error = 'wrong-password';
        else
            this.error = 'unknown';
    }
}

export class GoogleSignInProvider implements ISignInProvider {

    public readonly state: SignInState = 'google';

    public error: 'validation-failed' | 'popup-canceled' | 'popup-blocked' | 'unknown' | null = null;

    public checkValidation(): boolean {
        return true;
    }

    public getAuthProvider(): IAuthProvider {
        return new GoogleAuthProvider();
    }

    public cleanup() {}

    public handleAuthError(code: SignInErrorCode | null) {
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request')
            this.error = 'popup-canceled';
        else if (code === 'auth/popup-blocked')
            this.error = 'popup-blocked';
        else
            this.error = 'unknown';
    }
}

export class AppleSignInProvider implements ISignInProvider {

    public readonly state: SignInState = 'apple';

    public error: 'validation-failed' | 'popup-canceled' | 'popup-blocked' | 'unknown' | null = null;

    public checkValidation(): boolean {
        return true;
    }

    public getAuthProvider(): IAuthProvider {
        return new AppleAuthProvider();
    }

    public cleanup() {}

    public handleAuthError(code: SignInErrorCode | null) {
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request')
            this.error = 'popup-canceled';
        else if (code === 'auth/popup-blocked')
            this.error = 'popup-blocked';
        else
            this.error = 'unknown';
    }
}

@Injectable({
    providedIn: 'root'
})
export class SignInService {

    public state: SignInState | null = null;

    private handleSuccessfulSignIn: (() => Promise<void> | void) | null = null;

    private authService = inject(AuthService);

    public setHandleSuccessfulSignIn(handleSuccessfulSignIn: () => Promise<void> | void) {
        this.handleSuccessfulSignIn = handleSuccessfulSignIn;
    }

    private async auth(provider: ISignInProvider): Promise<'succeeded' | 'failed'> {
        try {
            const authProvider = provider.getAuthProvider();
            await this.authService.signIn(authProvider);
        } catch (error) {
            let errorCode: SignInErrorCode | null = null;
            if (typeof error === 'object' && error !== null &&'code' in error && typeof error.code === 'string')
                errorCode = error.code as SignInErrorCode;
            provider.handleAuthError(errorCode);
            return 'failed';
        }
        return 'succeeded';
    }

    public async signIn(provider: ISignInProvider) {
        if (this.state !== null)
            return;
        provider.error = null;
        const isValid = await provider.checkValidation();
        if (!isValid) {
            provider.error = 'validation-failed';
            return;
        }
        this.state = provider.state;

        const authResult = await this.auth(provider);
        if (authResult === 'failed') {
            this.state = null;
            return;
        }

        if (this.handleSuccessfulSignIn !== null)
            await this.handleSuccessfulSignIn();

        await provider.cleanup();
        this.state = null;
    }
}
