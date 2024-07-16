import { UserRole } from './../types/UserRole';
import { Flattable, Flatten } from './../types/Flattable';
import { inject, Injectable } from '@angular/core';
import { User } from '../types';
import { TeamId } from '../types/Team';
import { CookieService } from 'ngx-cookie-service';
import { ITypeBuilder } from '../typeBuilder';

@Injectable({
    providedIn: 'root'
})
export class UserManagerService {

    private cache = new Map<string, string>();

    private cookieService = inject(CookieService);

    private setCookie(key: string, value: any) {
        const json = JSON.stringify(Flattable.flatten(value));
        this.cache.set(key, json);
        this.cookieService.set(key, json);
    }

    private getCookie<T>(key: string, builder: ITypeBuilder<Flatten<T>, T>): T | null {
        let json: string | null = null;
        if (this.cache.has(key))
            json = this.cache.get(key) ?? null;
        if (this.cookieService.check(key))
            json = this.cookieService.get(key);
        if (json === null)
            return null;
        return builder.build(JSON.parse(json));
    }

    public set signedInUser(user: User) {
        this.setCookie('user', user);
    }

    public get signedInUser(): User | null {
        return this.getCookie('user', User.builder);
    }

    public set currentTeamId(teamId: TeamId) {
        this.setCookie('teamId', teamId);
    }

    public get currentTeamId(): TeamId | null {
        return this.getCookie('teamId', TeamId.builder);
    }

    public hasRole(...roles: [UserRole, ...UserRole[]]): boolean {
        const user = this.signedInUser;
        const teamId = this.currentTeamId;
        if (user === null || teamId === null || !user.teams.has(teamId))
            return false;
        const userRoles = user.teams.get(teamId).roles;
        return roles.every(role => userRoles.includes(role));
    }
}
