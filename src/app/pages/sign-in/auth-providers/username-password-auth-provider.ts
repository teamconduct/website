import { ChangeDetectorRef } from '@angular/core';
import { AuthProvider, UsernamePasswordError } from '../types';
import { SignInService } from '../../../services/sign-in/sign-in.service';
import { EmailSignInProvider } from '../../../services/sign-in/providers';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { IAuthMethodProvider } from './i-auth-method-provider';

/**
 * Username/Password authentication provider
 */
export class UsernamePasswordAuthProvider extends IAuthMethodProvider<UsernamePasswordError> {
    constructor(
        signInService: SignInService,
        cdr: ChangeDetectorRef,
        private readonly registerMode: () => AuthProvider | null
    ) {
        super(signInService, cdr);
    }

    get providerType(): AuthProvider {
        return 'username-password';
    }

    get errorMessage(): string | null {
        switch (this.error) {
            case 'username-password-invalid':
                if (this.registerMode() === null || this.registerMode() === 'username-password') {
                    return $localize`:Generic username/password sign-in error@@usernamePasswordInvalid:Invalid email or password. Please try again.`;
                } else {
                    return $localize`:Generic username/password registration error@@usernamePasswordRegisterInvalid:Please check the highlighted fields and try again.`;
                }
            case 'internal-error':
                return $localize`:Internal error message@@internalError:An internal error occurred. Please try again later.`;
            case 'not-registered':
                if (this.registerMode()) {
                    return $localize`:Not registered message in register mode@@notRegisteredRegisterMode:Click Register to create your account.`;
                }
                return $localize`:Not registered message@@notRegistered:No account exists for this email address. Click Sign in again to register.`;
            case 'wrong-password':
                return $localize`:Wrong password error@@wrongPassword:Incorrect password for the given email address. Please input the correct password and try again.`;
            case 'username-taken':
                return $localize`:Username taken error@@usernameTaken:An account with this email address already exists. Please choose a different one.`;
            case null:
                return null;
        }
    }

    async authenticate(email: string, password: string): Promise<Result<void, 'popup-cancelled' | 'popup-blocked' | 'wrong-password' | 'unknown'>> {
        const signInProvider = new EmailSignInProvider(email, password);
        return await this.signInService.auth(signInProvider);
    }
}
