import { ChangeDetectorRef, inject, Pipe, PipeTransform } from '@angular/core';
import { Observable } from '../types/Observable';

@Pipe({
    name: 'async',
    standalone: true
})
export class AsyncPipe implements PipeTransform {

    private currentObservable: Observable<any> | null = null;

    private currentValue: any | null = null;

    private changeDetector = inject(ChangeDetectorRef);

    public transform<T>(observable: Observable<T>): T | null {
        if (this.currentObservable === observable)
            return this.currentValue;
        this.currentObservable = observable;
        observable.subscribe(value => {
            this.currentValue = value;
            this.changeDetector.markForCheck();
        });
        if (this.currentValue === null)
            return this.currentObservable.value;
        return this.currentValue;
    }
}
