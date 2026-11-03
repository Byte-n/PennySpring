import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import {
  Easing,
  cancelAnimation,
  createAnimatedComponent,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Column,
  Row,
  Text,
  createUseSheetStyle,
  toShadowStyle,
  useTheme,
} from '@pennyspring/ui';

import type { LanPeer } from '../../../features/backup/lanProtocol';
import { LanDeviceGlyph } from './LanDeviceGlyph';

const AnimatedPressable = createAnimatedComponent(Pressable);
const CARD_WIDTH = 158;
const BLIP_SLOTS = [
  { left: true, top: 62 },
  { left: false, top: 196 },
  { left: true, top: 330 },
  { left: false, top: 440 },
] as const;

interface LanDeviceCardProps {
  peer: LanPeer;
  slot: number;
  onPress: (peer: LanPeer) => void;
}

const useStyles = createUseSheetStyle((token, slot: number) => {
  const layout = BLIP_SLOTS[slot % BLIP_SLOTS.length];
  return {
    card: {
      position: 'absolute' as const,
      width: CARD_WIDTH,
      padding: token.paddingXS,
      borderRadius: token.borderRadius,
      borderWidth: token.lineWidth,
      borderColor: token.colorSplit,
      backgroundColor: token.colorBgElevated,
      ...(layout.left ? { left: token.padding } : { right: token.padding }),
      top: layout.top,
      ...toShadowStyle(token.boxShadowTertiary),
    },
    icon: {
      width: 30,
      height: 30,
      flexShrink: 0,
      borderRadius: token.borderRadiusSM,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: token.colorPrimaryBg,
    },
    text: {
      flex: 1,
      minWidth: 0,
      gap: token.marginXXS,
    },
    signal: {
      height: 10,
      flexDirection: 'row' as const,
      alignItems: 'flex-end' as const,
      gap: token.marginXXS,
    },
    signalBar: {
      width: 2,
      borderRadius: token.borderRadiusXS,
      backgroundColor: token.colorPrimary,
    },
    signalBar1: { height: 3, opacity: 0.35 },
    signalBar2: { height: 5, opacity: 0.5 },
    signalBar3: { height: 7, opacity: 0.7 },
    signalBar4: { height: 9, opacity: 0.9 },
  };
});

export function LanDeviceCard({ peer, slot, onPress }: LanDeviceCardProps) {
  const styles = useStyles(slot);
  const { token } = useTheme();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return;
    }

    progress.value = withTiming(1, {
      duration: token.motionDurationSlow,
      easing: Easing.bezier(...token.motionEaseOutBack),
    });

    return () => {
      cancelAnimation(progress);
    };
  }, [
    progress,
    reduceMotion,
    token.motionDurationSlow,
    token.motionEaseOutBack,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    const value = progress.value;
    return {
      opacity: value,
      transform: [{ scale: 0.35 + value * 0.65 }],
    };
  });

  return (
    <AnimatedPressable
      onPress={() => onPress(peer)}
      style={[styles.card, animatedStyle]}
    >
      <Row align="center" gap="small">
        <View style={styles.icon}>
          <LanDeviceGlyph kind={peer.platform === 'ios' ? 'tablet' : 'phone'} />
        </View>
        <Column style={styles.text}>
          <Text numberOfLines={1} size="sm" weight="semibold">
            {peer.name}
          </Text>
          <Text color="tertiary" size="xs">
            {peer.platform === 'ios' ? 'iPhone / iPad' : 'Android'}
          </Text>
        </Column>
      </Row>
      <Row align="center" gap="small" justify="between">
        <Text color="tertiary" size="xs">
          点击连接
        </Text>
        <View style={styles.signal}>
          <View style={[styles.signalBar, styles.signalBar1]} />
          <View style={[styles.signalBar, styles.signalBar2]} />
          <View style={[styles.signalBar, styles.signalBar3]} />
          <View style={[styles.signalBar, styles.signalBar4]} />
        </View>
      </Row>
    </AnimatedPressable>
  );
}
