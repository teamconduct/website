import { inject, Injectable } from '@angular/core';
import { Functions } from '@angular/fire/functions';
import { firebaseFunctionsContext } from '@stevenkellner/team-conduct-api'
import { BytesCoder } from '@stevenkellner/typescript-common-functionality';
import { macKey } from '../../../environments/environment';
import { ClientFirebaseFunctions } from './ClientFirebaseFunctions';

@Injectable({
    providedIn: 'root'
})
export class FirebaseFunctionsService {

    private functionsInstance = inject(Functions);

    public readonly functions: ReturnType<typeof ClientFirebaseFunctions.create<typeof firebaseFunctionsContext>>;

    public constructor() {
        this.functions = ClientFirebaseFunctions.create(firebaseFunctionsContext, this.functionsInstance, BytesCoder.fromHex(macKey));
    }
}
