import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ErrorMessageComponent } from '../../error-message/error-message.component';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { FormRegisterResult, FormSubmitResult } from '../types';
import { SIGN_IN_THEME, SignInColorScheme } from '../sign-in-theme';

/**
 * Username/password form component for sign-in
 * Handles both login and registration modes with proper validation
 */
@Component({
    selector: 'app-sign-in-username-password-form',
    imports: [
        ButtonModule,
        ErrorMessageComponent,
        FloatLabelModule,
        InputTextModule,
        PasswordModule,
        FaIconComponent,
        ReactiveFormsModule
    ],
    templateUrl: './sign-in-username-password-form.component.html',
    styleUrl: './sign-in-username-password-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInUsernamePasswordFormComponent {

    public readonly loading = input<boolean>(false);
    public readonly disabled = input<boolean>(false);
    public readonly cancelButtonDisabled = input<boolean>(false);
    public readonly errorMessage = input<string | null>(null);
    public readonly passwordShown = input<boolean>(true);
    public readonly registerButtonShown = input<boolean>(false);

    public readonly onLogin = output<FormSubmitResult>();
    public readonly onRegister = output<FormRegisterResult>();
    public readonly onRegisterCancel = output<void>();

    /**
     * Username validation pattern:
     * - 4-24 characters total
     * - Must start and end with alphanumeric
     * - Can contain letters, numbers, dots, hyphens, underscores
     * - No consecutive special characters
     */
    private readonly USERNAME_PATTERN = /(?!.*[\.\-\_]{2,})^[a-zA-Z0-9][a-zA-Z0-9\.\-\_]{2,22}[a-zA-Z0-9]$/;
    private readonly MIN_PASSWORD_LENGTH = 8;

    public loginForm = new FormGroup({
        username: new FormControl<string | null>(null, [
            Validators.required,
            Validators.pattern(this.USERNAME_PATTERN)
        ]),
        password: new FormControl<string | null>(null, [
            Validators.required,
            Validators.minLength(this.MIN_PASSWORD_LENGTH)
        ])
    });

    public get loginFormWithoutPassword(): FormGroup {
        return new FormGroup({
            username: this.loginForm.get('username')!,
        });
    }

    public get colors(): SignInColorScheme {
        return SIGN_IN_THEME;
    }

    /**
     * Submits the login form
     * Validates form before emitting login event
     */
    public login(): void {
        if (this.loading() || this.disabled() || this.registerButtonShown()) {
            return;
        }

        this.loginForm.markAllAsDirty();

        if (this.loginForm.invalid) {
            this.onLogin.emit('input-invalid');
            return;
        }

        this.onLogin.emit({
            username: this.loginForm.get('username')!.value!,
            password: this.loginForm.get('password')!.value!,
        });
    }

    /**
     * Submits the registration form
     * Validates based on whether password is shown (third-party vs direct registration)
     */
    public register(): void {
        if (this.loading() || this.disabled() || !this.registerButtonShown()) {
            return;
        }

        if (this.passwordShown()) {
            // Direct registration with username and password
            this.loginForm.markAllAsDirty();
            if (this.loginForm.invalid) {
                this.onRegister.emit('input-invalid');
                return;
            }
            this.onRegister.emit({
                username: this.loginForm.get('username')!.value!,
                password: this.loginForm.get('password')!.value!,
            });
        } else {
            // Third-party registration (only username needed)
            this.loginFormWithoutPassword.markAllAsDirty();
            if (this.loginFormWithoutPassword.invalid) {
                this.onRegister.emit('input-invalid');
                return;
            }
            this.onRegister.emit({
                username: this.loginForm.get('username')!.value!,
                password: null,
            });
        }
    }

    /**
     * Cancels the registration process
     */
    public cancelRegister(): void {
        if (this.cancelButtonDisabled()) {
            return;
        }
        this.onRegisterCancel.emit();
    }

    /**
     * Marks the form as pristine (undirty)
     */
    public markAsUndirty(): void {
        this.loginForm.markAsPristine();
        this.loginFormWithoutPassword.markAsPristine();
    }

    /**
     * Gets the username validation error message
     */
    public get usernameErrorMessage(): string | null {
        const usernameControl = this.loginForm.get('username')!;

        if (!usernameControl.invalid || !usernameControl.dirty) {
            return null;
        }

        if (usernameControl.hasError('required')) {
            return $localize`:Username required error@@usernameRequired:Username is required to sign up / log in`;
        }

        if (usernameControl.hasError('pattern')) {
            const username = usernameControl.value || '';

            if (username.length < 4 || username.length > 24) {
                return $localize`:Username length error@@usernameLength:The username must be between 4 and 24 characters long`;
            }

            if (!/^[a-zA-Z0-9\.\-\_]+$/.test(username)) {
                return $localize`:Username character error@@usernameCharacters:The username can only contain letters, numbers, dots (.), hyphens (-), and underscores (_)`;
            }

            if (!/^[a-zA-Z0-9]/.test(username) || !/[a-zA-Z0-9]$/.test(username)) {
                return $localize`:Username start/end error@@usernameStartEnd:The username cannot start and end with a special character (., -, _)`;
            }

            if (/[\.\-\_]{2,}/.test(username)) {
                return $localize`:Username consecutive special chars error@@usernameConsecutive:The username cannot contain consecutive special characters (., -, _)`;
            }
        }

        return null;
    }

    /**
     * Gets the password validation error message
     */
    public get passwordErrorMessage(): string | null {
        if (!this.passwordShown()) {
            return null;
        }

        const passwordControl = this.loginForm.get('password')!;

        if (!passwordControl.invalid || !passwordControl.dirty) {
            return null;
        }

        if (passwordControl.hasError('required')) {
            return $localize`:Password required error@@passwordRequired:Password is required to sign up / log in`;
        }

        if (passwordControl.hasError('minlength')) {
            return $localize`:Password too short error@@passwordMinLength:The password must be at least 8 characters long`;
        }

        return null;
    }
}
