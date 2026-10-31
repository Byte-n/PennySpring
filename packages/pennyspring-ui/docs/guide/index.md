# 指南

## 安装和引用

内部 workspace 使用源码引用：

```tsx
import {
  App,
  Button,
  ConfigProvider,
  Text,
  ThemeProvider,
} from '@pennyspring/ui';
```

`App` 是 UI 包的运行时根，内部提供手势根、主题、组件配置和 Portal 宿主。应用通常只需要在根位置挂载一次，并通过 `themeConfig` 配置主题：

```tsx
<App themeConfig={{ algorithm: 'dark' }}>
  <Button>确定</Button>
</App>
```

主题相关的 `ThemeProvider`、`useTheme`、`createUseSheetStyle`、token 类型和预设也从 `@pennyspring/ui` 导出，保证应用使用与 UI 组件相同的主题模块。

局部区域只需要覆盖主题或组件配置时，直接使用 `ThemeProvider` 或 `ConfigProvider`，不要再嵌套 `App`：

```tsx
<App>
  <ThemeProvider config={{ token: { colorPrimary: '#ff0000' } }}>
    <ConfigProvider config={{ locale: 'zh-CN' }}>
      {/* 局部区域 */}
    </ConfigProvider>
  </ThemeProvider>
</App>
```

## 文档预览

组件文档使用 live codeblock 渲染，Docusaurus 构建时通过 react-native-web 映射 React Native 组件。
