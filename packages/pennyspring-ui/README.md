# @pennyspring/ui

PennySpring 的 React Native 组件库。组件统一使用 `@pennyspring/theme` 的 token 与 `createUseSheetStyle` 构建，移动端预览与 Web 文档共享同一份 demo。

## 安装与接入

本仓库通过 workspace 源码引用：

```tsx
import { App, Button, Text } from '@pennyspring/ui';

export function Root() {
  return (
    <App themeConfig={{ algorithm: 'light' }}>
      <Text>Hello PennySpring</Text>
      <Button>确定</Button>
    </App>
  );
}
```

`App` 是运行时根，内部提供手势根、主题、组件配置与 Portal 宿主，应用根位置挂载一次即可。局部需要覆盖主题或组件配置时，使用 `ThemeProvider` / `ConfigProvider`，不要再嵌套 `App`。

### Peer dependencies

宿主应用需要安装：

- `react`、`react-native`
- `react-native-gesture-handler`
- `react-native-reanimated`
- `react-native-safe-area-context`
- `react-native-svg`（`phosphor-react-native` 图标依赖）

## 组件

| 分类       | 组件                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 根与主题   | `App`、`ConfigProvider`、`Portal`、`PortalProvider`、`ThemeProvider`、`useTheme`、`createUseSheetStyle`                                                             |
| 布局       | `Row`、`Column`、`Grid`、`Space`、`Spacer`、`Divider`、`GeometryReader`、`Sticky`、`StickyLayout`、`Card`、`List`                                                   |
| 基础展示   | `Text`、`Icon`、`Avatar`、`Badge`、`Tag`、`Ellipsis`、`Empty`、`Result`、`Skeleton`、`Loading`、`Progress`、`ProgressBar`、`ProgressCircle`                         |
| 交互与输入 | `Button`、`Checkbox`、`Radio`、`RadioGroup`、`Switch`、`Slider`、`Stepper`、`Segmented`、`Input`、`Textarea`、`CalculatorInput`、`DisplayInput`、`Form`、`FormItem` |
| 选择器     | `Picker`、`ListPicker`、`TagPicker`、`CalendarPicker`、`CalendarPickerView`、`DateTimePicker`、`WheelGroup`、`IndexBar`                                             |
| 导航与浮层 | `Tabs`、`TabBar`、`Drawer`、`Popup`、`ActionSheet`、`Dialog`、`Toast`、`Message`、`Notification`、`Tooltip`、`Popover`、`Steps`                                     |
| 媒体与手势 | `Image`、`ImagePreview`、`ImagePreviewGroup`、`Carousel`、`SwipeAction`、`FloatingActionGroup`                                                                      |
| 键盘适配   | `KeyboardAwareScreen`、`KeyboardAwareFormScroll`、`KeyboardStickyFooter`、`useKeyboardInsets`                                                                       |

完整 API 与类型以各组件目录的 `types.ts` 和文档为准。

## 主题

```tsx
import { App, useTheme } from '@pennyspring/ui';

function Screen() {
  const { token } = useTheme();
  // token.colorPrimary / token.fontSize / token.padding ...
}
```

`@pennyspring/ui` 重新导出 `@pennyspring/theme` 的全部能力，包括 `themePresets`、token 类型、阴影与样式工具，确保组件与业务使用同一套主题模块。

## 文档与预览

组件 demo 以 `examples/previews/**/index.tsx` 的 `previewMeta` 为唯一来源。`scripts/sync-previews.cjs` 会扫描并生成：

- 移动端预览的路由注册；
- Docusaurus 组件文档与侧边栏；
- 文档内嵌 demo 文件。

```bash
yarn workspace @pennyspring/ui previews:sync   # 生成/同步
yarn workspace @pennyspring/ui previews:check  # 校验是否有未同步文件

yarn workspace @pennyspring/ui docs:dev        # 本地文档站
yarn workspace @pennyspring/ui docs:build
yarn workspace @pennyspring/ui docs:preview
```

## 开发约定

- 样式只能通过 `createUseSheetStyle` 创建；禁止 `StyleSheet.create`、内联样式字面量、颜色/数字魔法数。
- 文本统一使用本包的 `Text`，布局优先使用 `Row` / `Column` / `Space` 等布局组件。
- 组件放在 `src/<ComponentName>/`，由目录内 `index.ts` 与包级 `src/index.ts` 导出；公共 props 和样式类型放在 `types.ts`。
- 动画只使用 `react-native-reanimated`，时长与曲线取主题 token。
- 无障碍属性当前不在项目支持范围内。

## 开发

```bash
yarn workspace @pennyspring/ui typecheck
yarn workspace @pennyspring/ui test
```

测试位于 `__tests__/`，覆盖组件的渲染、交互与样式映射。

## 许可

[MIT](../../LICENSE) © 2026 Byte-n
