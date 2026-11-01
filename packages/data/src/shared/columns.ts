import { integer } from 'drizzle-orm/sqlite-core';

import { createdTimeColumn, updatedTimeColumn } from './timestamps';

export function primaryKeyColumn() {
  return integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true });
}

export function integerColumn(name: string) {
  return integer(name, { mode: 'number' });
}

export function timestampColumns() {
  return {
    createdTime: createdTimeColumn(),
    updatedTime: updatedTimeColumn(),
  };
}
