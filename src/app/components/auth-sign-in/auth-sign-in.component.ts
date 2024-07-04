import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { SignInThirdPartyComponent } from '../sign-in-third-party/sign-in-third-party.component';
import { AppleSignInProvider, EmailSignInProvider, GoogleSignInProvider, SignInService } from '../../services/sign-in.service';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { enterLeaveAnimation } from '../../animations/enterLeaveAnimation';

@Component({
    selector: 'app-auth-sign-in',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FloatLabelModule, InputTextModule, PasswordModule, ButtonModule, DividerModule, SignInThirdPartyComponent, ErrorMessageComponent],
    templateUrl: './auth-sign-in.component.html',
    styleUrl: './auth-sign-in.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [enterLeaveAnimation]
})
export class AuthSignInComponent implements OnInit {

    @Input() public handleSuccessfulSignIn: (() => Promise<void> | void) | null = null;

    public loginForm = new FormGroup({
        email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
        password: new FormControl<string | null>(null, [Validators.required, Validators.minLength(8)])
    });

    public emailSignInProvider = new EmailSignInProvider(this.loginForm);

    public googleSignInProvider = new GoogleSignInProvider();

    public appleSignInProvider = new AppleSignInProvider();

    public signInService = inject(SignInService);

    private changeDetectorRef = inject(ChangeDetectorRef);

    public ngOnInit() {
        if (this.handleSuccessfulSignIn !== null)
            this.signInService.setHandleSuccessfulSignIn(this.handleSuccessfulSignIn);
    }

    public async signInWithEmail() {
        await this.signInService.signIn(this.emailSignInProvider);
        this.changeDetectorRef.markForCheck();
    }

    public async signInWithGoogle() {
        await this.signInService.signIn(this.googleSignInProvider);
        this.changeDetectorRef.markForCheck();
    }

    public async signInWithApple() {
        await this.signInService.signIn(this.appleSignInProvider);
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
        switch (this.emailSignInProvider.error) {
        case 'validation-failed':
            return $localize `:Email error validation failed:Please fill out all fields correctly`;
        case 'wrong-password':
            return $localize `:Email error wrong error:Password is wrong`;
        case 'unknown':
            return $localize `:Email error unknown:An unknown error occured`;
        case null:
            return null;
        }
    }

    public get signInGoogleErrorMessage(): string | null {
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
