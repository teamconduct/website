import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSortingComponent } from './list-sorting.component';

describe('ListSortingComponent', () => {
  let component: ListSortingComponent;
  let fixture: ComponentFixture<ListSortingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSortingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
