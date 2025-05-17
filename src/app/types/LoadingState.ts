export class LoadingState<E> {

    protected state: States.All<E>['state'] = 'not-started';

    public error: States.All<E>['error'] = null;

    public isNotStarted(): this is States.NotStarted {
        return this.state === 'not-started';
    }

    public isSuccess(): this is States.Success {
        return this.state === 'success';
    }

    public isLoading(): this is States.Loading {
        return this.state === 'loading';
    }

    public isFailure(): this is States.Failure<E> {
        return this.state === 'failure';
    }

    public mapError<E2>(mapper: (error: E) => E2): LoadingState<E2> {
        const loadingState = new LoadingState<E2>();
        loadingState.state = this.state;
        if (this.isFailure())
            loadingState.error = mapper(this.error);
        return loadingState;
    }

    public reset() {
        this.state = 'not-started';
        this.error = null;
    }

    public toSuccess(){
        this.state = 'success';
        this.error = null;
    }

    public toLoading(){
        this.state = 'loading';
        this.error = null;
    }

    public toFailure(error: E){
        this.state = 'failure';
        this.error = error;
    }
}

namespace States {

    export type NotStarted = {
        state: 'not-started';
        error: null;
    };

    export type Loading = {
        state: 'loading';
        error: null;
    }

    export type Success = {
        state: 'success';
        error: null;
    }

    export type Failure<E> = {
        state: 'failure';
        error: E;
    }

    export type All<E> = NotStarted | Loading | Success | Failure<E>;
}
