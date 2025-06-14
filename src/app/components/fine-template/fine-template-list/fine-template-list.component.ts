import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TeamDataManagerService } from '../../../services/team-data-manager/team-data-manager.service';
import { fineTemplateListSorting } from '../../../types/sorting/fine-template-list-sorting';
import { UserManagerService } from '../../../services/user-manager/user-manager.service';
import { Observable } from '../../../types';
import { FineTemplate } from '@stevenkellner/team-conduct-api';
import { AsyncPipe } from '@angular/common';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FineTemplateListElementComponent } from '../fine-template-list-element/fine-template-list-element.component';
import { SelectModule } from 'primeng/select';
import { PopupDialogHandlerService } from '../../../services/popup-dialog-handler/popup-dialog-handler.service';

@Component({
    selector: 'app-fine-template-list',
    imports: [AsyncPipe, DataViewModule, SelectModule, ButtonModule, FontAwesomeModule, FineTemplateListElementComponent],
    templateUrl: './fine-template-list.component.html',
    styleUrl: './fine-template-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineTemplateListComponent {

    public userManager = inject(UserManagerService);

    public teamDataManager = inject(TeamDataManagerService);

    private popupDialogHandler = inject(PopupDialogHandlerService);

    public sorting = fineTemplateListSorting;

    public get fineTemplates$(): Observable<FineTemplate[]> {
        return this.teamDataManager.fineTemplates$.map(fineTemplatesDict => {
            const fineTemplates = fineTemplatesDict.values;
            this.sorting.sort(fineTemplates);
            return fineTemplates;
        });
    }

    public get skeletonFineTemplates(): null[] {
        return new Array(10).fill(null);
    }

    public fineTemplatesType(value: any): (FineTemplate | null)[] {
        return value;
    }

    public get canAddFineTemplate$(): Observable<boolean> {
        return this.userManager.hasRole('fineTemplate-manager');
    }

    public addFineTemplateClicked() {
        this.popupDialogHandler.activate({
            type: 'fineTemplateAddEdit',
            fineTemplate: null
        });
    }
}
