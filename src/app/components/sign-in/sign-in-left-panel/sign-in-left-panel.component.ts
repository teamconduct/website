import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InfiniteSlidesComponent } from '../../infinite-slides/infinite-slides.component';
import { LEFT_PANEL_THEME, LeftPanelColorScheme } from '../sign-in-theme';
import { TextSlide } from '../types';

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

    public get colors(): LeftPanelColorScheme {
        return LEFT_PANEL_THEME;
    }

    /// Array of welcome message slides displayed in the carousel
    public get textSlides(): TextSlide[] {
        return [
            {
                title: $localize `:Title of the first slide of the sign-in left panel:Welcome back to our platform`,
                description: $localize `:Description of the first slide of the sign-in left panel:Sign in to access your dashboard and continue your journey with us. We've missed you!`
            },
            {
                title: $localize `:Title of the second slide of the sign-in left panel:Secure and Reliable`,
                description: $localize `:Description of the second slide of the sign-in left panel:Your security is our top priority. Sign in with confidence knowing your data is protected with industry-leading measures.`
            },
            {
                title: $localize `:Title of the third slide of the sign-in left panel:Personalized Experience`,
                description: $localize `:Description of the third slide of the sign-in left panel:Access your personalized settings and preferences by signing in. Tailor your experience to suit your needs.`
            }
        ];
    }
}
