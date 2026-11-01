# PennySpring UI 预览应用

`@pennyspring/ui` 的独立 React Native 预览 App，同时作为 Web 文档 demo 的来源。预览源码位于 `previews/`，按组件分类组织，每个预览导出 `previewMeta`。

## 运行

预览应用使用 8081 端口，避免与根应用（8080）冲突。启动脚本会先执行 `previews:sync`。

```bash
yarn workspace @pennyspring/ui-examples android
yarn workspace @pennyspring/ui-examples ios
yarn workspace @pennyspring/ui-examples start
```

等价于：

```bash
node ../scripts/sync-previews.cjs
react-native start --port 8081
```

## 命令

| 命令                                                | 说明                         |
| --------------------------------------------------- | ---------------------------- |
| `yarn workspace @pennyspring/ui-examples start`     | 同步预览并启动 Metro（8081） |
| `yarn workspace @pennyspring/ui-examples android`   | 同步预览并运行 Android       |
| `yarn workspace @pennyspring/ui-examples ios`       | 同步预览并运行 iOS           |
| `yarn workspace @pennyspring/ui-examples lint`      | ESLint                       |
| `yarn workspace @pennyspring/ui-examples typecheck` | TypeScript                   |
| `yarn workspace @pennyspring/ui-examples clean`     | 清理该 App 的构建缓存        |

## 结构

```text
examples/
├── previews/        # 组件预览（文档与移动端的共同来源）
├── navigation/      # 预览导航路由
├── screens/         # 预览列表/详情/主题控制
├── android/         # Android 原生工程
├── ios/             # iOS 原生工程
├── app.js
└── index.ts
```

新增组件预览时，只需在 `previews/` 下补充 `index.tsx` 与 demos，然后运行同步脚本；不要手写文档或路由注册。

## 说明

- 该 App 仅用于本地开发与预览，不参与正式发布。
- 原生依赖与根应用保持同一版本（React Native 0.85、Reanimated 4 等）。

## 许可

[MIT](../../../LICENSE) © 2026 Byte-n
