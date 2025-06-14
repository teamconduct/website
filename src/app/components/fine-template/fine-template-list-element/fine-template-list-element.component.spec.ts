import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FineTemplateListElementComponent } from './fine-template-list-element.component';

describe('FineTemplateListElementComponent', () => {
  let component: FineTemplateListElementComponent;
  let fixture: ComponentFixture<FineTemplateListElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FineTemplateListElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FineTemplateListElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
