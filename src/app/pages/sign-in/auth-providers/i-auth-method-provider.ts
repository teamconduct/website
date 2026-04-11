import { ChangeDetectorRef } from '@angular/core';
import { AuthProvider, ThirdPartyError, UsernamePasswordError } from '../types';
import { SignInService } from '../../../services/sign-in/sign-in.service';
import { Result } from '@stevenkellner/typescript-common-functionality';

/**
 * Base interface for authentication method providers
 * Encapsulates state management and authentication logic for each sign-in method
 */
export abstract class IAuthMethodProvider<TError = ThirdPartyError | UsernamePasswordError> {
    public loading = false;
    public disabled = false;
    public error: TError | null = null;

    constructor(
        protected readonly signInService: SignInService,
        protected readonly cdr: ChangeDetectorRef
    ) {}

    /**
     * Gets the provider type identifier
     */
    abstract get providerType(): AuthProvider;

    /**
     * Gets the localized error message for the current error state
     */
    abstract get errorMessage(): string | null;

    /**
     * Starts loading state
     */
    public startLoading(): void {
        this.loading = true;
        this.cdr.markForCheck();
    }

    /**
     * Stops loading state
     */
    public stopLoading(): void {
        this.loading = false;
        this.cdr.markForCheck();
    }

    /**
     * Sets disabled state
     */
    public setDisabled(disabled: boolean): void {
        this.disabled = disabled;
        this.cdr.markForCheck();
    }

    /**
     * Sets error state
     */
    public setError(error: TError | null): void {
        this.error = error;
        this.cdr.markForCheck();
    }

    /**
     * Clears error state
     */
    public clearError(): void {
        this.error = null;
        this.cdr.markForCheck();
    }

    /**
     * Performs authentication with the provider's credentials
     * @returns Result of the authentication attempt
     */
    abstract authenticate(...args: any[]): Promise<Result<void, 'popup-cancelled' | 'popup-blocked' | 'wrong-password' | 'unknown'>>;
}
