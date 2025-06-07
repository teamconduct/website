import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppleSignInProvider, EmailSignInProvider, GoogleSignInProvider } from '../../services/sign-in/providers';
import { SignInService } from '../../services/sign-in/sign-in.service';
import { ISignInProvider } from '../../services/sign-in/providers/ISignInProvider';
import { ThirdPartySignInButtonComponent } from '../third-party-sign-in-button/third-party-sign-in-button.component';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { getEnterLeaveAnimation } from '../../animations/enterLeaveAnimation';

@Component({
    selector: 'app-authentication',
    imports: [ReactiveFormsModule, ButtonModule, FloatLabelModule, DividerModule, InputTextModule, PasswordModule, ThirdPartySignInButtonComponent, ErrorMessageComponent],
    templateUrl: './authentication.component.html',
    styleUrl: './authentication.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [getEnterLeaveAnimation()]
})
export class AuthenticationComponent {

    public readonly onSuccessfulSignIn = input<() => Promise<string | null> | string | null>();

    public loginForm = new FormGroup({
        email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
        password: new FormControl<string | null>(null, [Validators.required, Validators.minLength(8)])
    });

    public emailSignInProvider = new EmailSignInProvider(this.loginForm);

    public googleSignInProvider = new GoogleSignInProvider();

    public appleSignInProvider = new AppleSignInProvider();

    public signInService = inject(SignInService);

    private changeDetectorRef = inject(ChangeDetectorRef);

    public async signInWithEmail() {
        await this.signIn(this.emailSignInProvider);
    }

    public async signInWithGoogle() {
        await this.signIn(this.googleSignInProvider);
    }

    public async signInWithApple() {
        await this.signIn(this.appleSignInProvider);
    }

    private async signIn<ErrorState extends string>(provider: ISignInProvider<ErrorState>) {
        await this.signInService.signIn(provider, () => {
            const onSuccessfulSignIn = this.onSuccessfulSignIn();
            if (!onSuccessfulSignIn)
                return null;
            return onSuccessfulSignIn();
        });
        this.changeDetectorRef.markForCheck();
    }

    public get loginFormEmailErrorMessage(): string | null {
        if (!this.loginForm.get('email')!.invalid || !this.loginForm.get('email')!.dirty)
            return null;
        if (this.loginForm.get('email')!.hasError('required'))
            return $localize `:Email is required error message of the email input field:Email is required to sign up / log in`;
        if (this.loginForm.get('email')!.hasError('email'))
            return $localize `:Email is invalid error message of the email input field:Please enter a valid email address`;
        return null;
    }

    public get loginFormPasswordErrorMessage(): string | null {
        if (!this.loginForm.get('email')!.valid || !this.loginForm.get('email')!.dirty || !this.loginForm.get('password')!.invalid || !this.loginForm.get('password')!.dirty)
            return null;
        if (this.loginForm.get('password')!.hasError('required'))
            return $localize `:Password is required error message of the password input field:Password is required to sign up / log in`;
        if (this.loginForm.get('password')!.hasError('minlength'))
            return $localize `:Password is too short error message of the password input field:The password must be at least 8 characters long`;
        return null;
    }

    public get signInEmailErrorMessage(): string | null {
        if (this.emailSignInProvider.error === null)
            return null;
        if (typeof this.emailSignInProvider.error === 'object')
            return this.emailSignInProvider.error.message;
        switch (this.emailSignInProvider.error) {
        case 'validation-failed':
            return $localize `:Email error validation failed:Please fill out all fields correctly`;
        case 'wrong-password':
            return $localize `:Email error wrong error:Password is wrong`;
        case 'unknown':
            return $localize `:Email error unknown:An unknown error occured`;
        }
    }

    public get signInGoogleErrorMessage(): string | null {
        if (this.googleSignInProvider.error === null)
            return null;
        if (typeof this.googleSignInProvider.error === 'object')
            return this.googleSignInProvider.error.message;
        switch (this.googleSignInProvider.error) {
        case 'validation-failed':
            return $localize `:Google error validation failed:Please fill out all fields correctly`;
        case 'popup-canceled':
            return $localize `:Google error popup canceled:Popup to sign in with google was closed by user`;
        case 'popup-blocked':
            return $localize `:Google error popup blocked:Popup to sign in with google could not be shown, it was blocked by the browser`;
        case 'unknown':
            return $localize `:Google error unknown:An unknown error occured`;
        case null:
            return null;
        }
    }

    public get signInAppleErrorMessage(): string | null {
        if (this.appleSignInProvider.error === null)
            return null;
        if (typeof this.appleSignInProvider.error === 'object')
            return this.appleSignInProvider.error.message;
        switch (this.appleSignInProvider.error) {
        case 'validation-failed':
            return $localize `:Apple error validation failed:Please fill out all fields correctly`;
        case 'popup-canceled':
            return $localize `:Apple error popup canceled:Popup to sign in with apple was closed by user`;
        case 'popup-blocked':
            return $localize `:Apple error popup blocked:Popup to sign in with apple could not be shown, it was blocked by the browser`;
        case 'unknown':
            return $localize `:Apple error unknown:An unknown error occured`;
        case null:
            return null;
        }
    }
}
