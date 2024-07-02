import { ITypeBuilder } from '../typeBuilder';
import { Flatten } from '../types/Flattable';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class FirebaseFunction<Parameters, ReturnType> {

    public constructor(
        public readonly returnTypeBuilder: ITypeBuilder<Flatten<ReturnType>, ReturnType>
    ) {}
}

export type FirebaseFunctions =
    | FirebaseFunction<any, any>
    | { [key: string]: FirebaseFunctions }

export namespace FirebaseFunctions {

    export type IsRecord<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunction<unknown, unknown> ? false :
            true;

    export type FunctionParameters<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunction<infer Parameters, unknown> ? Parameters :
            never;

    export type FunctionReturnType<Functions extends FirebaseFunctions> =
        Functions extends FirebaseFunction<unknown, infer ReturnType> ? ReturnType :
            never;
}
