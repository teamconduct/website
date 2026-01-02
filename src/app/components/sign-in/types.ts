/**
 * Types and interfaces for sign-in components
 */

/**
 * Type of authentication provider
 */
export type AuthProvider = 'username-password' | 'google' | 'apple';

/**
 * Error types that can occur during username/password authentication
 */
export type UsernamePasswordError = 'username-password-invalid' | 'wrong-password' | 'internal-error' | 'not-registered' | 'username-taken';

/**
 * Error types that can occur during third-party authentication
 */
export type ThirdPartyError = 'popup-closed' | 'internal-error';

/**
 * Form submission result from username/password form
 */
export type FormSubmitResult = 'input-invalid' | {
    username: string;
    password: string;
};

/**
 * Registration form submission result (password can be null for third-party registrations)
 */
export type FormRegisterResult = 'input-invalid' | {
    username: string;
    password: string | null;
};

/**
 * Loading state for each authentication method
 */
export interface AuthLoadingState {
    usernamePassword: boolean;
    google: boolean;
    apple: boolean;
}

/**
 * Disabled state for each authentication method
 */
export interface AuthDisabledState {
    usernamePassword: boolean;
    google: boolean;
    apple: boolean;
}

/**
 * Error state for each authentication method
 */
export interface AuthErrorState {
    usernamePassword: UsernamePasswordError | null;
    google: ThirdPartyError | null;
    apple: ThirdPartyError | null;
}

/**
 * Complete authentication UI state
 */
export interface AuthState {
    loading: AuthLoadingState;
    disabled: AuthDisabledState;
    errors: AuthErrorState;
    registerMode: boolean;
    passwordShown: boolean;
    registerButtonShown: boolean;
    cancelButtonDisabled: boolean;
}

/**
 * Interface for text slide content with title and description
 */
export interface TextSlide {
    title: string;
    description: string;
}
