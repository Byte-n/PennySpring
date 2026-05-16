---
name: add-record-fab-design
description: Home 页新增悬浮按钮，点击跳转到可滑动切换的记录新增界面（收入/支出/转账）
metadata:
  type: feature
  date: 2026-05-16
---

# 新增记录悬浮按钮与界面设计

## 概述

在 Home 页的明细 tab 下方添加悬浮按钮（FAB），点击后跳转到新增记录界面。新增界面采用 TopTabNavigator 结构，支持滑动切换收入、支出、转账三种类型的表单。

## 功能需求

### 悬浮按钮（FAB）

- **位置**：Home 页 DetailTab 底部右侧固定位置
- **图标**：Plus 图标（phosphor-react-native）
- **行为**：点击后导航到 AddRecord 页面
- **组件**：使用 `@pennyspring/component` 的 `FloatingActionButton`

### 新增记录界面

- **导航结构**：使用 `TopTabNavigator` 实现三个可滑动切换的 tab
- **Tab 列表**：
  1. 收入 (IncomeTab)
  2. 支出 (ExpenseTab)
  3. 转账 (TransferTab)
- **交互**：支持左右滑动切换，顶部显示 tab 标签

## 架构设计

### 路由结构

```
RootStack
├── Home
├── AddRecord ← 新增路由
├── Test
└── ComponentPreview
```

**Why**: AddRecord 作为独立的 Root 级路由，与 Home 平级，便于从任何位置导航到新增界面。

**How to apply**: 在 `src/navigation/routes.ts` 添加 `AddRecord` 常量，在 `RootStackNavigator.tsx` 注册路由。

### 组件结构

```
AddRecordScreen (容器)
└── AddRecordTabsNavigator (TopTabNavigator)
    ├── IncomeTabScreen (收入表单)
    ├── ExpenseTabScreen (支出表单)
    └── TransferTabScreen (转账表单)
```

**Why**: 复用 HomeTabsNavigator 的设计模式，保持应用内导航体验一致。

**How to apply**: 
- `AddRecordScreen` 位于 `src/screens/addRecord/AddRecordScreen.tsx`
- `AddRecordTabsNavigator` 位于 `src/navigation/AddRecordTabsNavigator.tsx`
- 三个 tab screen 位于 `src/screens/addRecord/tabs/` 目录

### 文件清单

**新增文件**：
1. `src/navigation/AddRecordTabsNavigator.tsx` - Tab 导航器
2. `src/screens/addRecord/AddRecordScreen.tsx` - 容器页面
3. `src/screens/addRecord/tabs/IncomeTabScreen.tsx` - 收入表单
4. `src/screens/addRecord/tabs/ExpenseTabScreen.tsx` - 支出表单
5. `src/screens/addRecord/tabs/TransferTabScreen.tsx` - 转账表单

**修改文件**：
1. `src/navigation/routes.ts` - 添加 `AddRecord` 路由常量
2. `src/navigation/types.ts` - 添加 `AddRecord` 到 `RootStackParamList`
3. `src/navigation/RootStackNavigator.tsx` - 注册 AddRecord 路由
4. `src/screens/home/tabs/DetailTabScreen.tsx` - 添加 FAB

## 实现细节

### FAB 样式约束

- 使用 `FloatingActionButton` 的默认 props：`variant="solid"`, `color="primary"`, `shadow=true`
- 位置通过 `position: 'absolute'` 定位到右下角
- 间距使用 `token.padding` 或 `token.paddingLG`
- 不硬编码颜色、尺寸、阴影值

**Why**: 遵循项目 theme-tokens 规范，确保样式由 token 驱动，支持主题切换。

**How to apply**: 在 DetailTabScreen 中使用 `createUseSheetStyle` 定义 FAB 容器样式，消费 token。

### Tab 表单占位实现

初期三个 tab screen 仅包含占位内容（标题文本），不实现完整表单逻辑。

**Why**: 本次设计聚焦导航结构与 FAB 交互，表单业务逻辑属于后续独立任务。

**How to apply**: 每个 tab screen 返回简单的 `<View>` + `<Text>` 结构，显示对应类型名称。

### 导航类型安全

- `RootStackParamList` 添加 `AddRecord: undefined`
- 使用封装的 `useNavigation` hook 确保类型推导

**Why**: 保持类型安全，避免运行时导航错误。

**How to apply**: 在 `types.ts` 扩展类型定义，在组件中使用 `useNavigation()` 调用 `navigate('AddRecord')`。

## 测试策略

### 单元测试

- FAB 点击触发导航：验证 `navigation.navigate('AddRecord')` 被调用
- AddRecordTabsNavigator 渲染三个 tab：验证 tab 标签正确显示

### 集成测试

- 从 Home 页点击 FAB 导航到 AddRecord 页面
- 在 AddRecord 页面滑动切换三个 tab

**Why**: 遵循项目 TDD 要求，确保导航行为与 UI 交互正确。

**How to apply**: 使用 Jest + React Native Testing Library 编写测试用例。

## 非功能需求

### 样式规范

- 所有样式通过 `createUseSheetStyle` 消费 token
- 禁止硬编码颜色、尺寸、间距
- FAB 阴影使用 `toShadowStyle(token.boxShadowSecondary)`

### 代码规范

- 遵循项目 TypeScript 编码风格
- 组件 props 使用命名 interface
- 文件、变量使用 camelCase，组件使用 PascalCase

### 无障碍

- 本项目不要求无障碍支持（根据 CLAUDE.md）

## 后续扩展

本设计不包含以下内容（属于后续任务）：

1. 表单字段设计与数据校验
2. 与数据层的集成（保存记录到数据库）
3. 表单提交后的导航行为
4. 表单数据的持久化与草稿功能

这些功能将在独立的设计文档中规划。
