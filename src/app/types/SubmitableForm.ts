import { AbstractControl, FormGroup, ValidationErrors, ɵFormGroupRawValue } from '@angular/forms';
import { markAllAsDirty } from '../utils/markAllAsDirty';
import { LoadingState } from './LoadingState';
import { Observable } from 'rxjs';

type ValidatorFn<Control extends SubmitableForm.ControlRequirement> = (control: AbstractControl<ɵFormGroupRawValue<Control>>) => ValidationErrors | null;
type AsyncValidatorFn<Control extends SubmitableForm.ControlRequirement> = (control: AbstractControl<ɵFormGroupRawValue<Control>>) => Promise<ValidationErrors | null> | Observable<ValidationErrors | null>;

export class SubmitableForm<
    Control extends SubmitableForm.ControlRequirement = any,
    Error extends SubmitableForm.ErrorRequirement = never
> extends FormGroup<Control> {

    public loadingState = new LoadingState<'input' | 'server' | Error>();

    public successHandlers: (() => void)[] = [];

    public errorMessages: {
        [K in 'input' | 'server' | Error]: string;
    };

    public constructor(
        controls: Control,
        errorMessages: {
            [K in Error]: string;
        },
        validatorOrOpts?: ValidatorFn<Control> | ValidatorFn<Control>[] | null,
        asyncValidator?: AsyncValidatorFn<Control> | AsyncValidatorFn<Control>[] | null
    ) {
        super(controls, validatorOrOpts, asyncValidator);
        this.errorMessages = {
            input: $localize `:Error message that not all required fields are valid:Please fill in all required fields`,
            server: $localize `:Error message that an internal server error has occured:An error occurred, please try again later`,
            ...errorMessages
        };
    }

    protected async submit(): Promise<Error | void> {
        throw new Error('Not implemented');
    }

    public get errorMessage(): string | null {
        if (this.loadingState.isFailure())
            return this.errorMessages[this.loadingState.error];
        return null;
    }

    public addSuccessHandler(handler: () => void) {
        this.successHandlers.push(handler);
    }

    private markAllAsDirty() {
        Object.keys(this.controls).forEach(key => {
            const control = super.get(key);
            if (control instanceof FormGroup)
                markAllAsDirty(control);
            control?.markAsDirty();
        });
    }

    public override reset() {
        super.reset();
        this.loadingState.reset();
    }

    public async checkAndSubmit() {

        if (this.loadingState.isLoading())
            return;
        this.markAllAsDirty();
        if (super.invalid) {
            this.loadingState.toFailure('input');
            return;
        }
        this.loadingState.toLoading();

        try {
            const error = await this.submit();
            if (error !== undefined) {
                this.loadingState.toFailure(error);
                return;
            }
        } catch {
            this.loadingState.toFailure('server');
            return;
        }

        this.reset();
        for (const handler of this.successHandlers)
            handler();
    }
}

export namespace SubmitableForm {

    export type ControlRequirement = {
        [K in string]: AbstractControl<any>;
    }

    export type ErrorRequirement = PropertyKey;
}
