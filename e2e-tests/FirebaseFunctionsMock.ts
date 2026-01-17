import { BytesCoder, mapRecord, Result } from '@stevenkellner/typescript-common-functionality';
import { Page } from '@playwright/test';
import { BaseClientFirebaseFunction, FirebaseFunction, FirebaseFunctionContext, FirebaseFunctionsContext, FirebaseRequestContext, FirebaseScheduleContext, FunctionsError, FunctionsErrorCode } from '@stevenkellner/firebase-function';
import { macKey } from '../src/environments/environment';
import { firebaseFunctionsContext } from '@stevenkellner/team-conduct-api';

export class FirebaseFunctionMock<Parameters, ReturnType> extends BaseClientFirebaseFunction<Parameters, ReturnType> {

    public constructor(
        FirebaseFunction: FirebaseFunction.Constructor<Parameters, ReturnType>,
        macKey: Uint8Array,
        private readonly page: Page,
        private readonly name: string
    ) {
        super(FirebaseFunction, macKey);
    }

    public async executeWithResult(_parameters: Parameters): Promise<Result<ReturnType, FunctionsError>> {
        throw new Error('Method not implemented.');
    }

    public async mock(result: Result<ReturnType, FunctionsErrorCode>, timeoutMs: number = 0) {
        await this.page.route(`**/team-conduct/**/${this.name}`, async route => {
            if (timeoutMs > 0) {
                await new Promise<void>(resolve => setTimeout(() => resolve(), timeoutMs));
            }
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    result: result
                        .map(returnValue => returnValue)
                        .mapError(errorCode => new FunctionsError(errorCode, ''))
                        .flatten
                })
            });
        });
    }

    public async mockFailure(errorCode: FunctionsErrorCode, timeoutMs: number = 0) {
        await this.mock(Result.failure(errorCode), timeoutMs);
    }

    public async mockSuccess(returnValue: ReturnType, timeoutMs: number = 0) {
        await this.mock(Result.success(returnValue), timeoutMs);
    }
}

export type FirebaseFunctionsMock<Context extends FirebaseFunctionsContext> =
    Context extends FirebaseFunctionContext<infer Parameters, infer ReturnType> ? FirebaseFunctionMock<Parameters, ReturnType> :
        Context extends FirebaseRequestContext<any, any> ? null :
            Context extends FirebaseScheduleContext ? null :
                Context extends { [key: string]: FirebaseFunctionsContext } ? { [Key in keyof Context]: FirebaseFunctionsMock<Context[Key]> } : never;

export namespace FirebaseFunctionsMock {

    export function _create<Context extends FirebaseFunctionsContext>(
        context: Context,
        page: Page,
        macKey: Uint8Array,
        name: string = ''
    ): FirebaseFunctionsMock<Context> {
        if (context instanceof FirebaseFunctionContext)
            return new FirebaseFunctionMock(context.Constructor, macKey, page, name) as FirebaseFunctionsMock<Context>;
        if (context instanceof FirebaseRequestContext)
            return null as FirebaseFunctionsMock<Context>;
        if (context instanceof FirebaseScheduleContext)
            return null as FirebaseFunctionsMock<Context>;
        return mapRecord(context as Record<string, FirebaseFunctionsContext>, (context, key) => _create(context, page, macKey, name === '' ? key : `${name}-${key}`)) as FirebaseFunctionsMock<Context>;
    }

    export function create(page: Page): FirebaseFunctionsMock<typeof firebaseFunctionsContext> {
        return FirebaseFunctionsMock._create(firebaseFunctionsContext, page, BytesCoder.fromHex(macKey))
    }
}
