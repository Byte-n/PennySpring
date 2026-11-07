import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { Image, Pressable } from 'react-native';
import {
  Button,
  Column,
  Icon,
  Input,
  List,
  Loading,
  Text,
  createUseSheetStyle,
  type ListItemData,
} from '@pennyspring/ui';

import { ManageConfirmDialog } from '../../components/ManageConfirmDialog';
import {
  filterInstalledApps,
  toggleExcludedPackage,
} from '../../features/quickBookDraft/excludedApps';
import { getDraftErrorMessage } from '../../features/quickBookDraft/errorMessage';
import { getFloatingBallExcludedAppCandidates } from '../../features/quickBookDraft/floatingBall';
import type { QuickBookInstalledApp } from '../../features/quickBookDraft/native';
import { useQuickBookSettingsStore } from '../../features/quickBook/settingsStore';
import { useNavigation } from '../../navigation';

interface ExcludedAppRow extends ListItemData {
  packageName: string;
}

const APP_ICON_SIZE = 38;
const APP_ICON_RADIUS = 12;

const useStyles = createUseSheetStyle(token => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  searchArea: {
    backgroundColor: token.colorBgContainer,
    gap: token.marginSM,
    padding: token.padding,
  },
  list: {
    flex: 1,
  },
  appIcon: {
    borderRadius: APP_ICON_RADIUS,
    height: APP_ICON_SIZE,
    width: APP_ICON_SIZE,
  },
  state: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: token.padding,
  },
  error: {
    alignItems: 'center',
    gap: token.marginSM,
    padding: token.padding,
  },
}));

export function QuickBookExcludedAppsScreen(): React.ReactElement {
  const styles = useStyles();
  const navigation = useNavigation();

  const excludedPackages = useQuickBookSettingsStore(
    state => state.excludedPackages,
  );
  const setExcludedPackages = useQuickBookSettingsStore(
    state => state.setExcludedPackages,
  );

  const [apps, setApps] = useState<QuickBookInstalledApp[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const loadApps = useCallback(async (): Promise<void> => {
    setLoading(true);
    setLoadError('');
    try {
      setApps(await getFloatingBallExcludedAppCandidates());
    } catch (error) {
      setLoadError(getDraftErrorMessage(error, '读取应用列表失败'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApps().catch(() => undefined);
  }, [loadApps]);

  const selectedSet = useMemo(
    () => new Set(excludedPackages),
    [excludedPackages],
  );
  const installedPackageSet = useMemo(
    () => new Set(apps.map(app => app.packageName)),
    [apps],
  );
  const orphanCount = useMemo(
    () =>
      loading
        ? 0
        : excludedPackages.filter(pkg => !installedPackageSet.has(pkg)).length,
    [excludedPackages, installedPackageSet, loading],
  );

  const togglePackage = useCallback(
    (packageName: string): void => {
      const store = useQuickBookSettingsStore.getState();
      const selected = store.excludedPackages.includes(packageName);
      store.setExcludedPackages(
        toggleExcludedPackage(store.excludedPackages, packageName, !selected),
      );
    },
    [],
  );

  const rows = useMemo<ExcludedAppRow[]>(() => {
    const filtered = filterInstalledApps(apps, query);
    const keyword = query.trim().toLocaleLowerCase();
    const orphanRows =
      keyword === ''
        ? excludedPackages.filter(pkg => !installedPackageSet.has(pkg))
        : excludedPackages.filter(
            pkg =>
              !installedPackageSet.has(pkg) &&
              pkg.toLocaleLowerCase().includes(keyword),
          );
    return [
      ...filtered.map(app => ({
        value: app.packageName,
        packageName: app.packageName,
        left:
          app.icon !== '' ? (
            <Image
              accessible={false}
              source={{ uri: app.icon }}
              style={styles.appIcon}
            />
          ) : (
            <Icon color="tertiary" icon="image" size={20} />
          ),
        titleText: app.label,
        selected: selectedSet.has(app.packageName),
        onPress: () => togglePackage(app.packageName),
      })),
      ...orphanRows.map(packageName => ({
        value: packageName,
        packageName,
        titleText: packageName,
        descriptionText: '未安装或不可见',
        selected: true,
        onPress: () => togglePackage(packageName),
      })),
    ];
  }, [
    apps,
    excludedPackages,
    installedPackageSet,
    query,
    selectedSet,
    styles.appIcon,
    togglePackage,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight:
        excludedPackages.length > 0
          ? () => (
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setClearDialogOpen(true)}
              >
                <Text color="primary" size="sm">
                  清空
                </Text>
              </Pressable>
            )
          : undefined,
    });
  }, [excludedPackages.length, navigation]);

  const hintText = useMemo(() => {
    if (excludedPackages.length === 0) {
      return '默认不排除任何应用。选中后，悬浮球在该应用位于前台时自动隐藏，离开后恢复。';
    }
    const base = `已排除 ${excludedPackages.length} 个应用。悬浮球在这些应用位于前台时自动隐藏，离开后恢复。`;
    return orphanCount > 0
      ? `${base} 有 ${orphanCount} 个已保存的应用未安装，可在此移除。`
      : base;
  }, [excludedPackages.length, orphanCount]);

  const emptyText =
    query.trim() !== '' ? '没有找到匹配的应用。' : '没有可排除的应用。';

  return (
    <Column style={styles.container}>
      <Column style={styles.searchArea}>
        <Input
          allowClear
          onChange={setQuery}
          placeholder="搜索应用名称"
          prefix={<Icon color="tertiary" icon="search" size="small" />}
          value={query}
        />
        <Text color="tertiary" size="xs">
          {hintText}
        </Text>
      </Column>

      {loading ? (
        <Column style={styles.state}>
          <Loading text="正在读取应用…" variant="block" />
        </Column>
      ) : loadError !== '' ? (
        <Column style={styles.error}>
          <Text color="errorText" size="sm">
            {loadError}
          </Text>
          <Button onPress={() => loadApps().catch(() => undefined)} size="small">
            重试
          </Button>
        </Column>
      ) : (
        <List<ExcludedAppRow>
          data={rows}
          empty={<Text color="secondary" size="sm">{emptyText}</Text>}
          keyExtractor={item => item.packageName}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          scrollEnabled
          style={styles.list}
        />
      )}

      <ManageConfirmDialog
        messageText="清空后，悬浮球会在所有应用中重新显示。"
        okText="清空"
        onCancel={() => setClearDialogOpen(false)}
        onConfirm={async () => {
          setExcludedPackages([]);
          setClearDialogOpen(false);
        }}
        open={clearDialogOpen}
        titleText="清空排除列表？"
      />
    </Column>
  );
}
