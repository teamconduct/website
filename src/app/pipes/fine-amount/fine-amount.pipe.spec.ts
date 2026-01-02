import { TestBed } from '@angular/core/testing';
import { FineAmountPipe } from './fine-amount.pipe';
import { ConfigurationService } from '../../services/configuration/configuration.service';

describe('FineAmountPipe', () => {
  it('create an instance', () => {
    TestBed.configureTestingModule({
      providers: [
        FineAmountPipe,
        { provide: ConfigurationService, useValue: { locale: 'en-US', currency: 'USD' } }
      ]
    });
    const pipe = TestBed.inject(FineAmountPipe);
    expect(pipe).toBeTruthy();
  });
});
