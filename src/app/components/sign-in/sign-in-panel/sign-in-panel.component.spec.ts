import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Functions } from '@angular/fire/functions';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faLock, faKey, faUser } from '@fortawesome/free-solid-svg-icons';
import { SignInPanelComponent } from './sign-in-panel.component';

describe('SignInPanelComponent', () => {
  let component: SignInPanelComponent;
  let fixture: ComponentFixture<SignInPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInPanelComponent],
      providers: [
        { provide: Functions, useValue: jasmine.createSpyObj('Functions', ['httpsCallable']) }
      ]
    })
    .compileComponents();

    const iconLibrary = TestBed.inject(FaIconLibrary);
    iconLibrary.addIcons(faLock, faKey, faUser);

    fixture = TestBed.createComponent(SignInPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
