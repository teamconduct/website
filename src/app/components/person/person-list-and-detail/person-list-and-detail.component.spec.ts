import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonListAndDetailComponent } from './person-list-and-detail.component';

describe('PersonListAndDetailComponent', () => {
  let component: PersonListAndDetailComponent;
  let fixture: ComponentFixture<PersonListAndDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonListAndDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonListAndDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
