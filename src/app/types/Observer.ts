import { Unsubscribe } from '@angular/fire/auth';
import { CollectionReference, DocumentReference, onSnapshot, query } from '@angular/fire/firestore';
import { Observable } from './Observable';
import { ITypeBuilder, Flattable, Dictionary } from '@stevenkellner/typescript-common-functionality';

export class Observer<Id extends string | Flattable<string>, T> {

    private unsubscribe: Unsubscribe | null = null;

    public constructor(
        private readonly idBuilder: ITypeBuilder<string, Id>,
        private readonly builder: ITypeBuilder<Flattable.Flatten<T>, T>
    ) {}

    public start(document: DocumentReference<Flattable.Flatten<T>>, initialValue?: T | null): Observable<T>;
    public start(collection: CollectionReference<Flattable.Flatten<T>>, initialValue?: Dictionary<Id, T> | null): Observable<Dictionary<Id, T>>;
    public start(documentOrCollection: DocumentReference<Flattable.Flatten<T>> | CollectionReference<Flattable.Flatten<T>>, initialValue: T | Dictionary<Id, T> | null = null): Observable<T> | Observable<Dictionary<Id, T>> {
        if (documentOrCollection instanceof DocumentReference)
            return this.startDocument(documentOrCollection, initialValue as T | null);
        else
            return this.startCollection(documentOrCollection, initialValue as Dictionary<Id, T> | null);
    }

    private startDocument(document: DocumentReference<Flattable.Flatten<T>>, initialValue: T | null): Observable<T> {
        this.stop();
        const observable = new Observable<T>(initialValue);
        this.unsubscribe = onSnapshot(document,
            snapshot => {
                if (!snapshot.exists())
                    return;
                const data = this.builder.build(snapshot.data()!);
                observable.next(data);
            },
            error => observable.error(error),
            () => observable.complete()
        );
        return observable;
    }

    private startCollection(collection: CollectionReference<Flattable.Flatten<T>>, initialValue: Dictionary<Id, T> | null): Observable<Dictionary<Id, T>> {
        this.stop();
        const observable = new Observable<Dictionary<Id, T>>(initialValue);
        this.unsubscribe = onSnapshot(query(collection),
            snapshot => {
                const data = new Dictionary<Id, T>(this.idBuilder);
                snapshot.forEach(snapshot => {
                    if (!snapshot.exists())
                        return;
                    const id = this.idBuilder.build(snapshot.id);
                    const element = this.builder.build(snapshot.data());
                    data.set(id, element);
                });
                observable.next(data);
            },
            error => observable.error(error),
            () => observable.complete()
        );
        return observable;
    }

    public stop() {
        if (this.unsubscribe !== null)
            this.unsubscribe();
        this.unsubscribe = null;
    }
}
