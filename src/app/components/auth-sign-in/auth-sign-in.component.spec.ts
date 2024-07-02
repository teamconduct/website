import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSignInComponent } from './auth-sign-in.component';

describe('AuthSignInComponent', () => {
    let component: AuthSignInComponent;
    let fixture: ComponentFixture<AuthSignInComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AuthSignInComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(AuthSignInComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
