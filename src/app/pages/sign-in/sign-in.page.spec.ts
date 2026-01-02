import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Functions } from '@angular/fire/functions';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faLock, faKey, faUser } from '@fortawesome/free-solid-svg-icons';
import { SignInPage } from './sign-in.page';

describe('SignInPage', () => {
    let component: SignInPage;
    let fixture: ComponentFixture<SignInPage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SignInPage],
            providers: [
                { provide: Functions, useValue: jasmine.createSpyObj('Functions', ['httpsCallable']) }
            ]
        })
        .compileComponents();

        const iconLibrary = TestBed.inject(FaIconLibrary);
        iconLibrary.addIcons(faLock, faKey, faUser);

        fixture = TestBed.createComponent(SignInPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
