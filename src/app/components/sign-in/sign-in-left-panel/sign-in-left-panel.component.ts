import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InfiniteSlidesComponent } from '../../infinite-slides/infinite-slides.component';

/// Interface for text slide content with title and description
export interface TextSlide {
    title: string;
    description: string;
}

/**
 * Left panel component for the sign-in page.
 * Displays a logo and an infinite carousel of welcome messages.
 */
@Component({
    selector: 'app-sign-in-left-panel',
    imports: [InfiniteSlidesComponent],
    templateUrl: './sign-in-left-panel.component.html',
    styleUrl: './sign-in-left-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInLeftPanelComponent {

    /// Color scheme for the panel including gradients, text, and indicator dots
    public get colors(): Record<'background-gradient-left' | 'background-gradient-right' | 'text' | 'bottom-gradient' | 'dots-selected' | 'dots-unselected', string> {
        return {
            'background-gradient-left': '#667eea',
            'background-gradient-right': '#764ba2',
            text: '#FFFFFF',
            'bottom-gradient': '#202020cc',
            'dots-selected': '#FFFFFF',
            'dots-unselected': '#FFFFFF88',
        };
    }

    /// Array of welcome message slides displayed in the carousel
    public get textSlides(): TextSlide[] {
        return [
            {
                title: 'Welcome back to our platform',
                description: "Sign in to access your dashboard and continue your journey with us. We've missed you!"
            },
            {
                title: 'Secure and Reliable',
                description: 'Your security is our top priority. Sign in with confidence knowing your data is protected with industry-leading measures.'
            },
            {
                title: 'Personalized Experience',
                description: 'Access your personalized settings and preferences by signing in. Tailor your experience to suit your needs.'
            }
        ];
    }
}
