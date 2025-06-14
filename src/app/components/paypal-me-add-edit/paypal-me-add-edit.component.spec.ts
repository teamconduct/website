import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaypalMeAddEditComponent } from './paypal-me-add-edit.component';

describe('PaypalMeAddEditComponent', () => {
  let component: PaypalMeAddEditComponent;
  let fixture: ComponentFixture<PaypalMeAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaypalMeAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaypalMeAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
