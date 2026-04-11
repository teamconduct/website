import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInLeftPanelComponent } from './sign-in-left-panel.component';

describe('SignInLeftPanelComponent', () => {
  let component: SignInLeftPanelComponent;
  let fixture: ComponentFixture<SignInLeftPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInLeftPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignInLeftPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
