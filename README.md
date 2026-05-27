This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

## todo

- [ ] 为容器组件、布局组件统一 `size` 到 spacing token 的选择策略
  - [ ] 先按组件语义选择规则，而不是把 `small` / `normal` / `large` 固定成同一组数值：
    - 布局 gap：用于 `Space`、`Grid`、`Row` / `Column` 子项间距。
    - 容器 padding：用于 `Card`、面板、列表分组、通知、弹层内容区。
    - 页面 section margin：用于页面区块之间。
    - 可点击区域：优先保证 `controlHeight` / `hitSlop`，再选择 padding / margin。
  - [ ] Layout gap 建议映射：
    - `small` -> `paddingXXS` / `marginXXS`，仅用于紧凑视觉间距。
    - `normal` -> `paddingXS` / `marginXS`，作为默认子项间距。
    - `large` -> `paddingSM` / `marginSM`，用于较松的模块内排列。
  - [ ] Container padding 建议映射：
    - `small` -> `paddingSM`，用于小卡片、紧凑单行容器、列表内嵌容器。
    - `normal` -> `padding`，用于默认移动端卡片、普通内容容器。
    - `large` -> `paddingLG`，用于强调卡片、页面主容器、弹层大内容区。
    - 复杂容器、带 header / footer / 操作区的容器，`normal` 可升级为 `paddingMD`。
  - [ ] Section margin 建议映射：
    - `small` -> `marginSM`，用于同组内轻分隔。
    - `normal` -> `margin`，用于页面默认区块间距。
    - `large` -> `marginLG`，用于主区块分隔。
  - [ ] 移动端交互底线：
    - 可点击目标 `minHeight` 优先使用 `controlHeight`，不要依赖 padding 猜触达面积。
    - 视觉尺寸必须小于触达面积时，用 `hitSlop` 扩大触达区。
    - 相邻可点击元素间距不低于 `paddingXS`，不要使用 `paddingXXS` 作为唯一间距。
- [x] 有 `size` 的组件是否有随着 `size` 切换。
  - [x] 容器、布局、录入、展示：完整响应所有的边距、阴影、字号等变化？内部使用的其他组件有 `size` 的也需要响应。
- [x] `Text` 组件的 `color` 需要与 `Icon` 中的 `color` 一致
- [x] 所有的 `xxxText` 、 `xxxRender` 、 `xxxx` 插槽，
  - 为 null 的情况下表示不渲染此部分内容。
    - 若 `header` 中仅有 `title`，`title=null`，则整个 `header` 不渲染。也可以通过 `header=null` 来表示不渲染
  - `xxxText` 类型只能是 `xxxText?: string`，不能为 `null`，不能通过 `xxxText=null` 来表示不渲染，应该额外定义 `xxx?: ReactNode | null` 来支持 `null` 控制此部分不渲染。
  - 为 `undefined` 则表示未传递此属性，走默认行为
