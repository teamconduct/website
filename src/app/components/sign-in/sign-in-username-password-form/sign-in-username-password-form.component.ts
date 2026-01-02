import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ErrorMessageComponent } from '../../error-message/error-message.component';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
    selector: 'app-sign-in-username-password-form',
    imports: [ButtonModule, ErrorMessageComponent, FloatLabelModule, InputTextModule, PasswordModule, FaIconComponent, ReactiveFormsModule],
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

    public readonly onLogin = output<'input-invalid' | {
        username: string,
        password: string
    }>();

    public readonly onRegister = output<'input-invalid' | {
        username: string,
        password: string | null
    }>();

    public readonly onRegisterCancel = output<void>();

    public loginForm = new FormGroup({
        username: new FormControl<string | null>(null, [Validators.required, Validators.pattern(/(?!.*[\.\-\_]{2,})^[a-zA-Z0-9][a-zA-Z0-9\.\-\_]{2,22}[a-zA-Z0-9]$/)]),
        password: new FormControl<string | null>(null, [Validators.required, Validators.minLength(8)])
    });

    public get loginFormWithoutPassword(): FormGroup {
        return new FormGroup({
            username: this.loginForm.get('username')!,
        });
    }

    public get colors(): Record<'highlight-background' | 'highlight-text' | 'text', string> {
        return {
            'highlight-background': '#667eea',
            'highlight-text': '#FFFFFF',
            text: '#202020',
        };
    }

    public login() {
        if (this.loading() || this.disabled() || this.registerButtonShown())
            return;
        this.loginForm.markAllAsDirty();
        if (this.loginForm.invalid)
            return this.onLogin.emit('input-invalid');
        this.onLogin.emit({
            username: this.loginForm.get('username')!.value!,
            password: this.loginForm.get('password')!.value!,
        });
    }

    public register() {
        if (this.loading() || this.disabled() || !this.registerButtonShown())
            return;
        if (this.passwordShown()) {
            this.loginForm.markAllAsDirty();
            if (this.loginForm.invalid)
                return this.onRegister.emit('input-invalid');
            this.onRegister.emit({
                username: this.loginForm.get('username')!.value!,
                password: this.loginForm.get('password')!.value!,
            });
        } else {
            this.loginFormWithoutPassword.markAllAsDirty();
            if (this.loginFormWithoutPassword.invalid)
                return this.onRegister.emit('input-invalid');
            this.onRegister.emit({
                username: this.loginForm.get('username')!.value!,
                password: null,
            });
        }
    }

    public cancelRegister() {
        if (this.cancelButtonDisabled())
            return;
        this.onRegisterCancel.emit();
    }

    public markAsUndirty() {
        this.loginForm.markAsPristine();
        this.loginFormWithoutPassword.markAsPristine();
    }

    public get usernameErrorMessage(): string | null {
        if (!this.loginForm.get('username')!.invalid || !this.loginForm.get('username')!.dirty)
            return null;
        if (this.loginForm.get('username')!.hasError('required'))
            return $localize `:Username is required error message of the username input field:Username is required to sign up / log in`;
        if (this.loginForm.get('username')!.hasError('pattern')) {
            const username = this.loginForm.get('username')!.value || '';
            if (username.length < 4 || username.length > 24)
                return $localize `:Username length error message of the username input field:The username must be between 4 and 24 characters long`;
            if (!/^[a-zA-Z0-9\.\-\_]+$/.test(username))
                return $localize `:Username character error message of the username input field:The username can only contain letters, numbers, dots (.), hyphens (-), and underscores (_)`;
            if (!/^[a-zA-Z0-9]/.test(username) || !/[a-zA-Z0-9]$/.test(username))
                return $localize `:Username start/end error message of the username input field:The username cannot start and end with a special character (., -, _)`;
            if (/[\.\-\_]{2,}/.test(username))
                return $localize `:Username consecutive special characters error message of the username input field:The username cannot contain consecutive special characters (., -, _)`;
        }
        return null;
    }

    public get passwordErrorMessage(): string | null {
        if (!this.passwordShown())
            return null;
        if (!this.loginForm.get('password')!.invalid || !this.loginForm.get('password')!.dirty)
            return null;
        if (this.loginForm.get('password')!.hasError('required'))
            return $localize `:Password is required error message of the password input field:Password is required to sign up / log in`;
        if (this.loginForm.get('password')!.hasError('minlength'))
            return $localize `:Password is too short error message of the password input field:The password must be at least 8 characters long`;
        return null;
    }
}
