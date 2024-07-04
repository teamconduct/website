import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthSignInComponent } from '../../components/auth-sign-in/auth-sign-in.component';
import { FirebaseFunctionsService } from '../../services/firebase-functions.service';
import { FunctionsError, FunctionsErrorCodeCore } from '@angular/fire/functions';

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [CommonModule, AuthSignInComponent],
    templateUrl: './sign-in.page.html',
    styleUrl: './sign-in.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInPage {

    private firebaseFunctionsService = inject(FirebaseFunctionsService);

    public async handleSuccessfulSignIn(): Promise<void> {
        try {
            await this.firebaseFunctionsService.function('user').function('login').call(null);
            // TODO: Redirect to the home page.
        } catch (error) {
            if ((error as FunctionsError).code as FunctionsErrorCodeCore === 'not-found')
                console.error('The function "user.login" does not exist.');
            else
                console.error(error);
        }
    }
}
