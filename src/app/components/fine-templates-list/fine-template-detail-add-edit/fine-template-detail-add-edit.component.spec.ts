import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FineTemplateDetailAddEditComponent } from './fine-template-detail-add-edit.component';

describe('FineTemplateDetailAddEditComponent', () => {
  let component: FineTemplateDetailAddEditComponent;
  let fixture: ComponentFixture<FineTemplateDetailAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FineTemplateDetailAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FineTemplateDetailAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
