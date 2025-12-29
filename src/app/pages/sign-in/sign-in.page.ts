import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SignInLeftPanelComponent } from '../../components/sign-in/sign-in-left-panel/sign-in-left-panel.component';

@Component({
    selector: 'page-sign-in',
    imports: [SignInLeftPanelComponent],
    templateUrl: './sign-in.page.html',
    styleUrl: './sign-in.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInPage {

}
