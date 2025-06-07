import { AuthErrorCodes } from '@angular/fire/auth';
import { IAuthenticationProvider } from '../../authentication/providers/IAuthenticationProvider';

export type SignInErrorCode = typeof AuthErrorCodes[keyof typeof AuthErrorCodes];

export interface ISignInProvider<ErrorState extends string> {

    type: string;

    error: 'validation-failed' | ErrorState | { message: string } | null;

    checkValidation: () => Promise<boolean> | boolean;

    getAuthProvider: () => IAuthenticationProvider;

    cleanup: () => Promise<void> | void;

    handleAuthError(code: SignInErrorCode | null): void;
}
