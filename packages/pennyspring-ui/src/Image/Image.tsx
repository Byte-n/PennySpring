import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { Image as RNImage, Pressable, View } from 'react-native';
import type { ImageStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@pennyspring/theme';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { ImagePreview } from './ImagePreview';
import { ImagePreviewGroup } from './ImagePreviewGroup';
import { ImagePreviewGroupContext } from './context';
import { useStyles } from './style';
import type { ImageProps } from './types';
import { getSourceKey } from './utils';

const PRESS_SCALE_DELTA = 0.03;
const WARNING_ICON_SIZE = 20;

type LoadStatus = 'error' | 'loaded' | 'loading';

function ImageRoot({
  error,
  fit = 'cover',
  onPress,
  preview = false,
  radius = 'normal',
  src,
  style,
  styles,
  testID,
}: ImageProps): React.ReactElement {
  const { token } = useTheme();
  const group = useContext(ImagePreviewGroupContext);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [reloadToken, setReloadToken] = useState(0);
  const isInGroup = group !== null;
  const singlePreviewConfig =
    !isInGroup && typeof preview === 'object' ? preview : undefined;
  const singlePreviewEnabled = !isInGroup && preview !== false;
  const previewSrc = singlePreviewConfig?.src ?? src;
  const [previewOpen, setPreviewOpen] = useControllableValue(
    false,
    singlePreviewConfig?.open,
    singlePreviewConfig?.onOpenChange,
  );
  const id = useId();
  const register = group?.register;
  const registerDataRef = useRef({ src });
  registerDataRef.current = { src };
  const sourceKey = getSourceKey(src);
  const tokenStyles = useStyles({ radius });
  const pressProgress = useSharedValue(0);
  const [easeX1, easeY1, easeX2, easeY2] = token.motionEaseOut;
  const pressDuration = token.motionDurationFast;
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressProgress.value * PRESS_SCALE_DELTA }],
  }));

  useEffect(() => {
    if (!register) {
      return undefined;
    }

    return register(id, registerDataRef.current);
  }, [id, register]);

  useEffect(() => {
    if (!register) {
      return;
    }

    register(id, registerDataRef.current);
  }, [id, register, src]);

  useEffect(() => {
    setStatus('loading');
    setReloadToken(0);
  }, [sourceKey]);

  function animatePress(pressed: boolean): void {
    pressProgress.value = withTiming(pressed ? 1 : 0, {
      duration: pressDuration,
      easing: Easing.bezier(easeX1, easeY1, easeX2, easeY2),
    });
  }

  const handleLoadStart = useCallback(() => {
    setStatus('loading');
  }, []);
  const handleLoad = useCallback(() => {
    setStatus('loaded');
  }, []);
  const handleError = useCallback(() => {
    setStatus('error');
  }, []);

  function handleRetry(): void {
    setStatus('loading');
    setReloadToken(current => current + 1);
  }

  function handlePress(): void {
    if (status === 'error') {
      handleRetry();
      return;
    }

    if (isInGroup) {
      group.onPreview(id, src);
    } else if (singlePreviewEnabled) {
      setPreviewOpen(true);
    }

    onPress?.();
  }

  const isPressable =
    isInGroup ||
    singlePreviewEnabled ||
    onPress !== undefined ||
    status === 'error';
  const errorContent =
    error === null ? null : error !== undefined ? error : (
      <>
        <Icon color="tertiary" icon="warning" size={WARNING_ICON_SIZE} />
        <Text
          color="tertiary"
          size="xs"
          style={[tokenStyles.errorText, styles?.errorText]}
        >
          加载失败
        </Text>
      </>
    );

  return (
    <>
      <Animated.View
        style={[tokenStyles.root, animatedStyle, styles?.root, style]}
      >
        <Pressable
          disabled={!isPressable}
          onPress={handlePress}
          onPressIn={() => animatePress(true)}
          onPressOut={() => animatePress(false)}
          style={tokenStyles.pressable}
          testID={testID}
        >
          <RNImage
            key={`${sourceKey}-${reloadToken}`}
            onError={handleError}
            onLoad={handleLoad}
            onLoadStart={handleLoadStart}
            resizeMode={fit}
            source={src}
            style={[tokenStyles.image as ImageStyle, styles?.image]}
          />
          {status === 'error' ? (
            <View
              pointerEvents="none"
              style={[tokenStyles.error, styles?.error]}
            >
              {errorContent}
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
      {singlePreviewEnabled ? (
        <ImagePreview
          images={[previewSrc]}
          onCancel={singlePreviewConfig?.onCancel}
          onOpenChange={nextOpen => setPreviewOpen(nextOpen)}
          open={previewOpen === true}
        />
      ) : null}
    </>
  );
}

export const Image = Object.assign(ImageRoot, {
  Preview: ImagePreview,
  PreviewGroup: ImagePreviewGroup,
});
