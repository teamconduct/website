import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { THIRD_PARTY_BUTTON_THEME, ThirdPartyButtonColorScheme } from '../sign-in-theme';

/**
 * Third-party authentication button component
 * Supports Google and Apple sign-in with branded styling
 */
@Component({
    selector: 'app-sign-in-third-party-button',
    imports: [ButtonModule],
    templateUrl: './sign-in-third-party-button.component.html',
    styleUrl: './sign-in-third-party-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInThirdPartyButtonComponent {

    public readonly type = input.required<'google' | 'apple'>();
    public readonly loading = input<boolean>(false);
    public readonly disabled = input<boolean>(false);
    public readonly invalid = input<boolean>(false);

    public readonly onClick = output<void>();

    public get colors(): ThirdPartyButtonColorScheme {
        return THIRD_PARTY_BUTTON_THEME;
    }

    /**
     * Handles button click event
     * Only emits if button is not loading or disabled
     */
    public clicked(): void {
        if (!this.loading() && !this.disabled()) {
            this.onClick.emit();
        }
    }
}
