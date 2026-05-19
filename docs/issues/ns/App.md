# App 自定义能力评估

## 现状

- 负责组合 `ConfigProvider` 与 `PortalProvider`，对外只提供 `config` 和 `children`。

## 需要完善

- 若应用需要替换全局浮层挂载策略，当前不能传入 `PortalProvider` 相关配置或自定义 provider 包裹器。
- 可考虑增加 `providers`/`renderProviders` 一类扩展点，避免后续在根组件内继续硬编码全局 provider 组合。
