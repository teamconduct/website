import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FineTemplatesListComponent } from './fine-templates-list.component';

describe('FineTemplatesListComponent', () => {
  let component: FineTemplatesListComponent;
  let fixture: ComponentFixture<FineTemplatesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FineTemplatesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FineTemplatesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
