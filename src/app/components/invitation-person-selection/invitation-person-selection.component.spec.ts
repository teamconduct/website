import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationPersonSelectionComponent } from './invitation-person-selection.component';

describe('InvitationPersonSelectionComponent', () => {
  let component: InvitationPersonSelectionComponent;
  let fixture: ComponentFixture<InvitationPersonSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitationPersonSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitationPersonSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
