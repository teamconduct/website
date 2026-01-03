import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SignInLeftPanelComponent, SignInPanelComponent } from '../../components/sign-in';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'page-sign-in',
    imports: [SignInLeftPanelComponent, SignInPanelComponent],
    templateUrl: './sign-in.page.html',
    styleUrl: './sign-in.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInPage implements OnInit {

    private readonly titleService = inject(Title);

    public ngOnInit() {
        this.titleService.setTitle($localize `:Sign In Page Title:Sign In - Team Conduct`);
    }
}
