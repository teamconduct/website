import { FormControl, FormGroup } from '@angular/forms';
import { ISignInProvider, SignInErrorCode } from './ISignInProvider';
import { EmailAuthenticationProvider } from '../../authentication/providers';

export class EmailSignInProvider implements ISignInProvider<'validation-failed' | 'wrong-password' | 'unknown'> {

    public type = 'email';

    public error: 'validation-failed' | 'wrong-password' | 'unknown' | { message: string } | null = null;

    public constructor(
        private readonly loginForm: FormGroup<{
            email: FormControl<string | null>;
            password: FormControl<string |null>;
        }>
    ) {}

    public checkValidation(): boolean {
        this.loginForm.markAllAsDirty();
        return !this.loginForm.invalid;
    }

    public getAuthProvider(): EmailAuthenticationProvider {
        return new EmailAuthenticationProvider(this.loginForm.value.email!, this.loginForm.value.password!);
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
