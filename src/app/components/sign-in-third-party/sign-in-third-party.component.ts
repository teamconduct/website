import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-sign-in-third-party',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    templateUrl: './sign-in-third-party.component.html',
    styleUrl: './sign-in-third-party.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInThirdPartyComponent {

    @Input({ required: true }) public type!: 'google' | 'apple';

    @Input() public loading: boolean = false;

    @Input() public disabled: boolean = false;

    @Input() public invalid: boolean = false;

    @Output() public readonly onClick = new EventEmitter<void>();

    public clicked() {
        if (!this.loading && !this.disabled) {
            this.onClick.emit();
        }
    }

    public get label(): string {
        switch (this.type) {
        case 'google':
            return $localize `:Button label to sign up or log in with google:Sign in with Google`;
        case 'apple':
            return $localize `:Button label to sign up or log in with apple:Sign in with Apple`;
        }
    }
}
