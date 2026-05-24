import * as schema from '../src/schema';

describe('data package schema', () => {
  test('tb_type schema includes specialBehavior column', () => {
    expect(schema.types.specialBehavior).toBeDefined();
    expect(schema.types.specialBehavior.name).toBe('special_behavior');
  });

  test('tb_record schema does not include concessions column', () => {
    expect('concessions' in schema.records).toBe(false);
  });

});
