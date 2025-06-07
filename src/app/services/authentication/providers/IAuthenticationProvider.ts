import { Auth, UserCredential } from '@angular/fire/auth';

export interface IAuthenticationProvider {
    signIn(auth: Auth): Promise<UserCredential>
}
