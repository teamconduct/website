import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonsListElementComponent } from './persons-list-element.component';

describe('PersonsListElementComponent', () => {
  let component: PersonsListElementComponent;
  let fixture: ComponentFixture<PersonsListElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonsListElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonsListElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
