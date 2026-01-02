import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfiniteSlidesComponent } from './infinite-slides.component';

describe('InfiniteSlidesComponent', () => {
  let component: InfiniteSlidesComponent;
  let fixture: ComponentFixture<InfiniteSlidesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfiniteSlidesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfiniteSlidesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('slides', [{ text: 'Test slide' }]);
    fixture.componentRef.setInput('colors', { gradientFrom: '#000', gradientTo: '#fff', text: '#000' });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
