import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SignInLeftPanelComponent, SignInPanelComponent } from '../../components/sign-in';

@Component({
    selector: 'page-sign-in',
    imports: [SignInLeftPanelComponent, SignInPanelComponent],
    templateUrl: './sign-in.page.html',
    styleUrl: './sign-in.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInPage {

}
