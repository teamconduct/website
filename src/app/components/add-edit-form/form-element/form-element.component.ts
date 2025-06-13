import { ChangeDetectionStrategy, Component, input, viewChild } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Guid } from '@stevenkellner/typescript-common-functionality';
import { Select, SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { NgTemplateOutlet } from '@angular/common';
import { getEnterLeaveAnimation } from '../../../animations/enterLeaveAnimation';

@Component({
    selector: 'app-form-element',
    imports: [NgTemplateOutlet, ReactiveFormsModule, FloatLabelModule, InputTextModule, SelectModule, MultiSelectModule, InputNumberModule, DatePickerModule],
    templateUrl: './form-element.component.html',
    styleUrl: './form-element.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [getEnterLeaveAnimation()]
})
export class FormElementComponent {

    public readonly type = input.required<'input' | 'currency' | 'number' | 'dropdown' | 'multiselect' | 'date'>();

    public readonly abstractControl = input.required<AbstractControl | null>({ alias: 'formControl' });

    public readonly label = input<string>();

    public readonly currency = input<string>();

    public readonly min = input<number>();

    public readonly max = input<number>();

    public readonly showButtons = input<boolean>(false);

    public readonly suffix = input<string>();

    public readonly options = input<{ key: any, label: string }[]>();

    public readonly placeholder = input<string>();

    public readonly filter = input<boolean>(true);

    public readonly selectedItemsLabel = input<string>();

    public readonly inline = input<boolean>(false);

    public inputId = Guid.generate();

    public get formControl(): FormControl {
        return this.abstractControl() as FormControl;
    }

    public readonly selectRef = viewChild<Select>('selectRef');

    public closeSelectOverlay() {
        const selectRef = this.selectRef();
        if (selectRef !== undefined && selectRef.overlayVisible)
            selectRef.hide();
    }
}
