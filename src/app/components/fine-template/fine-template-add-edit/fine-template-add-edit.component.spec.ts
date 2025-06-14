import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FineTemplateAddEditComponent } from './fine-template-add-edit.component';

describe('FineTemplateAddEditComponent', () => {
  let component: FineTemplateAddEditComponent;
  let fixture: ComponentFixture<FineTemplateAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FineTemplateAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FineTemplateAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
