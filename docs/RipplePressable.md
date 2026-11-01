# RipplePressable 水波纹点击组件

> 基于 Reanimated 手搓的跨平台水波纹方案，零额外依赖。

---

## 设计目标

- 所有可点击元素统一提供水波纹反馈
- 基于 `react-native-reanimated` + `react-native-gesture-handler`，项目已有依赖
- 动画在 UI 线程（worklet）执行，不阻塞 JS 线程
- 支持自定义波纹颜色、圆形/矩形模式

---

## 依赖

项目需已安装：

- `react-native-reanimated`
- `react-native-gesture-handler`

---

## 组件实现

```tsx
// RipplePressable.tsx
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface RipplePressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  rippleColor?: string;
  borderRadius?: number;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(
  require('react-native').Pressable,
);

export const RipplePressable: React.FC<RipplePressableProps> = ({
  children,
  onPress,
  style,
  rippleColor = 'rgba(0, 0, 0, 0.12)',
  borderRadius = 0,
  disabled = false,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  const handlePress = () => {
    onPress?.();
  };

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      opacity.value = withTiming(1, { duration: 100 });
      scale.value = withTiming(1, { duration: 300 });
    })
    .onFinalize(() => {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = 0.5;
      if (onPress) {
        runOnJS(handlePress)();
      }
    });

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[styles.container, { borderRadius }, style]}
        accessible
        accessibilityRole="button"
      >
        {children}
        <Animated.View
          style={[
            styles.ripple,
            { backgroundColor: rippleColor, borderRadius },
            rippleStyle,
          ]}
          pointerEvents="none"
        />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  ripple: {
    ...StyleSheet.absoluteFillObject,
  },
});
```

---

## 使用示例

### 按钮

```tsx
<RipplePressable
  onPress={() => console.log('pressed')}
  rippleColor="rgba(255, 255, 255, 0.3)"
  borderRadius={8}
  style={{ padding: 12, backgroundColor: '#1677ff' }}
>
  <Text style={{ color: '#fff', textAlign: 'center' }}>提交</Text>
</RipplePressable>
```

### 列表项

```tsx
<RipplePressable
  onPress={() => navigation.navigate('Detail', { id: item.id })}
  rippleColor="rgba(0, 0, 0, 0.06)"
  style={{ paddingHorizontal: 16, paddingVertical: 12 }}
>
  <Text>{item.title}</Text>
</RipplePressable>
```

### 卡片

```tsx
<RipplePressable
  onPress={handleCardPress}
  borderRadius={12}
  rippleColor="rgba(0, 0, 0, 0.08)"
  style={{ backgroundColor: '#fff', padding: 16 }}
>
  <Text>卡片内容</Text>
</RipplePressable>
```

---

## Props 说明

| Prop           | 类型         | 默认值                  | 说明     |
| -------------- | ------------ | ----------------------- | -------- |
| `children`     | `ReactNode`  | -                       | 子元素   |
| `onPress`      | `() => void` | -                       | 点击回调 |
| `style`        | `ViewStyle`  | -                       | 容器样式 |
| `rippleColor`  | `string`     | `'rgba(0, 0, 0, 0.12)'` | 波纹颜色 |
| `borderRadius` | `number`     | `0`                     | 容器圆角 |
| `disabled`     | `boolean`    | `false`                 | 是否禁用 |

---

## 注意事项

- 波纹颜色：深色背景用 `rgba(255, 255, 255, 0.2)`，浅色背景用 `rgba(0, 0, 0, 0.12)`
- `borderRadius` 必须与容器圆角一致，否则波纹会溢出圆角
- 大量使用场景（长列表 100+ 项）需关注 React 节点数量，必要时考虑原生方案
- 子元素不要设置 `overflow: 'visible'`，否则波纹会溢出容器
