import { CommonModule } from '@angular/common';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { Guid } from '../../../types/Guid';

@Component({
    selector: 'app-form-element',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FloatLabelModule, InputTextModule, DropdownModule, MultiSelectModule, InputNumberModule, CalendarModule],
    templateUrl: './form-element.component.html',
    styleUrl: './form-element.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormElementComponent {

    @Input({ required: true }) public type!: 'input' | 'currency' | 'number' | 'dropdown' | 'multiselect' | 'date';

    @Input({ required: true, alias: 'formControl' }) public abstractControl!: AbstractControl | null;

    @Input() public label: string | null = null;

    @Input() public currency: string | null = null;

    @Input() public min: number | null = null;

    @Input() public max: number | null = null;

    @Input() public showButtons: boolean = false;

    @Input() public suffix: string | null = null;

    @Input() public options: { key: any, label: string }[] | null = null;

    @Input() public placeholder: string | null = null;

    @Input() public filter: boolean = true;

    @Input() public selectedItemsLabel: string | null = null;

    @Input() public inline: boolean = false;

    public inputId = Guid.generate();

    public get formControl(): FormControl {
        return this.abstractControl as FormControl;
    }
}
