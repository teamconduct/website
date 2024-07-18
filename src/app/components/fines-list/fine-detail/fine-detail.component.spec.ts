import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FineDetailComponent } from './fine-detail.component';

describe('FineDetailComponent', () => {
  let component: FineDetailComponent;
  let fixture: ComponentFixture<FineDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FineDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FineDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
