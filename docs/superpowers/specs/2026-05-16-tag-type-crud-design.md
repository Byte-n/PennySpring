# Tag & Type CRUD Service 设计文档

**日期**: 2026-05-16  
**范围**: `packages/data/src/services`

---

## 目标

为 `tags` 和 `types` 表提供完整的增删改查服务层接口，并在删除时强制校验引用关系：
- Tag 被 `tagWithRecord` 引用时禁止删除
- Type 被 `records.typeId` 引用或有子类型（`types.parentId`）时禁止删除

---

## 架构

### 新增文件

```
packages/data/src/services/
  tag-service.ts       ← Tag CRUD 实现
  type-service.ts      ← Type CRUD 实现
  types.ts             ← 追加 input 类型定义
  index.ts             ← 追加导出
```

### 依赖关系

- 两个 service 均依赖 `Database` / `Tx` 类型（来自 `runtime`）
- 删除校验复用 Drizzle 查询（`eq` / `count`）
- 遵循 `data/coding-style.md` 规范：
  - 所有写操作在 `db.transaction()` 内执行
  - 查询不到必要行时抛出明确错误
  - Input 类型定义在 `services/types.ts`

---

## Tag Service

### 接口

```typescript
createTag(db: Database, input: CreateTagInput): Promise<TagRow>
updateTag(db: Database, input: UpdateTagInput): Promise<TagRow>
deleteTag(db: Database, id: number): Promise<void>
```

### CreateTagInput

```typescript
{
  name: string
  icon?: IconValue | ''
  invisible?: VisibilityValue
}
```

### UpdateTagInput

```typescript
{
  id: number
  name: string
  icon?: IconValue | ''
  invisible?: VisibilityValue
}
```

### 删除校验逻辑

事务内执行：
1. 查询 `tagWithRecord` 中是否存在 `tagId = id` 的记录
2. 若存在，抛出 `Error: Tag is in use: {id}`
3. 否则执行 `DELETE FROM tags WHERE id = {id}`

---

## Type Service

### 接口

```typescript
createType(db: Database, input: CreateTypeInput): Promise<TypeRow>
updateType(db: Database, input: UpdateTypeInput): Promise<TypeRow>
deleteType(db: Database, id: number): Promise<void>
```

### CreateTypeInput

```typescript
{
  parentId?: number
  name: string
  icon: IconValue
  typeCategory: RecordTypeCategoryValue
  isSystem?: SystemStatusValue
  specialBehavior?: RecordTypeSpecialBehaviorValue
  sort?: number
}
```

### UpdateTypeInput

```typescript
{
  id: number
  parentId?: number
  name: string
  icon: IconValue
  typeCategory: RecordTypeCategoryValue
  isSystem?: SystemStatusValue
  specialBehavior?: RecordTypeSpecialBehaviorValue
  sort?: number
}
```

### 删除校验逻辑

事务内执行：
1. 查询 `records` 中是否存在 `typeId = id` 的记录
2. 查询 `types` 中是否存在 `parentId = id` 的子类型
3. 若任一存在，抛出 `Error: Type is in use: {id}` 或 `Error: Type has children: {id}`
4. 否则执行 `DELETE FROM types WHERE id = {id}`

---

## 错误处理

所有参数错误、业务校验失败均直接抛出异常（遵循 `data/coding-style.md` 第 36 行规则）：
- `name` 为空 → `throw new Error('name is required')`
- 删除时有引用 → `throw new Error('Tag/Type is in use: {id}')`
- 更新时 ID 不存在 → `throw new Error('Tag/Type not found: {id}')`

---

## 测试策略

### Tag Service
- 创建 tag 后可查询到
- 更新 tag 字段生效
- 删除未使用的 tag 成功
- 删除已被 record 使用的 tag 抛出错误

### Type Service
- 创建 type（含 parentId）后可查询到
- 更新 type 字段生效
- 删除未使用的 type 成功
- 删除被 record 引用的 type 抛出错误
- 删除有子类型的 type 抛出错误

---

## 实现顺序

1. 在 `services/types.ts` 追加 input 类型和 `TagRow` / `TypeRow` 导出
2. 实现 `tag-service.ts`（create / update / delete）
3. 实现 `type-service.ts`（create / update / delete）
4. 在 `services/index.ts` 导出新函数
5. 编写测试用例（TDD 流程）
