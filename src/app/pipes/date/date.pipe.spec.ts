import { TestBed } from '@angular/core/testing';
import { DatePipe } from './date.pipe';
import { ConfigurationService } from '../../services/configuration/configuration.service';

describe('DatePipe', () => {
  it('create an instance', () => {
    TestBed.configureTestingModule({
      providers: [
        DatePipe,
        { provide: ConfigurationService, useValue: { locale: 'en-US' } }
      ]
    });
    const pipe = TestBed.inject(DatePipe);
    expect(pipe).toBeTruthy();
  });
});
