import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

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

    public get colors(): Record<'google-background' | 'google-text' | 'apple-background' | 'apple-text', string> {
        return {
            'google-background': '#EEEEEE',
            'google-text': '#000000',
            'apple-background': '#000000',
            'apple-text': '#FFFFFF',
        };
    }

    public clicked() {
        if (!this.loading() && !this.disabled())
            this.onClick.emit();
    }
}
