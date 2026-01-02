import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, viewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SignInThirdPartyButtonComponent } from '../sign-in-third-party-button/sign-in-third-party-button.component';
import { ButtonModule } from 'primeng/button';
import { SignInUsernamePasswordFormComponent } from '../sign-in-username-password-form/sign-in-username-password-form.component';
import { ErrorMessageComponent } from '../../error-message/error-message.component';
import { FirebaseFunctionsService } from '../../../services/firebase-functions/firebase-functions.service';

@Component({
  selector: 'app-sign-in-panel',
  imports: [FontAwesomeModule, ErrorMessageComponent, SignInThirdPartyButtonComponent, ButtonModule, SignInUsernamePasswordFormComponent],
  templateUrl: './sign-in-panel.component.html',
  styleUrl: './sign-in-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPanelComponent {

    private cdr = inject(ChangeDetectorRef);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private usernamePasswordForm = viewChild.required<SignInUsernamePasswordFormComponent>('usernamePasswordForm');

    public usernamePasswordFormLoading = false;
    public usernamePasswordFormDisabled = false;
    private usernamePasswordFormError: 'username-password-invalid' | null = null;

    public googleSignInLoading = false;
    public googleSignInDisabled = false;
    private googleSignInError: null = null;

    public appleSignInLoading = false;
    public appleSignInDisabled = false;
    private appleSignInError: null = null;

    public get colors(): Record<'highlight-background' | 'highlight-text' | 'text', string> {
        return {
            'highlight-background': '#667eea',
            'highlight-text': '#FFFFFF',
            text: '#202020',
        };
    }

    public async onUsernamePasswordFormSubmit(event: 'input-invalid' | { username: string, password: string }) {
        this.resetErrors();
        if (event === 'input-invalid') {
            this.usernamePasswordFormError = 'username-password-invalid';
            return;
        }
        if (this.isLoading() || this.usernamePasswordFormDisabled)
            return;
        this.startLoading('username-password');

        await new Promise(resolve => setTimeout(() => {
            resolve(undefined);
            this.cdr.markForCheck();
        }, 1000));

        this.stopLoading('username-password');
    }

    public async onGoogleSignInClicked() {
        this.usernamePasswordForm().markAsUndirty();
        this.resetErrors();
        if (this.isLoading() || this.googleSignInDisabled)
            return;
        this.startLoading('google');

        await new Promise(resolve => setTimeout(() => {
            resolve(undefined);
            this.cdr.markForCheck();
        }, 1000));

        this.stopLoading('google');
    }

    public async onAppleSignInClicked() {
        this.usernamePasswordForm().markAsUndirty();
        this.resetErrors();
        if (this.isLoading() || this.appleSignInDisabled)
            return;
        this.startLoading('apple');

        await new Promise(resolve => setTimeout(() => {
            resolve(undefined);
            this.cdr.markForCheck();
        }, 1000));

        this.stopLoading('apple');
    }

    private resetErrors() {
        this.usernamePasswordFormError = null;
        this.googleSignInError = null;
        this.appleSignInError = null;
    }

    private isLoading(): boolean {
        return this.usernamePasswordFormLoading || this.googleSignInLoading || this.appleSignInLoading;
    }

    private startLoading(type: 'username-password' | 'google' | 'apple') {
        switch (type) {
            case 'username-password':
                this.usernamePasswordFormLoading = true;
                this.googleSignInDisabled = true;
                this.appleSignInDisabled = true;
                break;
            case 'google':
                this.googleSignInLoading = true;
                this.usernamePasswordFormDisabled = true;
                this.appleSignInDisabled = true;
                break;
            case 'apple':
                this.appleSignInLoading = true;
                this.usernamePasswordFormDisabled = true;
                this.googleSignInDisabled = true;
                break;
        }
    }

    private stopLoading(type: 'username-password' | 'google' | 'apple') {
        switch (type) {
            case 'username-password':
                this.usernamePasswordFormLoading = false;
                this.googleSignInDisabled = false;
                this.appleSignInDisabled = false;
                break;
            case 'google':
                this.googleSignInLoading = false;
                this.usernamePasswordFormDisabled = false;
                this.appleSignInDisabled = false;
                break;
            case 'apple':
                this.appleSignInLoading = false;
                this.usernamePasswordFormDisabled = false;
                this.googleSignInDisabled = false;
                break;
        }
    }

    public get usernamePasswordFormErrorMessage(): string | null {
        switch (this.usernamePasswordFormError) {
            case 'username-password-invalid':
                return $localize `:Generic username/password sign-in error message:Invalid username or password. Please try again.`;
            case null:
                return null;
        }
    }

    public get googleSignInErrorMessage(): string | null {
        switch (this.googleSignInError) {
            case null:
                return null;
        }
    }

    public get appleSignInErrorMessage(): string | null {
        switch (this.appleSignInError) {
            case null:
                return null;
        }
    }

    public shownTermsOfService() {
        // TODO
    }

    public showPrivacyPolicy() {
        // TODO
    }
}

// username/password:
//   - input-invalid: None disabled, none laoding, leave input as is, show input error, show button error
//   disable other methods, username/password loading
//   - internal-error: leave input as is, show button error, none disabled, none loading
//   - not-registered: leave input as is, show message to click again to register, change button to "register", show "cancel" button, disable other methods, none loading
//     - on username changed: Do nothing
//     - on password changed: Do nothing
//     - on cancel clicked: leave input as is, hide message, change button back to "sign in", hide "cancel" button, enable other methods
//     - on register clicked:
//       - input-invalid: register button not loading, cancel button enabled, leave input as is, show input error, show button error, other methods still disabled
//       register button loading, cancel button disabled, other methods still disabled
//       - internal-error: register button not loading, cancel button enabled, leave input as is, show button error, other methods still disabled
//       - success-registration: leave input as is, hide message, change button back to "sign in", hide "cancel" button, none disabled, none loading, navigate to home page
//   - success-login: leave input as is, none disabled, none loading, navigate to home page

// google/apple sign-in:
//   disable other methods, google loading, leave username/password input as is
//   - internal-error: leave username/password as is, show button error, none disabled, none loading
//   - not-registered: clear password input, not username input, hide password input, show message to click again to register, change button to "register", show "cancel" button, disable other methods (except username/password), none loading
//     - on username changed: Do nothing
//     - on cancel clicked: show password input, clear username input, hide message, change button back to "sign in", hide "cancel" button, enable other methods
//     - on register clicked:
//       - input-invalid: register button not loading, cancel button enabled, leave username input as is, show input error, show button error, other methods still disabled
//       register button loading, cancel button disabled, other methods still disabled
//       - internal-error: register button not loading, cancel button enabled, leave username input as is, show button error, other methods still disabled
//       - success-registration: leave username input as is, hide message, change button back to "sign in", hide "cancel" button, show password input, none disabled, none loading, navigate to home page
//   - success-login: clear username/password input none disabled, none loading, navigate to home page
