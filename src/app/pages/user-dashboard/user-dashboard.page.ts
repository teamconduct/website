import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';
import { LeftSidebarComponent } from '../../components/left-sidebar/left-sidebar.component';
import { Title } from '@angular/platform-browser';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserManagerService } from '../../services/user-manager/user-manager.service';
import { TeamDataManagerService } from '../../services/team-data-manager/team-data-manager.service';
import { FirebaseFunctionsService } from '../../services/firebase-functions/firebase-functions.service';
import { routeNames } from '../../app.routes';
import { Result } from '@stevenkellner/typescript-common-functionality';

@Component({
    selector: 'page-user-dashboard',
    imports: [TopHeaderComponent, LeftSidebarComponent],
    templateUrl: './user-dashboard.page.html',
    styleUrl: './user-dashboard.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardPage implements OnInit {

    private readonly titleService = inject(Title);

    private firebaseAuth = inject(Auth);

    private readonly router = inject(Router);

    private readonly userManager = inject(UserManagerService);

    private readonly teamDataManager = inject(TeamDataManagerService);

    private readonly firebaseFunctions = inject(FirebaseFunctionsService);

    private readonly cdr = inject(ChangeDetectorRef);

    public ngOnInit() {
        this.titleService.setTitle($localize `:User Dashboard Page Title:User Dashboard - Team Conduct`);
        this.firebaseAuth.onAuthStateChanged(async user => {
            if (user === null) {
                this.teamDataManager.reset();
                this.userManager.setUser(null);
                void this.router.navigate([`/${routeNames.signIn}`]);
            } else {
                const loginResult = await this.firebaseFunctions.functions.user.login.executeWithResult(null);
                if (Result.isFailure(loginResult) && loginResult.error.code === 'not-found') {
                    this.teamDataManager.reset();
                    this.userManager.setUser(null);
                    void this.router.navigate([`/${routeNames.signIn}`]);
                } else {
                    this.userManager.setUser(loginResult.value);
                    const teamId = this.userManager.selectedTeamId$.value;
                    if (teamId !== null) {
                        this.userManager.setTeamId(teamId);
                        this.teamDataManager.startObserve(teamId, this.cdr);
                        this.userManager.currentPersonId$.subscribe(currentPersonId => {
                            if (currentPersonId === null)
                                return;
                            // void this.registerSubscribeNotifications(teamId, currentPersonId);
                        });
                    }
                }
            }
        });
    }
}
