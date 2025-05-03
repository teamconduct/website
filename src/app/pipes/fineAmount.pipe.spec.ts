import { FineAmountPipe } from './fineAmount.pipe';

describe('FineAmountPipe', () => {
  it('create an instance', () => {
    const pipe = new FineAmountPipe();
    expect(pipe).toBeTruthy();
  });
});
