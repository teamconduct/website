import { AuthErrorCodes } from '@angular/fire/auth';
import { IAuthenticationProvider } from '../../authentication/providers/IAuthenticationProvider';

export type SignInErrorCode = typeof AuthErrorCodes[keyof typeof AuthErrorCodes];

export interface ISignInProvider<ErrorState extends string> {

    getAuthProvider: () => IAuthenticationProvider;

    handleAuthError(code: SignInErrorCode | null): ErrorState | null;
}
