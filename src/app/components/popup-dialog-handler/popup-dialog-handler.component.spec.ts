import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDialogHandlerComponent } from './popup-dialog-handler.component';

describe('PopupDialogHandlerComponent', () => {
  let component: PopupDialogHandlerComponent;
  let fixture: ComponentFixture<PopupDialogHandlerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupDialogHandlerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDialogHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
