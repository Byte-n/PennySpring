import type { ComponentSize } from '../shares/types';
import React, { useCallback, useMemo, useRef } from 'react';
import { SectionList } from 'react-native';
import { Column } from '../Column';
import { Loading } from '../Loading';
import { Text } from '../Text';
import { resolveTextSize, useStyles } from './style';
import type { DataListSectionProps } from './types';

const DEFAULT_SIZE: ComponentSize = 'normal';
const DEFAULT_THRESHOLD = 0.1;
const DEFAULT_LOADING_MORE_TEXT = '加载中...';
const DEFAULT_COMPLETE_TEXT = '没有更多了';

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? DEFAULT_SIZE;
}

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

export function DataListSection<
  ItemT,
  SectionT extends {
    key: string;
    data: ItemT[];
  },
>({
  complete,
  completeText = DEFAULT_COMPLETE_TEXT,
  footer,
  hasMore = true,
  isLoadingMore = false,
  loadMoreThreshold = DEFAULT_THRESHOLD,
  loadingMore,
  loadingMoreContent,
  loadingMoreText = DEFAULT_LOADING_MORE_TEXT,
  onEndReached,
  onLoadMore,
  onRefresh,
  refreshing,
  size,
  style,
  styles,
  ...rest
}: DataListSectionProps<ItemT, SectionT>) {
  const resolvedSize = resolveSize(size);
  const tokenStyles = useStyles({ size: resolvedSize });
  const loadingMoreRef = useRef(false);

  const handleEndReached = useCallback<
    NonNullable<DataListSectionProps<ItemT, SectionT>['onEndReached']>
  >(
    (info) => {
      onEndReached?.(info);

      if (!hasMore || isLoadingMore || loadingMoreRef.current || !onLoadMore) {
        return;
      }

      loadingMoreRef.current = true;

      try {
        const loadResult = onLoadMore();

        if (isPromiseLike(loadResult)) {
          loadResult.finally(() => {
            loadingMoreRef.current = false;
          });
          return;
        }

        loadingMoreRef.current = false;
      } catch (error) {
        loadingMoreRef.current = false;
        throw error;
      }
    },
    [hasMore, isLoadingMore, onEndReached, onLoadMore],
  );

  const stateFooter = useMemo(() => {
    if (isLoadingMore) {
      return (
        <Column style={[tokenStyles.footer, styles?.footer]}>
          {loadingMore ?? loadingMoreContent ?? (
            <Loading
              size={resolvedSize}
              style={styles?.loadingMore}
              styles={{
                text: [tokenStyles.loadingMoreText, styles?.loadingMoreText],
              }}
              text={loadingMoreText}
            />
          )}
        </Column>
      );
    }

    if (!hasMore) {
      return (
        <Column style={[tokenStyles.footer, styles?.footer, styles?.complete]}>
          {complete ?? (
            <Text
              size={resolveTextSize(resolvedSize)}
              style={[tokenStyles.completeText, styles?.completeText]}
            >
              {completeText}
            </Text>
          )}
        </Column>
      );
    }

    return null;
  }, [
    complete,
    completeText,
    hasMore,
    isLoadingMore,
    loadingMore,
    loadingMoreContent,
    loadingMoreText,
    resolvedSize,
    styles?.complete,
    styles?.completeText,
    styles?.footer,
    styles?.loadingMore,
    styles?.loadingMoreText,
    tokenStyles.completeText,
    tokenStyles.footer,
    tokenStyles.loadingMoreText,
  ]);

  const footerComponent = useMemo(() => {
    return createStableFooterContent(footer, stateFooter);
  }, [footer, stateFooter]);

  const renderFooter = useCallback(() => {
    return footerComponent;
  }, [footerComponent]);

  return (
    <SectionList
      {...rest}
      ListFooterComponent={renderFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={loadMoreThreshold}
      onRefresh={onRefresh}
      refreshing={refreshing}
      style={style}
    />
  );
}
