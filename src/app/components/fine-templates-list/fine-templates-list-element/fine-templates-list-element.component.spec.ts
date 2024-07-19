import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FineTemplatesListElementComponent } from './fine-templates-list-element.component';

describe('FineTemplatesListElementComponent', () => {
  let component: FineTemplatesListElementComponent;
  let fixture: ComponentFixture<FineTemplatesListElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FineTemplatesListElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FineTemplatesListElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
