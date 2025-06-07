import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { getEnterLeaveAnimation } from '../../animations/enterLeaveAnimation';

@Component({
    selector: 'app-error-message',
    imports: [],
    templateUrl: './error-message.component.html',
    styleUrl: './error-message.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [getEnterLeaveAnimation()]
})
export class ErrorMessageComponent {

    public readonly message = input.required<string | null>();
}
