import { FormControl, FormGroup } from '@angular/forms';
import { ISignInProvider, SignInErrorCode } from './ISignInProvider';
import { EmailAuthenticationProvider } from '../../authentication/providers';

export class EmailSignInProvider implements ISignInProvider<'wrong-password' | 'unknown'> {

    public constructor(
        private readonly email: string,
        private readonly password: string
    ) {}

    public getAuthProvider(): EmailAuthenticationProvider {
        return new EmailAuthenticationProvider(this.email, this.password);
    }

    public handleAuthError(code: SignInErrorCode | null): 'wrong-password' | 'unknown' | null {
        if (code === null)
            return null;
        if (code === 'auth/wrong-password')
            return 'wrong-password';
        return 'unknown';
    }
}
