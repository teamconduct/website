import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditFormDialogComponent } from './add-edit-form-dialog.component';

describe('AddEditFormDialogComponent', () => {
  let component: AddEditFormDialogComponent;
  let fixture: ComponentFixture<AddEditFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
