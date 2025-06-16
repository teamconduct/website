import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconFieldModule } from 'primeng/iconfield';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-list-search',
    imports: [FormsModule, InputGroupModule, InputGroupAddonModule, InputIconModule, InputTextModule, IconFieldModule, FontAwesomeModule, ButtonModule],
    templateUrl: './list-search.component.html',
    styleUrl: './list-search.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListSearchComponent {

    public readonly searchTerm = input.required<string>();

    public readonly searchTermChange = output<string>();

    public readonly placeholder = input.required<string>();

    public get searchTermValue(): string {
        return this.searchTerm();
    }

    public set searchTermValue(value: string) {
        this.searchTermChange.emit(value);
    }
}
