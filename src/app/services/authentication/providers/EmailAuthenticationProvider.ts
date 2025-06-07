import { Auth, AuthErrorCodes, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import { IAuthenticationProvider } from './IAuthenticationProvider';

export class EmailAuthenticationProvider implements IAuthenticationProvider {

    public constructor(
        private readonly email: string,
        private readonly password: string
    ) {}

    private async createUserWithEmailAndPassword(auth: Auth): Promise<UserCredential> {
        return await createUserWithEmailAndPassword(auth, this.email, this.password);
    }

    private async signInWithEmail(auth: Auth): Promise<UserCredential> {
        return await signInWithEmailAndPassword(auth, this.email, this.password);
    }

    public async signIn(auth: Auth): Promise<UserCredential> {
        try {
            return await this.signInWithEmail(auth);
        } catch (error) {
            if (typeof error === 'object' && error !== null &&'code' in error && error.code === AuthErrorCodes.USER_DELETED)
                return await this.createUserWithEmailAndPassword(auth);
            throw error;
        }
    }
}
