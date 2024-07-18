import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FineDetailAddEditComponent } from './fine-detail-add-edit.component';

describe('FineDetailAddEditComponent', () => {
  let component: FineDetailAddEditComponent;
  let fixture: ComponentFixture<FineDetailAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FineDetailAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FineDetailAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
