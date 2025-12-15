// __tests__/utils.test.ts
import { add } from '@/lib/utils';

describe('add function', () => {
  it('should add two numbers correctly', () => {
    expect(add(1, 2)).toBe(3);
    expect(add(5, -3)).toBe(2);
    expect(add(0, 0)).toBe(0);
  });
});
