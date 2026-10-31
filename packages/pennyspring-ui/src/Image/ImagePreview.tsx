import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { Icon } from '../Icon';
import { Popup } from '../Popup';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { ImagePreviewPage } from './ImagePreviewPage';
import { usePreviewStyles } from './style';
import type { ImagePreviewProps } from './types';
import { clampIndex, getSourceKey } from './utils';

const DEFAULT_TEST_ID = 'image-preview-root';

export function ImagePreview({
  defaultIndex = 0,
  defaultOpen = false,
  images,
  index,
  onCancel,
  onIndexChange,
  onOpenChange,
  open,
  style,
  styles,
  testID = DEFAULT_TEST_ID,
}: ImagePreviewProps): React.ReactElement | null {
  const insets = useContext(SafeAreaInsetsContext);
  const [viewport, setViewport] = useState({ height: 0, width: 0 });
  const tokenStyles = usePreviewStyles({
    pageHeight: viewport.height,
    pageWidth: viewport.width,
    topInset: insets?.top ?? 0,
  });
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen,
    open,
    onOpenChange,
  );
  const [resolvedIndex, setResolvedIndex] = useControllableValue(
    defaultIndex,
    index,
    onIndexChange,
  );
  const [isZoomed, setIsZoomed] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const isOpen = resolvedOpen === true;
  const normalizedIndex = clampIndex(resolvedIndex ?? 0, images.length);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (viewport.width <= 0) {
      return;
    }

    scrollRef.current?.scrollTo?.({
      x: normalizedIndex * viewport.width,
      y: 0,
      animated: false,
    });
  }, [isOpen, normalizedIndex, viewport.width]);

  useEffect(() => {
    setIsZoomed(false);
  }, [isOpen, normalizedIndex]);

  function handleClose(): void {
    onCancel?.();
    setResolvedOpen(false);
  }

  function handleLayout(event: LayoutChangeEvent): void {
    const { height, width } = event.nativeEvent.layout;

    setViewport(current =>
      current.height === height && current.width === width
        ? current
        : { height, width },
    );
  }

  function handleMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void {
    const nextIndex = clampIndex(
      Math.round(
        event.nativeEvent.contentOffset.x / Math.max(viewport.width, 1),
      ),
      images.length,
    );

    setIsZoomed(false);

    if (nextIndex !== normalizedIndex) {
      setResolvedIndex(nextIndex);
    }
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <Popup
      animation="opacity"
      closeOnMaskClick={false}
      mask={false}
      onCancel={() => onCancel?.()}
      onOpenChange={nextOpen => setResolvedOpen(nextOpen)}
      open={isOpen}
      position="center"
      styles={{ body: tokenStyles.popupBody }}
    >
      <View
        onLayout={handleLayout}
        style={[tokenStyles.overlay, styles?.overlay, style]}
        testID={testID}
      >
        <ScrollView
          bounces={false}
          horizontal
          onMomentumScrollEnd={handleMomentumScrollEnd}
          pagingEnabled
          ref={scrollRef}
          scrollEnabled={!isZoomed}
          showsHorizontalScrollIndicator={false}
          style={[tokenStyles.scroll, styles?.stage]}
        >
          {images.map((src, itemIndex) => (
            <View
              key={`${getSourceKey(src)}-${itemIndex}`}
              style={[tokenStyles.page, styles?.page]}
            >
              <ImagePreviewPage
                active={itemIndex === normalizedIndex}
                height={viewport.height}
                onZoomChange={setIsZoomed}
                src={src}
                styles={styles}
                width={viewport.width}
              />
            </View>
          ))}
        </ScrollView>
        <View
          pointerEvents="box-none"
          style={[tokenStyles.topBar, styles?.topBar]}
        >
          <Pressable
            onPress={handleClose}
            style={[tokenStyles.closeButton, styles?.closeButton]}
            testID="image-preview-close"
          >
            <Icon color="lightSolid" icon="close" size="large" />
          </Pressable>
          {images.length > 1 ? (
            <View
              pointerEvents="none"
              style={[tokenStyles.countPill, styles?.countPill]}
            >
              <Text
                color="lightSolid"
                size="xs"
                style={[tokenStyles.countText, styles?.countText]}
                testID="image-preview-count"
              >
                {`${normalizedIndex + 1} / ${images.length}`}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Popup>
  );
}
