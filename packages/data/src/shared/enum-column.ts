import { customType } from 'drizzle-orm/sqlite-core';

export function enumColumn<T extends string>(name: string) {
  return customType<{ data: T; driverData: string }>({
    dataType: () => 'text',
    toDriver: value => value,
    fromDriver: value => value as T,
  })(name).$type<T>();
}
