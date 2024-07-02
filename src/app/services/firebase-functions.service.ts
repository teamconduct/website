import { inject, Injectable } from '@angular/core';
import { Functions as FunctionsInstance, httpsCallable } from '@angular/fire/functions';
import { FirebaseFunction, FirebaseFunctions } from '../firebase/FirebaseFunction';
import { firebaseFunctions } from '../firebase/firebaseFunctions';
import { Flattable, Flatten } from '../types/Flattable';
import { Result } from '../types/Result';
import { HMAC } from '../utils/HMAC';
import { macKey } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FirebaseFunctionsService {

    private functionsInstance = inject(FunctionsInstance);

    public function<Key extends FirebaseFunctions.IsRecord<typeof firebaseFunctions> extends true ? keyof typeof firebaseFunctions & string : never>(
        key: Key
    ): FirebaseFunctionsCaller<typeof firebaseFunctions extends { [key: string]: FirebaseFunctions } ? typeof firebaseFunctions[Key] : never> {
        return new FirebaseFunctionsCaller(this.functionsInstance, firebaseFunctions[key], key);
    }
}

export class FirebaseFunctionsCaller<Functions extends FirebaseFunctions> {

    public constructor(
        private readonly functionsInstance: FunctionsInstance,
        private readonly firebaseFunction: Functions,
        private readonly name: string
    ) {}

    public function<Key extends FirebaseFunctions.IsRecord<Functions> extends true ? keyof Functions & string : never>(
        key: Key
    ): FirebaseFunctionsCaller<Functions extends { [key: string]: FirebaseFunctions } ? Functions[Key] : never> {
        return new FirebaseFunctionsCaller(this.functionsInstance, this.firebaseFunction[key] as Functions extends { [key: string]: FirebaseFunctions } ? Functions[Key] : never, `${this.name}-${key}`);
    }

    private createMacTag(parameters: unknown): string {
        const hmac = new HMAC(macKey);
        return hmac.sign(JSON.stringify(parameters));
    }

    public async call(
        parameters: FirebaseFunctions.FunctionParameters<Functions>
    ): Promise<FirebaseFunctions.FunctionReturnType<Functions>> {
        const flattenParameters = Flattable.flatten(parameters);
        const macTag = this.createMacTag(flattenParameters);
        const callableFunction = httpsCallable(this.functionsInstance, this.name);
        const response = await callableFunction({
            verboseLogger: true,
            macTag: macTag,
            parameters: flattenParameters
        });
        const result = Result.from<Flatten<FirebaseFunctions.FunctionReturnType<Functions>>>(response.data);
        const flattenReturnValue = result.get();
        return (this.firebaseFunction as FirebaseFunction<any, FirebaseFunctions.FunctionReturnType<Functions>>).returnTypeBuilder.build(flattenReturnValue);
    }
}
