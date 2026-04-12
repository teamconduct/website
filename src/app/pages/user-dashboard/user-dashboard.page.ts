import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';
import { LeftSidebarComponent } from '../../components/left-sidebar/left-sidebar.component';
import { DashboardStatsComponent } from '../../components/dashboard-stats/dashboard-stats.component';
import { Title } from '@angular/platform-browser';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AppStateManagerService } from '../../services/app-state-manager/app-state-manager.service';
import { DataManagerService } from '../../services/data-manager/data-manager.service';
import { FirebaseFunctionsService } from '../../services/firebase-functions/firebase-functions.service';
import { routeNames } from '../../app.routes';
import { Result } from '@stevenkellner/typescript-common-functionality';

@Component({
    selector: 'page-user-dashboard',
    imports: [TopHeaderComponent, LeftSidebarComponent, DashboardStatsComponent],
    templateUrl: './user-dashboard.page.html',
    styleUrl: './user-dashboard.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardPage implements OnInit {

    private readonly titleService = inject(Title);

    private firebaseAuth = inject(Auth);

    private readonly router = inject(Router);

    private readonly appStateManager = inject(AppStateManagerService);

    private readonly dataManager = inject(DataManagerService);

    private readonly firebaseFunctions = inject(FirebaseFunctionsService);

    private readonly cdr = inject(ChangeDetectorRef);

    public ngOnInit() {
        this.titleService.setTitle($localize `:User Dashboard Page Title:User Dashboard - Team Conduct`);
        this.firebaseAuth.onAuthStateChanged(async authUser => {
            if (authUser === null)
                return this.signOut();
            let user = this.appStateManager.user$.value;
            if (user === null) {
                const loginResult = await this.firebaseFunctions.functions.user.login.executeWithResult(null);
                if (Result.isFailure(loginResult) && loginResult.error.code === 'not-found')
                    return this.signOut();
                user = loginResult.value;
            }
            if (user === null)
                return this.signOut();
            this.appStateManager.setUser(user);
            this.dataManager.startObserve(user, this.cdr);
        });
    }

    private async signOut(): Promise<void> {
        await this.firebaseAuth.signOut();
        this.dataManager.reset();
        this.appStateManager.setUser(null);
        void this.router.navigate([`/${routeNames.signIn}`]);
    }
}
