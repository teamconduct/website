import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { enterLeaveAnimation } from '../../animations/enterLeaveAnimation';

@Component({
    selector: 'app-error-message',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './error-message.component.html',
    styleUrl: './error-message.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [enterLeaveAnimation]
})
export class ErrorMessageComponent {

    @Input({ required: true }) public message: string | null = null;
}
