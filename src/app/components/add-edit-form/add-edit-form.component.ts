import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SubmitableForm } from '../../types';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ErrorMessageComponent } from '../error-message/error-message.component';

@Component({
    selector: 'app-add-edit-form',
    imports: [ReactiveFormsModule, ButtonModule, ErrorMessageComponent],
    templateUrl: './add-edit-form.component.html',
    styleUrl: './add-edit-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditFormComponent<Control extends SubmitableForm.ControlRequirement, Error extends SubmitableForm.ErrorRequirement> {

    public readonly form = input.required<SubmitableForm<Control, Error>>();

    public readonly buttonLabel = input.required<string>();

    public readonly buttonDisabled = input<boolean>(false);
}
