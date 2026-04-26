### 1. 技术架构 (The "No-UI-Kit" Stack)
* **基础组件：** 仅使用 `View`, `Text`, `Image`, `TextInput`, `ScrollView`。
* **布局引擎：** 100% 原生 **Flexbox**。
* **样式定义：** `StyleSheet.create` (高性能、强类型样式映射)。
* **交互逻辑：** `Pressable` (全自定义点击容器) + `expo-haptics` (物理触感反馈)。
* **动画支持：** `react-native-reanimated` (实现非线性、高帧率的丝滑动效)。
* **性能增强：** `FlashList` (替代 FlatList，解决长账单滚动手感)。

---

### 2. 双端差异抹平策略 (Platform Normalization)
* **阴影处理：** * **iOS:** 使用 `shadowColor`, `shadowOpacity`, `shadowRadius`。
    * **Android:** 使用 `elevation` 或 `react-native-shadow-2` (如果需要复杂彩色阴影)。
* **边缘适配：** 引入 `react-native-safe-area-context` 处理刘海屏、灵动岛及 Android 沉浸式底栏。
* **文字校准：** 设置 `includeFontPadding: false` 并显式指定 `lineHeight` 以消除垂直偏移差异。
* **点击反馈：** 手动封装 `Animated.Pressable`，实现 iOS 的透明度缩放与 Android 的 Ripple 水波纹共存。

---

### 3. 设计系统构建 (Semantic Design System)
* **Token 驱动：** 建立全局 `theme.ts`，定义颜色 (Color)、间距 (Spacing)、圆角 (Radius) 和字体 (Typography) 变量。
* **去企业风：** 避开标准矩形与系统默认配色，采用**大圆角、有机形状、莫兰迪色系**或**复古纸张感**。
* **动态主题：** 通过 `ThemeContext` 注入变量，结合 `Reanimated` 实现深色/浅色模式切换时的柔和过渡。

---

### 4. 方案评价
* **自由度：** ★★★★★ (100% 视觉掌控力，不被库的默认样式束缚)。
* **性能：** ★★★★★ (零冗余层级，极致启动速度)。
* **Agent 友好度：** ★★★★☆ (原生 API 稳定，Agent 生成代码逻辑清晰，不易因版本更新报错)。
* **审美上限：** 取决于你对 Agent 的视觉描述能力。

---

### 5. 核心优势
这种方案摒弃了“工业化模板”，通过**原生组件+细腻动效+物理触感**，能让记账软件从“工具”变成“数字艺术品”，是个人开发者追求独特品牌感的最优路径。
