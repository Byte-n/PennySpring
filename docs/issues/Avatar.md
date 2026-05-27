# Avatar 组件规范巡检报告

## 结论

- 状态：不通过
- 严重程度：medium
- 问题数量：2

## 问题列表

### 1. Avatar.Group 剩余计数样式未随 size 完整响应

- 严重程度：medium
- 位置：`packages/pennyspring-ui/src/Avatar/AvatarGroup.tsx:62`
- 违反规范：`.claude/rules/component/coding-style.md` 的“尺寸 API”；`.claude/rules/common/component-visual-layout.md` 的“Size 与间距 Token”
- 不符合点：`AvatarGroup` 将外层 `size` 传入 `useStyles({ size: resolvedSize })`，并将同一尺寸传给可见头像：`<AvatarRoot {...avatarProps} size={itemSize ?? resolvedSize} />`。但剩余计数胶囊的 `rest` / `restText` 固定使用 `token.controlHeight`、`token.paddingXS`、`token.fontSizeSM`、`token.lineHeightSM`，没有基于 `size` 映射到 `small`、`normal`、`large`。当 `Avatar.Group size="small"` 或 `size="large"` 时，`+N` 胶囊仍保持 normal 高度与固定文本尺寸。
- 影响：同一组内头像和剩余计数项尺寸语义不一致，会造成视觉不齐、布局占位异常，并削弱 `size` API 的可信度。
- 推荐纠正方案：扩展 `AVATAR_GROUP_SIZE_CONFIG`，为 `rest` 的高度、最小宽度、圆角、水平 padding、文本字号与 lineHeight 提供基于 `ComponentSize` 的 token 映射；例如 small 使用 `controlHeightSM` 与 `fontSizeSM`，normal 使用 `controlHeight` 与 `fontSize`，large 使用 `controlHeightLG` 与 `fontSizeLG`，并确保垂直方向 spacing 如需出现时由同语义水平 token 折半计算。

## 需要人工确认

- 无

