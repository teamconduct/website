import { TestBed } from '@angular/core/testing';

import { PopupDialogHandlerService } from './popup-dialog-handler.service';

describe('PopupDialogHandlerService', () => {
  let service: PopupDialogHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopupDialogHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
