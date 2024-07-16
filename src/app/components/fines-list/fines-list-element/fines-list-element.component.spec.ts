import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinesListElementComponent } from './fines-list-element.component';

describe('FinesListElementComponent', () => {
  let component: FinesListElementComponent;
  let fixture: ComponentFixture<FinesListElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinesListElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinesListElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
