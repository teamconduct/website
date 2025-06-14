import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FineTemplateListComponent } from './fine-template-list.component';

describe('FineTemplateListComponent', () => {
  let component: FineTemplateListComponent;
  let fixture: ComponentFixture<FineTemplateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FineTemplateListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FineTemplateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
