import { Unsubscribe } from '@angular/fire/auth';
import { CollectionReference, DocumentReference, onSnapshot, query } from '@angular/fire/firestore';
import { ITypeBuilder } from '../typeBuilder';
import { Dictionary } from './Dictionary';
import { Flatten } from './Flattable';
import { Observable } from './Observable';

export class Observer<Id, T> {

    private unsubscribe: Unsubscribe | null = null;

    public constructor(
        private readonly idBuilder: ITypeBuilder<string, Id>,
        private readonly builder: ITypeBuilder<Flatten<T>, T>
    ) {}

    public start(document: DocumentReference<Flatten<T>>, initialValue?: T | null): Observable<T>;
    public start(collection: CollectionReference<Flatten<T>>, initialValue?: Dictionary<Id, T> | null): Observable<Dictionary<Id, T>>;
    public start(documentOrCollection: DocumentReference<Flatten<T>> | CollectionReference<Flatten<T>>, initialValue: T | Dictionary<Id, T> | null = null): Observable<T> | Observable<Dictionary<Id, T>> {
        if (documentOrCollection instanceof DocumentReference)
            return this.startDocument(documentOrCollection, initialValue as T | null);
        else
            return this.startCollection(documentOrCollection, initialValue as Dictionary<Id, T> | null);
    }

    private startDocument(document: DocumentReference<Flatten<T>>, initialValue: T | null): Observable<T> {
        this.stop();
        const observer = new Observable<T>(initialValue);
        this.unsubscribe = onSnapshot(document, snapshot => {
            if (!snapshot.exists())
                return;
            const data = this.builder.build(snapshot.data()!);
            observer.next(data);
        }, error => observer.error(error),
        () => observer.complete());
        return observer;
    }

    private startCollection(collection: CollectionReference<Flatten<T>>, initialValue: Dictionary<Id, T> | null): Observable<Dictionary<Id, T>> {
        this.stop();
        const observer = new Observable<Dictionary<Id, T>>(initialValue);
        this.unsubscribe = onSnapshot(query(collection), snapshot => {
            const data = new Dictionary<Id, T>();
            snapshot.forEach(snapshot => {
                if (!snapshot.exists())
                    return;
                const id = this.idBuilder.build(snapshot.id);
                const element = this.builder.build(snapshot.data());
                data.set(id as any, element);
            });
            observer.next(data);
        }, error => observer.error(error),
        () => observer.complete());
        return observer;
    }

    public stop() {
        if (this.unsubscribe !== null) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }
}
