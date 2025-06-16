import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSearchComponent } from './list-search.component';

describe('ListSearchComponent', () => {
  let component: ListSearchComponent;
  let fixture: ComponentFixture<ListSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
