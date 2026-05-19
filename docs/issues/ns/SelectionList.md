# SelectionList 自定义能力评估

## 现状

- 支持单选/多选、options/groups、搜索、loading、empty、trigger、Popup、displayMode、tagProps 和较多 styles。
- 内部组合 `Popup`、`Button`、`Icon`、`Text`、`TagValueDisplay`。

## 需要完善

- 选项只支持 label/description/prefix/suffix，缺少 `renderOption`，不能完整替换包含勾选态和禁用态的一行。
- 搜索区域为内部固定，缺少 `renderSearch` 或搜索输入 props 透传。
- Popup 能力未完整透出，缺少 `popupProps` 或 `renderPopupContent`。
- trigger 展示缺少 `renderTrigger`，当前 displayMode/tagProps 不能覆盖复杂展示需求。
