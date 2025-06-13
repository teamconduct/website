import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FineAddEditComponent } from './fine-add-edit.component';

describe('FineAddEditComponent', () => {
  let component: FineAddEditComponent;
  let fixture: ComponentFixture<FineAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FineAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FineAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
