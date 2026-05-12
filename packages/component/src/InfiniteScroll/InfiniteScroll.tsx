import React, { useCallback, useMemo, useRef } from 'react';
import { FlatList, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Loading } from '../Loading';
import { Text } from '../Text';
import type { TextSize } from '../Text';
import type { InfiniteScrollProps, InfiniteScrollSize } from './types';

const DEFAULT_SIZE: InfiniteScrollSize = 'normal';
const DEFAULT_THRESHOLD = 0.1;
const DEFAULT_LOADING_TEXT = '加载中...';
const DEFAULT_COMPLETE_TEXT = '没有更多了';

interface InfiniteScrollStyleOptions {
  size: InfiniteScrollSize;
}

function resolveSize(size?: InfiniteScrollSize): InfiniteScrollSize {
  return size ?? DEFAULT_SIZE;
}

function resolveTextSize(size: InfiniteScrollSize): TextSize {
  if (size === 'small') {
    return 'sm';
  }

  if (size === 'large') {
    return 'lg';
  }

  return 'md';
}

const useStyles = createUseSheetStyle((token, { size }: InfiniteScrollStyleOptions) => {
  if (size === 'small') {
    return {
      completeText: {
        color: token.colorTextTertiary,
      },
      footer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: token.paddingXS,
      },
      loadingText: {
        color: token.colorTextSecondary,
      },
    };
  }

  if (size === 'large') {
    return {
      completeText: {
        color: token.colorTextTertiary,
      },
      footer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: token.paddingMD,
      },
      loadingText: {
        color: token.colorTextSecondary,
      },
    };
  }

  return {
    completeText: {
      color: token.colorTextTertiary,
    },
    footer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: token.paddingSM,
    },
    loadingText: {
      color: token.colorTextSecondary,
    },
  };
});

function isPromiseLike(value: unknown): value is Promise<unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return typeof (value as Promise<unknown>).then === 'function';
}

function createStableFooterContent(
  footer: React.ReactNode,
  stateFooter: React.ReactNode,
): React.ReactNode {
  if (footer === undefined || footer === null || footer === false) {
    return stateFooter;
  }

  if (stateFooter === null) {
    return footer;
  }

  return (
    <>
      {footer}
      {stateFooter}
    </>
  );
}

export function InfiniteScroll<ItemT>({
  complete,
  completeText = DEFAULT_COMPLETE_TEXT,
  footer,
  hasMore = true,
  loadMore,
  loading = false,
  loadingContent,
  loadingText = DEFAULT_LOADING_TEXT,
  onEndReached,
  size,
  style,
  styles,
  threshold = DEFAULT_THRESHOLD,
  ...rest
}: InfiniteScrollProps<ItemT>) {
  const resolvedSize = resolveSize(size);
  const tokenStyles = useStyles({ size: resolvedSize });
  const loadingRef = useRef(false);

  const handleEndReached = useCallback<NonNullable<InfiniteScrollProps<ItemT>['onEndReached']>>((info) => {
    onEndReached?.(info);

    if (!hasMore || loading || loadingRef.current) {
      return;
    }

    loadingRef.current = true;

    try {
      const loadResult = loadMore();

      if (isPromiseLike(loadResult)) {
        void loadResult.finally(() => {
          loadingRef.current = false;
        });
        return;
      }

      loadingRef.current = false;
    } catch (error) {
      loadingRef.current = false;
      throw error;
    }
  }, [hasMore, loadMore, loading, onEndReached]);

  const stateFooter = useMemo(() => {
    if (loading) {
      return (
        <View style={[tokenStyles.footer, styles?.footer]}>
          {loadingContent ?? (
            <Loading
              size={resolvedSize}
              style={styles?.loading}
              styles={{
                text: [tokenStyles.loadingText, styles?.loadingText],
              }}
              text={loadingText}
            />
          )}
        </View>
      );
    }

    if (!hasMore) {
      return (
        <View style={[tokenStyles.footer, styles?.footer, styles?.complete]}>
          {complete ?? (
            <Text
              size={resolveTextSize(resolvedSize)}
              style={[tokenStyles.completeText, styles?.completeText]}
            >
              {completeText}
            </Text>
          )}
        </View>
      );
    }

    return null;
  }, [
    complete,
    completeText,
    hasMore,
    loading,
    loadingContent,
    loadingText,
    resolvedSize,
    styles?.complete,
    styles?.completeText,
    styles?.footer,
    styles?.loading,
    styles?.loadingText,
    tokenStyles.completeText,
    tokenStyles.footer,
    tokenStyles.loadingText,
  ]);

  const footerComponent = useMemo(() => {
    return createStableFooterContent(footer, stateFooter);
  }, [footer, stateFooter]);
  const renderFooter = useCallback(() => {
    return footerComponent;
  }, [footerComponent]);

  return (
    <FlatList
      {...rest}
      ListFooterComponent={renderFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={threshold}
      style={style}
    />
  );
}
