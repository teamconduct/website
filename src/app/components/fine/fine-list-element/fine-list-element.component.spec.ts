import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FineListElementComponent } from './fine-list-element.component';

describe('FineListElementComponent', () => {
  let component: FineListElementComponent;
  let fixture: ComponentFixture<FineListElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FineListElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FineListElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
