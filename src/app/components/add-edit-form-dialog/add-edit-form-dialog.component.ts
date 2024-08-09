import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SubmitableForm } from '../../types/SubmitableForm';
import { DialogModule } from 'primeng/dialog';
import { AddEditFormComponent } from '../add-edit-form/add-edit-form.component';

@Component({
    selector: 'app-add-edit-form-dialog',
    standalone: true,
    imports: [DialogModule, AddEditFormComponent],
    templateUrl: './add-edit-form-dialog.component.html',
    styleUrl: './add-edit-form-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditFormDialogComponent<TControl extends SubmitableForm.TControlRequirement, TError extends SubmitableForm.TErrorRequirement> implements OnInit {

    @Input({ required: true }) public visible!: boolean;

    @Output() public readonly visibleChange = new EventEmitter<boolean>();

    @Input({ required: true }) public form!: SubmitableForm<TControl, TError> | any;

    @Input({ required: true }) public headerLabel!: string;

    @Input({ required: true }) public buttonLabel!: string;

    public ngOnInit() {
        this.form.addSuccessHandler(() => this.visibleChange.emit(false));
    }
}
