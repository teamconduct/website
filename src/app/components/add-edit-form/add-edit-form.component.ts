import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormElement, SubmitableForm } from '../../types/SubmitableForm';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { entries } from '../../utils';
import { ErrorMessageComponent } from '../error-message/error-message.component';

@Component({
    selector: 'app-add-edit-form',
    standalone: true,
    imports: [ReactiveFormsModule, FloatLabelModule, InputTextModule, ButtonModule, ErrorMessageComponent],
    templateUrl: './add-edit-form.component.html',
    styleUrl: './add-edit-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditFormComponent<TControl extends SubmitableForm.TControlRequirement, TError extends SubmitableForm.TErrorRequirement> {

    @Input({ required: true }) public form!: SubmitableForm<TControl, TError>;

    @Input({ required: true }) public buttonLabel!: string;

    public get formElements(): ({ key: keyof TControl & string } & FormElement)[] {
        return entries(this.form.formElements).map(({ key, value }) => ({ key: key as string, ...value }));
    }
}
