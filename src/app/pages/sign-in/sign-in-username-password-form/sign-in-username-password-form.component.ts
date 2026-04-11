import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component';
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
    public readonly passwordIncorrect = input<boolean>(false);
    public readonly passwordShown = input<boolean>(true);
    public readonly registerButtonShown = input<boolean>(false);

    public readonly onLogin = output<FormSubmitResult>();
    public readonly onRegister = output<FormRegisterResult>();
    public readonly onRegisterCancel = output<void>();

    private readonly MIN_PASSWORD_LENGTH = 8;

    public loginForm = new FormGroup({
        firstName: new FormControl<string | null>(null),
        lastName: new FormControl<string | null>(null),
        email: new FormControl<string | null>(null),
        password: new FormControl<string | null>(null)
    });

    constructor() {
        effect(() => {
            this.updateControlValidators();
        });

        // Update password validation when passwordIncorrect changes
        effect(() => {
            const passwordControl = this.loginForm.get('password');
            if (this.passwordIncorrect()) {
                passwordControl?.setErrors({ ...passwordControl.errors, incorrectPassword: true });
            } else {
                // Remove only the incorrectPassword error, keep other errors
                const errors = passwordControl?.errors;
                if (errors && 'incorrectPassword' in errors) {
                    delete errors['incorrectPassword'];
                    passwordControl?.setErrors(Object.keys(errors).length > 0 ? errors : null);
                }
            }
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

        this.markControlsAsDirty(['email', 'password']);

        if (this.areControlsInvalid(['email', 'password'])) {
            this.onLogin.emit('input-invalid');
            return;
        }

        this.onLogin.emit({
            email: this.loginForm.get('email')!.value!,
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
            this.markControlsAsDirty(['firstName', 'lastName', 'email', 'password']);
            if (this.areControlsInvalid(['firstName', 'lastName', 'email', 'password'])) {
                this.onRegister.emit('input-invalid');
                return;
            }
            this.onRegister.emit({
                firstName: this.loginForm.get('firstName')!.value!,
                lastName: this.loginForm.get('lastName')!.value!,
                email: this.loginForm.get('email')!.value!,
                password: this.loginForm.get('password')!.value!,
            });
        } else {
            this.markControlsAsDirty(['firstName', 'lastName']);
            if (this.areControlsInvalid(['firstName', 'lastName'])) {
                this.onRegister.emit('input-invalid');
                return;
            }
            this.onRegister.emit({
                firstName: this.loginForm.get('firstName')!.value!,
                lastName: this.loginForm.get('lastName')!.value!,
                email: null,
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
    }

    /**
     * Gets the first name validation error message
     */
    public get firstNameErrorMessage(): string | null {
        const firstNameControl = this.loginForm.get('firstName')!;

        if (!firstNameControl.invalid || !firstNameControl.dirty) {
            return null;
        }

        if (firstNameControl.hasError('required')) {
            return $localize`:First name required error@@firstNameRequired:Registering requires your first name`;
        }

        return null;
    }

    /**
     * Gets the last name validation error message
     */
    public get lastNameErrorMessage(): string | null {
        const lastNameControl = this.loginForm.get('lastName')!;

        if (!lastNameControl.invalid || !lastNameControl.dirty) {
            return null;
        }

        if (lastNameControl.hasError('required')) {
            return $localize`:Last name required error@@lastNameRequired:Registering requires your last name`;
        }

        return null;
    }

    /**
     * Gets the email validation error message
     */
    public get emailErrorMessage(): string | null {
        const emailControl = this.loginForm.get('email')!;

        if (!emailControl.invalid || !emailControl.dirty) {
            return null;
        }

        if (emailControl.hasError('required')) {
            if (this.registerButtonShown()) {
                return $localize`:Email required error@@emailRequiredRegister:Email is required to sign up`;
            }

            return $localize`:Email required error@@emailRequired:Email is required to log in`;
        }

        if (emailControl.hasError('email')) {
            return $localize`:Email invalid error@@emailInvalid:Please enter a valid email address`;
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
            if (this.registerButtonShown()) {
                return $localize`:Password required error@@passwordRequiredRegister:Password is required to sign up`;
            } else {
                return $localize`:Password required error@@passwordRequired:Password is required to log in`;
            }
        }

        if (passwordControl.hasError('minlength')) {
            return $localize`:Password too short error@@passwordMinLength:The password must be at least 8 characters long`;
        }

        if (passwordControl.hasError('incorrectPassword')) {
            return $localize`:Incorrect password error@@incorrectPassword:The password is incorrect`;
        }

        return null;
    }

    public get emailShown(): boolean {
        return !this.registerButtonShown() || this.passwordShown();
    }

    private updateControlValidators(): void {
        this.setRequiredValidator('firstName', this.registerButtonShown());
        this.setRequiredValidator('lastName', this.registerButtonShown());

        const emailControl = this.loginForm.get('email')!;
        if (this.emailShown) {
            emailControl.setValidators([Validators.required, Validators.email]);
        } else {
            emailControl.clearValidators();
            emailControl.setErrors(null);
        }
        emailControl.updateValueAndValidity({ emitEvent: false });

        const passwordControl = this.loginForm.get('password')!;
        if (this.passwordShown()) {
            passwordControl.setValidators([Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]);
        } else {
            passwordControl.clearValidators();
        }
        passwordControl.updateValueAndValidity({ emitEvent: false });
    }

    private setRequiredValidator(controlName: 'firstName' | 'lastName', required: boolean): void {
        const control = this.loginForm.get(controlName)!;

        if (required) {
            control.setValidators([Validators.required]);
        } else {
            control.clearValidators();
            control.setErrors(null);
        }

        control.updateValueAndValidity({ emitEvent: false });
    }

    private markControlsAsDirty(controlNames: Array<'firstName' | 'lastName' | 'email' | 'password'>): void {
        for (const controlName of controlNames) {
            this.loginForm.get(controlName)?.markAsDirty();
        }
    }

    private areControlsInvalid(controlNames: Array<'firstName' | 'lastName' | 'email' | 'password'>): boolean {
        return controlNames.some(controlName => this.loginForm.get(controlName)?.invalid ?? false);
    }
}
