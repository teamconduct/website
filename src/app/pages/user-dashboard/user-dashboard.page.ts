import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';
import { LeftSidebarComponent } from '../../components/left-sidebar/left-sidebar.component';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'page-user-dashboard',
    imports: [TopHeaderComponent, LeftSidebarComponent],
    templateUrl: './user-dashboard.page.html',
    styleUrl: './user-dashboard.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardPage implements OnInit {

    private readonly titleService = inject(Title);

    public ngOnInit() {
        this.titleService.setTitle($localize `:User Dashboard Page Title:User Dashboard - Team Conduct`);
    }
}
