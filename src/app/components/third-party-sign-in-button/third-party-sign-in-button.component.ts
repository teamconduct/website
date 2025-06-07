import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-third-party-sign-in-button',
    imports: [CommonModule, ButtonModule],
    templateUrl: './third-party-sign-in-button.component.html',
    styleUrl: './third-party-sign-in-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThirdPartySignInButtonComponent {

    public readonly type = input.required<'google' | 'apple'>();

    public readonly loading = input<boolean>(false);

    public readonly disabled = input<boolean>(false);

    public readonly invalid = input<boolean>(false);

    public readonly onClick = output<void>();

    public clicked() {
        if (!this.loading && !this.disabled)
            this.onClick.emit();
    }

    public get label(): string {
        switch (this.type()) {
        case 'google':
            return $localize `:Button label to sign up or log in with google:Sign in with Google`;
        case 'apple':
            return $localize `:Button label to sign up or log in with apple:Sign in with Apple`;
        }
    }
}
