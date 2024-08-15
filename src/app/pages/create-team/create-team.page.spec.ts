import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTeamOrRegisterInvitationPage } from './create-team.page';

describe('CreateTeamOrRegisterInvitationPage', () => {
  let component: CreateTeamOrRegisterInvitationPage;
  let fixture: ComponentFixture<CreateTeamOrRegisterInvitationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTeamOrRegisterInvitationPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTeamOrRegisterInvitationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
