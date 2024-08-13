import { AmountPipe } from './fineValue.pipe';

describe('AmountPipe', () => {
  it('create an instance', () => {
    const pipe = new AmountPipe();
    expect(pipe).toBeTruthy();
  });
});
