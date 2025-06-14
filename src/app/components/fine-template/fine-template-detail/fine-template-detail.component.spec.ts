import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FineTemplateDetailComponent } from './fine-template-detail.component';

describe('FineTemplateDetailComponent', () => {
  let component: FineTemplateDetailComponent;
  let fixture: ComponentFixture<FineTemplateDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FineTemplateDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FineTemplateDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
