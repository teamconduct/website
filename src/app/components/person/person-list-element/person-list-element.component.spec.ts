import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonListElementComponent } from './person-list-element.component';

describe('PersonListElementComponent', () => {
  let component: PersonListElementComponent;
  let fixture: ComponentFixture<PersonListElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonListElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonListElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
