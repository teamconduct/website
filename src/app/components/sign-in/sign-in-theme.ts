/**
 * Shared color configuration for sign-in components
 */

/**
 * Color scheme for sign-in components
 */
export interface SignInColorScheme {
    'highlight-background': string;
    'highlight-text': string;
    'text': string;
}

/**
 * Color scheme for the left panel with gradients
 */
export interface LeftPanelColorScheme {
    'background-gradient-left': string;
    'background-gradient-right': string;
    'text': string;
    'bottom-gradient': string;
    'dots-selected': string;
    'dots-unselected': string;
}

/**
 * Color scheme for third-party authentication buttons
 */
export interface ThirdPartyButtonColorScheme {
    'google-background': string;
    'google-text': string;
    'apple-background': string;
    'apple-text': string;
}

/**
 * Main sign-in theme colors
 */
export const SIGN_IN_THEME: SignInColorScheme = {
    'highlight-background': '#667eea',
    'highlight-text': '#FFFFFF',
    'text': '#202020',
};

/**
 * Left panel theme colors with gradient
 */
export const LEFT_PANEL_THEME: LeftPanelColorScheme = {
    'background-gradient-left': '#667eea',
    'background-gradient-right': '#764ba2',
    'text': '#FFFFFF',
    'bottom-gradient': '#202020cc',
    'dots-selected': '#FFFFFF',
    'dots-unselected': '#FFFFFF88',
};

/**
 * Third-party authentication button colors
 */
export const THIRD_PARTY_BUTTON_THEME: ThirdPartyButtonColorScheme = {
    'google-background': '#EEEEEE',
    'google-text': '#000000',
    'apple-background': '#000000',
    'apple-text': '#FFFFFF',
};
