import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonAddEditComponent } from './person-add-edit.component';

describe('PersonAddEditComponent', () => {
  let component: PersonAddEditComponent;
  let fixture: ComponentFixture<PersonAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
