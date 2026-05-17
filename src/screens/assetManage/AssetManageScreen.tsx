import React, { useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import {
  Column,
  Empty,
  FloatingActionGroup,
  ListCollapse,
  ListItem,
  SwipeAction,
  Text,
  useToast,
} from '@pennyspring/component';
import { api, ASSET_TYPE, type AssetRow } from '@pennyspring/data';
import { createUseSheetStyle } from '@pennyspring/theme';

import { ROOT_ROUTES, useNavigation } from '../../navigation';

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
  },
  content: {
    flex: 1,
  },
}));

export function AssetManageScreen() {
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();

  const { data, loading, refresh } = useRequest(() => api.asset.getAll());

  const groupedAssets = useMemo(() => {
    const assets = data ?? [];
    const groups: Record<string, AssetRow[]> = {};
    for (const asset of assets) {
      if (!groups[asset.type]) {
        groups[asset.type] = [];
      }
      groups[asset.type].push(asset);
    }
    return groups;
  }, [data]);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await api.asset.delete(id);
        refresh();
      } catch (error) {
        toast.show({
          messageText: error instanceof Error ? error.message : '删除失败',
        });
      }
    },
    [refresh, toast],
  );

  const handleItemPress = useCallback(
    (assetId: number) => {
      navigation.navigate(ROOT_ROUTES.AssetEdit, { assetId });
    },
    [navigation],
  );

  const handleCreate = useCallback(() => {
    navigation.navigate(ROOT_ROUTES.AssetEdit, { assetId: undefined });
  }, [navigation]);

  const assetTypes = ASSET_TYPE.options();
  const hasAssets = (data?.length ?? 0) > 0;

  return (
    <Column style={styles.container}>
      <ScrollView style={styles.content}>
        {!hasAssets && !loading ? (
          <Empty />
        ) : (
          assetTypes.map(typeInfo => {
            const assets = groupedAssets[typeInfo.value] ?? [];
            if (assets.length === 0) return null;

            return (
              <ListCollapse key={typeInfo.value} titleText={typeInfo.label} defaultExpanded>
                {assets.map(asset => (
                  <SwipeAction
                    key={asset.id}
                    rightActions={[
                      {
                        key: 'delete',
                        text: '删除',
                        color: 'danger',
                        onPress: () => handleDelete(asset.id),
                      },
                    ]}
                  >
                    <ListItem
                      titleText={asset.name}
                      right={<Text>{(asset.balance / 100).toFixed(2)}</Text>}
                      onPress={() => handleItemPress(asset.id)}
                    />
                  </SwipeAction>
                ))}
              </ListCollapse>
            );
          })
        )}
      </ScrollView>

      <FloatingActionGroup
        actions={[{ key: 'create-asset', icon: 'add', onPress: handleCreate }]}
      />
    </Column>
  );
}
