import { Functions, httpsCallable } from '@angular/fire/functions';
import { mapRecord, Result } from '@stevenkellner/typescript-common-functionality';
import { BaseClientFirebaseFunction, FirebaseFunction, FirebaseFunctionContext, FirebaseFunctionsContext, FirebaseRequestContext, FirebaseScheduleContext, FunctionsError } from '@stevenkellner/firebase-function';

export class ClientFirebaseFunction<Parameters, ReturnType> extends BaseClientFirebaseFunction<Parameters, ReturnType> {

    public constructor(
        FirebaseFunction: FirebaseFunction.Constructor<Parameters, ReturnType>,
        macKey: Uint8Array,
        private readonly functions: Functions,
        private readonly name: string
    ) {
        super(FirebaseFunction, macKey);
    }

    public async executeWithResult(parameters: Parameters): Promise<Result<ReturnType, FunctionsError>> {
        const functionCallable = httpsCallable<FirebaseFunction.ParametersData<Parameters>, Result.Flatten<ReturnType, FunctionsError>>(this.functions, this.name);
        const httpsCallableResult = await functionCallable(this.parametersData(parameters));
        return this.result(httpsCallableResult.data);
    }
}

export type ClientFirebaseFunctions<Context extends FirebaseFunctionsContext> =
    Context extends FirebaseFunctionContext<infer Parameters, infer ReturnType> ? ClientFirebaseFunction<Parameters, ReturnType> :
        Context extends FirebaseRequestContext<any, any> ? null :
            Context extends FirebaseScheduleContext ? null :
                Context extends { [key: string]: FirebaseFunctionsContext } ? { [Key in keyof Context]: ClientFirebaseFunctions<Context[Key]> } : never;

export namespace ClientFirebaseFunctions {

    export function create<Context extends FirebaseFunctionsContext>(
        context: Context,
        functions: Functions,
        macKey: Uint8Array,
        name: string = ''
    ): ClientFirebaseFunctions<Context> {
        if (context instanceof FirebaseFunctionContext)
            return new ClientFirebaseFunction(context.Constructor, macKey, functions, name) as ClientFirebaseFunctions<Context>;
        if (context instanceof FirebaseRequestContext)
            return null as ClientFirebaseFunctions<Context>;
        if (context instanceof FirebaseScheduleContext)
            return null as ClientFirebaseFunctions<Context>;
        return mapRecord(context as Record<string, FirebaseFunctionsContext>, (context, key) => create(context, functions, macKey, name === '' ? key : `${name}-${key}`)) as ClientFirebaseFunctions<Context>;
    }
}
