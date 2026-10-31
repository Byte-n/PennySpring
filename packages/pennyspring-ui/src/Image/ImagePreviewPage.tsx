import React, { useCallback, useEffect, useState } from 'react';
import { Image as RNImage, Pressable, View } from 'react-native';
import type {
  ImageLoadEventData,
  ImageSourcePropType,
  ImageStyle,
  NativeSyntheticEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@pennyspring/theme';
import { Icon } from '../Icon';
import { Loading } from '../Loading';
import { Text } from '../Text';
import { usePageStyles } from './style';
import type { ImagePreviewStyles } from './types';
import {
  getDoubleTapTransform,
  getMaxTranslation,
  getPinchTransform,
  getSourceKey,
} from './utils';

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const ZOOM_THRESHOLD = 1.01;
const WARNING_ICON_SIZE = 28;

export interface ImagePreviewPageProps {
  active: boolean;
  height: number;
  onZoomChange: (zoomed: boolean) => void;
  src: ImageSourcePropType;
  styles?: ImagePreviewStyles;
  width: number;
}

export function ImagePreviewPage({
  active,
  height,
  onZoomChange,
  src,
  styles,
  width,
}: ImagePreviewPageProps): React.ReactElement {
  const { token } = useTheme();
  const tokenStyles = usePageStyles();
  const [status, setStatus] = useState<'error' | 'loaded' | 'loading'>('loading');
  const [zoomed, setZoomed] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const scale = useSharedValue(MIN_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(MIN_SCALE);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  const imageWidth = useSharedValue(0);
  const imageHeight = useSharedValue(0);
  const [easeX1, easeY1, easeX2, easeY2] = token.motionEaseOut;
  const duration = token.motionDurationMid;
  const sourceKey = getSourceKey(src);

  useEffect(() => {
    onZoomChange(zoomed);
  }, [onZoomChange, zoomed]);

  const resetZoom = useCallback(() => {
    scale.value = MIN_SCALE;
    translateX.value = 0;
    translateY.value = 0;
    setZoomed(false);
  }, [scale, translateX, translateY]);

  useEffect(() => {
    if (!active) {
      resetZoom();
    }
  }, [active, resetZoom, sourceKey]);

  const handleLoadStart = useCallback(() => {
    setStatus('loading');
  }, []);

  const handleLoad = useCallback(
    (event: NativeSyntheticEvent<ImageLoadEventData>) => {
      const source = event.nativeEvent.source;

      if (source !== undefined) {
        imageWidth.value = source.width;
        imageHeight.value = source.height;
      }

      setStatus('loaded');
    },
    [imageHeight, imageWidth],
  );

  const handleError = useCallback(() => {
    resetZoom();
    setStatus('error');
  }, [resetZoom]);

  const handleRetry = useCallback(() => {
    resetZoom();
    setStatus('loading');
    setReloadToken(current => current + 1);
  }, [resetZoom]);

  const translateStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pinchGesture = Gesture.Pinch()
    .enabled(status === 'loaded')
    .onStart(() => {
      savedScale.value = scale.value;
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    })
    .onUpdate(event => {
      'worklet';
      const nextScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, savedScale.value * event.scale),
      );
      const focalX = event.focalX - width / 2;
      const focalY = event.focalY - height / 2;
      const transform = getPinchTransform({
        focalX,
        focalY,
        nextScale,
        savedScale: savedScale.value,
        savedX: savedX.value,
        savedY: savedY.value,
      });
      const max = getMaxTranslation({
        containerHeight: height,
        containerWidth: width,
        imageHeight: imageHeight.value || height,
        imageWidth: imageWidth.value || width,
        scale: transform.scale,
      });

      scale.value = transform.scale;
      translateX.value = Math.max(-max.x, Math.min(max.x, transform.x));
      translateY.value = Math.max(-max.y, Math.min(max.y, transform.y));
    })
    .onEnd(() => {
      'worklet';
      if (scale.value <= ZOOM_THRESHOLD) {
        scale.value = withTiming(MIN_SCALE, {
          duration,
          easing: Easing.bezier(easeX1, easeY1, easeX2, easeY2),
        });
        translateX.value = withTiming(0, {
          duration,
          easing: Easing.bezier(easeX1, easeY1, easeX2, easeY2),
        });
        translateY.value = withTiming(0, {
          duration,
          easing: Easing.bezier(easeX1, easeY1, easeX2, easeY2),
        });
        runOnJS(setZoomed)(false);
      } else {
        runOnJS(setZoomed)(true);
      }
    });

  const panGesture = Gesture.Pan()
    .enabled(status === 'loaded' && zoomed)
    .maxPointers(1)
    .onStart(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    })
    .onUpdate(event => {
      'worklet';
      const max = getMaxTranslation({
        containerHeight: height,
        containerWidth: width,
        imageHeight: imageHeight.value || height,
        imageWidth: imageWidth.value || width,
        scale: scale.value,
      });

      translateX.value = Math.max(
        -max.x,
        Math.min(max.x, savedX.value + event.translationX),
      );
      translateY.value = Math.max(
        -max.y,
        Math.min(max.y, savedY.value + event.translationY),
      );
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .enabled(status === 'loaded')
    .onEnd((event, success) => {
      'worklet';
      if (!success) {
        return;
      }

      if (scale.value > ZOOM_THRESHOLD) {
        scale.value = withTiming(MIN_SCALE, {
          duration,
          easing: Easing.bezier(easeX1, easeY1, easeX2, easeY2),
        });
        translateX.value = withTiming(0, {
          duration,
          easing: Easing.bezier(easeX1, easeY1, easeX2, easeY2),
        });
        translateY.value = withTiming(0, {
          duration,
          easing: Easing.bezier(easeX1, easeY1, easeX2, easeY2),
        });
        runOnJS(setZoomed)(false);
        return;
      }

      const transform = getDoubleTapTransform({
        focalX: event.x - width / 2,
        focalY: event.y - height / 2,
      });
      const max = getMaxTranslation({
        containerHeight: height,
        containerWidth: width,
        imageHeight: imageHeight.value || height,
        imageWidth: imageWidth.value || width,
        scale: transform.scale,
      });

      scale.value = withTiming(transform.scale, {
        duration,
        easing: Easing.bezier(easeX1, easeY1, easeX2, easeY2),
      });
      translateX.value = withTiming(
        Math.max(-max.x, Math.min(max.x, transform.x)),
        {
          duration,
          easing: Easing.bezier(easeX1, easeY1, easeX2, easeY2),
        },
      );
      translateY.value = withTiming(
        Math.max(-max.y, Math.min(max.y, transform.y)),
        {
          duration,
          easing: Easing.bezier(easeX1, easeY1, easeX2, easeY2),
        },
      );
      runOnJS(setZoomed)(true);
    });

  const gesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture,
  );

  return (
    <View style={tokenStyles.root}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[tokenStyles.translate, translateStyle]}>
          <Animated.View style={[tokenStyles.scale, scaleStyle]}>
            <RNImage
              key={`${sourceKey}-${reloadToken}`}
              onError={handleError}
              onLoad={handleLoad}
              onLoadStart={handleLoadStart}
              resizeMode="contain"
              source={src}
              style={[tokenStyles.image as ImageStyle, styles?.image]}
              testID="image-preview-image"
            />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
      {status === 'loading' ? (
        <View
          pointerEvents="none"
          style={[tokenStyles.loading, styles?.loading]}
        >
          <Loading size="large" tone="inverse" />
        </View>
      ) : null}
      {status === 'error' ? (
        <Pressable
          onPress={handleRetry}
          style={[tokenStyles.error, styles?.error]}
          testID="image-preview-error"
        >
          <Icon
            color="lightSolid"
            icon="warning"
            size={WARNING_ICON_SIZE}
          />
          <Text
            color="lightSolid"
            size="sm"
            style={[tokenStyles.errorText, styles?.errorText]}
          >
            加载失败
          </Text>
          <Text
            color="lightSolid"
            size="xs"
            style={tokenStyles.errorHint}
          >
            点击重试
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
