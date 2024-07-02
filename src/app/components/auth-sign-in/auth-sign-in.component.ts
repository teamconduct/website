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

@Component({
    selector: 'app-auth-sign-in',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FloatLabelModule, InputTextModule, PasswordModule, ButtonModule, DividerModule, SignInThirdPartyComponent],
    templateUrl: './auth-sign-in.component.html',
    styleUrl: './auth-sign-in.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthSignInComponent implements OnInit {

    @Input() public handleSuccessfulSignIn: (() => Promise<void> | void) | null = null;

    public loginForm = new FormGroup({
        email: new FormControl(null, [Validators.required, Validators.email]),
        password: new FormControl(null, [Validators.required, Validators.minLength(8)])
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
}
