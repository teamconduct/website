export class LoadingState<E> {

    protected state: 'not-started' |'success' | 'loading' | 'failure' = 'not-started';

    public error: E | null = null;

    public isSuccess(): this is { state: 'success', error: null } {
        return this.state === 'success';
    }

    public isLoading(): this is { state: 'loading', error: null } {
        return this.state === 'loading';
    }

    public isFailure(): this is { state: 'failure', error: E } {
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
