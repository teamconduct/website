import { ChangeDetectionStrategy, Component, input, output, viewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { SignInThirdPartyButtonComponent } from '../sign-in-third-party-button/sign-in-third-party-button.component';
import { SignInEmailPasswordFormComponent } from '../sign-in-email-password-form/sign-in-email-password-form.component';
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component';
import { SIGN_IN_THEME, SignInColorScheme } from '../sign-in-theme';
import { AuthProvider, FormRegisterResult, FormSubmitResult } from '../types';

/**
 * Main sign-in panel component
 * Renders the sign-in UI and emits user interactions to the hosting page
 */
@Component({
    selector: 'app-sign-in-panel',
    imports: [
        FontAwesomeModule,
        ErrorMessageComponent,
        SignInThirdPartyButtonComponent,
        ButtonModule,
        SignInEmailPasswordFormComponent
    ],
    templateUrl: './sign-in-panel.component.html',
    styleUrl: './sign-in-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPanelComponent {

    private readonly usernamePasswordForm = viewChild.required<SignInEmailPasswordFormComponent>('usernamePasswordForm');

    public readonly registerMode = input<AuthProvider | null>(null);
    public readonly passwordShown = input<boolean>(true);
    public readonly registerButtonShown = input<boolean>(false);
    public readonly cancelButtonDisabled = input<boolean>(false);
    public readonly usernamePasswordFormErrorMessage = input<string | null>(null);
    public readonly usernamePasswordLoading = input<boolean>(false);
    public readonly usernamePasswordDisabled = input<boolean>(false);
    public readonly passwordIncorrect = input<boolean>(false);
    public readonly googleSignInErrorMessage = input<string | null>(null);
    public readonly googleLoading = input<boolean>(false);
    public readonly googleDisabled = input<boolean>(false);
    public readonly appleSignInErrorMessage = input<string | null>(null);
    public readonly appleLoading = input<boolean>(false);
    public readonly appleDisabled = input<boolean>(false);

    public readonly usernamePasswordFormSubmit = output<FormSubmitResult>();
    public readonly registerFormSubmit = output<FormRegisterResult>();
    public readonly registerFormCancel = output<void>();
    public readonly googleSignInClicked = output<void>();
    public readonly appleSignInClicked = output<void>();

    public get colors(): SignInColorScheme {
        return SIGN_IN_THEME;
    }

    public onUsernamePasswordFormSubmit(event: FormSubmitResult): void {
        this.usernamePasswordFormSubmit.emit(event);
    }

    public onGoogleSignInClicked(): void {
        this.googleSignInClicked.emit();
    }

    public onAppleSignInClicked(): void {
        this.appleSignInClicked.emit();
    }

    public onRegisterFormSubmit(event: FormRegisterResult): void {
        this.registerFormSubmit.emit(event);
    }

    public onRegisterFormCancel(): void {
        this.registerFormCancel.emit();
    }

    public markUsernamePasswordFormAsUndirty(): void {
        this.usernamePasswordForm().markAsUndirty();
    }

    public clearUsernamePassword(): void {
        this.usernamePasswordForm().loginForm.get('password')?.setValue(null);
    }

    public showTermsOfService(): void {
        // TODO: Implement terms of service display
    }

    public showPrivacyPolicy(): void {
        // TODO: Implement privacy policy display
    }
}

