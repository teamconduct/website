import { Injectable } from '@angular/core';
import { Fine, Person } from '@stevenkellner/team-conduct-api';
import { BehaviorSubject, Observable } from 'rxjs';

interface IDialogData {
    type: string;
}

export interface FineDetailDialogData extends IDialogData {
    type: 'fineDetail';
    personId: Person.Id;
    fine: Fine;
}

export interface FineAddEditDialogData extends IDialogData {
    type: 'fineAddEdit';
    personId: Person.Id | null;
    fine: Fine | null;
}

export interface PaypalMeAddEditDialogData extends IDialogData {
    type: 'paypalMeAddEdit';
}

export type DialogData =
    | FineDetailDialogData
    | FineAddEditDialogData
    | PaypalMeAddEditDialogData;

@Injectable({
    providedIn: 'root'
})
export class PopupDialogHandlerService {

    private currentDialog = new BehaviorSubject<DialogData | null>(null);

    public setActive(dialog: DialogData | null, isActive: boolean) {
        this.currentDialog.next(isActive ? dialog : null);
    }

    public closeDialog() {
        this.currentDialog.next(null);
    }

    public activate(dialog: DialogData) {
        this.currentDialog.next(dialog);
    }

    public get $current(): Observable<DialogData | null> {
        return this.currentDialog.asObservable();
    }
}
