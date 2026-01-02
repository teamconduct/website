import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignInUsernamePasswordFormComponent } from './sign-in-username-password-form.component';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

describe('SignInUsernamePasswordFormComponent', () => {
  let component: SignInUsernamePasswordFormComponent;
  let fixture: ComponentFixture<SignInUsernamePasswordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInUsernamePasswordFormComponent]
    })
    .compileComponents();

    // Register FontAwesome icons
    const library = TestBed.inject(FaIconLibrary);
    library.addIconPacks(fas);

    fixture = TestBed.createComponent(SignInUsernamePasswordFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
