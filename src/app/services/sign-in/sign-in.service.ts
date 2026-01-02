import { inject, Injectable } from '@angular/core';
import { ISignInProvider, SignInErrorCode } from './providers/ISignInProvider';
import { AuthenticationService } from '../authentication/authentication.service';
import { Result } from '@stevenkellner/typescript-common-functionality';

@Injectable({
    providedIn: 'root'
})
export class SignInService {

    private authenticationService = inject(AuthenticationService);

    public async auth<ErrorState extends string>(provider: ISignInProvider<ErrorState>): Promise<Result<void, ErrorState>> {
        try {
            const authProvider = provider.getAuthProvider();
            await this.authenticationService.signIn(authProvider);
        } catch (error) {
            let errorCode: SignInErrorCode | null = null;
            if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string')
                errorCode = error.code as SignInErrorCode;
            const errorState = provider.handleAuthError(errorCode);
            if (errorState !== null)
                return Result.failure(errorState);
        }
        return Result.success();
    }
}
