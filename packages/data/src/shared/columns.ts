import { integer, text } from 'drizzle-orm/sqlite-core';

import { createdTimeColumn, updatedTimeColumn } from './timestamps';

export function primaryKeyColumn() {
  return integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true });
}

/** 文本主键；用于使用 UUID 的设备级中间态表（如截图记账草稿）。 */
export function textPrimaryKeyColumn() {
  return text('id').primaryKey();
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
