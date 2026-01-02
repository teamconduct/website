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
    private usernamePasswordFormError: 'username-password-invalid' | 'internal-error' | 'not-registered' | null = null;
    public registerMode = false;

    public googleSignInLoading = false;
    public googleSignInDisabled = false;
    private googleSignInError: 'internal-error' | null = null;

    public appleSignInLoading = false;
    public appleSignInDisabled = false;
    private appleSignInError: 'internal-error' | null = null;

    public passwordShown = true;
    public registerButtonShown = false;
    public cancelButtonDisabled = false;

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

        // TODO: Call actual sign-in service
        await new Promise(resolve => setTimeout(() => {
            // Simulate: not-registered error for testing
            // this.usernamePasswordFormError = 'not-registered';
            // this.enterRegisterMode('username-password');

            // Simulate: internal-error for testing
            // this.usernamePasswordFormError = 'internal-error';

            // Simulate: success-login
            // Navigate to home page
            resolve(undefined);
            this.cdr.markForCheck();
        }, 1000));

        this.stopLoading('username-password');
    }

    public async onUsernamePasswordFormRegister(event: 'input-invalid' | { username: string, password: string | null }) {
        this.resetErrors();
        if (event === 'input-invalid') {
            this.usernamePasswordFormError = 'username-password-invalid';
            return;
        }
        if (this.isLoading() || this.usernamePasswordFormDisabled)
            return;
        this.startLoading('username-password');
        this.cancelButtonDisabled = true;

        // TODO: Call actual registration service
        await new Promise(resolve => setTimeout(() => {
            // Simulate: internal-error for testing
            // this.usernamePasswordFormError = 'internal-error';
            // this.cancelButtonDisabled = false;

            // Simulate: success-registration
            // this.exitRegisterMode();
            // Navigate to home page
            resolve(undefined);
            this.cdr.markForCheck();
        }, 1000));

        this.stopLoading('username-password');
        this.cancelButtonDisabled = false;
    }

    public onUsernamePasswordFormRegisterCancel() {
        this.exitRegisterMode();
    }

    public async onGoogleSignInClicked() {
        this.usernamePasswordForm().markAsUndirty();
        this.resetErrors();
        if (this.isLoading() || this.googleSignInDisabled)
            return;
        this.startLoading('google');

        // TODO: Call actual Google sign-in service
        await new Promise(resolve => setTimeout(() => {
            // Simulate: not-registered error for testing
            // this.googleSignInError = null;
            // this.enterRegisterMode('google');

            // Simulate: internal-error for testing
            // this.googleSignInError = 'internal-error';

            // Simulate: success-login
            // this.usernamePasswordForm().loginForm.reset();
            // Navigate to home page
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

        // TODO: Call actual Apple sign-in service
        await new Promise(resolve => setTimeout(() => {
            // Simulate: not-registered error for testing
            // this.appleSignInError = null;
            // this.enterRegisterMode('apple');

            // Simulate: internal-error for testing
            // this.appleSignInError = 'internal-error';

            // Simulate: success-login
            // this.usernamePasswordForm().loginForm.reset();
            // Navigate to home page
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

    private enterRegisterMode(source: 'username-password' | 'google' | 'apple') {
        this.registerMode = true;
        this.registerButtonShown = true;

        if (source === 'google' || source === 'apple') {
            // Clear password but keep username, hide password field
            this.usernamePasswordForm().loginForm.get('password')?.setValue(null);
            this.passwordShown = false;
        }

        // Keep other methods disabled, stop loading
        if (source === 'username-password') {
            this.usernamePasswordFormLoading = false;
        } else if (source === 'google') {
            this.googleSignInLoading = false;
        } else if (source === 'apple') {
            this.appleSignInLoading = false;
        }
    }

    private exitRegisterMode() {
        this.registerMode = false;
        this.registerButtonShown = false;
        this.cancelButtonDisabled = false;

        if (!this.passwordShown) {
            // Was in third-party register mode - clear username, show password
            this.usernamePasswordForm().loginForm.reset();
            this.passwordShown = true;
        }

        // Enable all methods
        this.usernamePasswordFormDisabled = false;
        this.googleSignInDisabled = false;
        this.appleSignInDisabled = false;
        this.usernamePasswordFormLoading = false;
        this.googleSignInLoading = false;
        this.appleSignInLoading = false;
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
            case 'internal-error':
                return $localize `:Internal error message:An internal error occurred. Please try again later.`;
            case 'not-registered':
                if (this.registerMode)
                    return $localize `:Not registered message in register mode:Click Register to create your account.`;
                return $localize `:Not registered message:This account is not registered. Click Sign in again to register.`;
            case null:
                return null;
        }
    }

    public get googleSignInErrorMessage(): string | null {
        switch (this.googleSignInError) {
            case 'internal-error':
                return $localize `:Google sign-in internal error message:An internal error occurred with Google sign-in. Please try again later.`;
            case null:
                return null;
        }
    }

    public get appleSignInErrorMessage(): string | null {
        switch (this.appleSignInError) {
            case 'internal-error':
                return $localize `:Apple sign-in internal error message:An internal error occurred with Apple sign-in. Please try again later.`;
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
