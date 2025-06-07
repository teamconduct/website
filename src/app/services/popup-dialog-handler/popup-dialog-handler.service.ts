import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type DialogType = 'fineDetailAddEdit' | 'paypalMeAddEdit';

@Injectable({
    providedIn: 'root'
})
export class PopupDialogHandlerService {

    private currentDialogType = new BehaviorSubject<DialogType | null>(null);

    public setActive(dialogType: DialogType | null, isActive: boolean) {
        this.currentDialogType.next(isActive ? dialogType : null);
    }

    public closeDialog() {
        this.currentDialogType.next(null);
    }

    public activate(dialogType: DialogType) {
        this.currentDialogType.next(dialogType);
    }

    public get $current(): Observable<DialogType | null> {
        return this.currentDialogType.asObservable();
    }
}
