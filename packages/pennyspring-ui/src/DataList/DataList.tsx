import type { ComponentSize } from '../shares/types';
import React, { useCallback, useMemo, useRef } from 'react';
import { FlatList, View } from 'react-native';
import { Loading } from '../Loading';
import { Text } from '../Text';
import { DataListSection as DataListSectionComponent } from './DataListSection';
import { resolveTextSize, useStyles } from './style';
import type {
  DataListComponent,
  DataListProps,
  DataListSection,
  DataListSectionProps,
} from './types';

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

function DataListInner<ItemT>({
  complete,
  completeText = DEFAULT_COMPLETE_TEXT,
  footer,
  hasMore = true,
  loadMoreThreshold = DEFAULT_THRESHOLD,
  loadingMore = false,
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
}: DataListProps<ItemT>) {
  const resolvedSize = resolveSize(size);
  const tokenStyles = useStyles({ size: resolvedSize });
  const loadingMoreRef = useRef(false);

  const handleEndReached = useCallback<NonNullable<DataListProps<ItemT>['onEndReached']>>(
    (info) => {
      onEndReached?.(info);

      if (!hasMore || loadingMore || loadingMoreRef.current || !onLoadMore) {
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
    [hasMore, loadingMore, onEndReached, onLoadMore],
  );

  const stateFooter = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={[tokenStyles.footer, styles?.footer]}>
          {loadingMoreContent ?? (
            <Loading
              size={resolvedSize}
              style={styles?.loadingMore}
              styles={{
                text: [tokenStyles.loadingMoreText, styles?.loadingMoreText],
              }}
              text={loadingMoreText}
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
    <FlatList
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

export const DataList = DataListInner as DataListComponent;

DataList.Section = DataListSectionComponent as <ItemT, SectionT extends DataListSection<ItemT>>(
  props: DataListSectionProps<ItemT, SectionT>,
) => React.ReactNode;
