import { inject, Injectable } from '@angular/core';
import { ISignInProvider, SignInErrorCode } from './providers/ISignInProvider';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
    providedIn: 'root'
})
export class SignInService {

    public currentProviderType: string | null = null;

    private authenticationService = inject(AuthenticationService);

    private async auth<ErrorState extends string>(provider: ISignInProvider<ErrorState>): Promise<'succeeded' | 'failed'> {
        try {
            const authProvider = provider.getAuthProvider();
            await this.authenticationService.signIn(authProvider);
        } catch (error) {
            let errorCode: SignInErrorCode | null = null;
            if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string')
                errorCode = error.code as SignInErrorCode;
            provider.handleAuthError(errorCode);
            return 'failed';
        }
        return 'succeeded';
    }

    public async signIn<ErrorState extends string>(provider: ISignInProvider<ErrorState>, onSuccessfulSignIn: (() => Promise<string | null> | string | null) | null = null): Promise<void> {
        if (this.currentProviderType !== null)
            return;
        provider.error = null;
        const isValid = await provider.checkValidation();
        if (!isValid) {
            provider.error = 'validation-failed';
            return;
        }
        this.currentProviderType = provider.type;

        const authResult = await this.auth(provider);
        if (authResult === 'failed') {
            this.currentProviderType = null;
            return;
        }
        if (onSuccessfulSignIn !== null) {
            const errorMessage = await onSuccessfulSignIn();
            if (errorMessage !== null)
                provider.error = { message: errorMessage };
        }

        await provider.cleanup();
        this.currentProviderType = null;
    }
}
