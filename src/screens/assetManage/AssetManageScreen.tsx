import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import {
  Card,
  Cascader,
  type CascaderOption,
  type CascaderValue,
  Column,
  DateTimePicker,
  Empty,
  FloatingActionGroup,
  Icon,
  Input,
  Popup,
  Row,
  Spacer,
  SwipeAction,
  Switch,
  Tag,
  Text,
  Textarea,
  useToast,
} from '@pennyspring/ui';
import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  type AssetClassificationValue,
  type AssetRow,
  type AssetTypeValue,
  VISIBILITY,
} from '@pennyspring/api';
import { createUseSheetStyle } from '@pennyspring/theme';

import {
  ASSET_CLASSIFICATION_TREE,
  type AssetClassificationTreeNode,
} from '../../constants/assetClassificationTree';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';

const PICKER_BASE_YEAR = 2026;
const PICKER_BASE_MONTH = 0;
const CENTS_PER_YUAN = 100;

interface AssetGroup {
  assets: AssetRow[];
  totalBalance: number;
}

interface AssetSummary {
  totalBalance: number;
  visibleCount: number;
  hiddenCount: number;
  creditLimit: number;
}

function dayToPickerDate(day?: number): Date | undefined {
  if (!day || day < 1 || day > 31) return undefined;
  return new Date(PICKER_BASE_YEAR, PICKER_BASE_MONTH, day);
}

function formatDayText(day?: number): string {
  return day ? `每月${day}日` : '请选择';
}

function formatCurrency(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const absoluteAmount = Math.abs(cents) / CENTS_PER_YUAN;
  return `${sign}¥ ${absoluteAmount.toFixed(2)}`;
}

function formatCreditDate(asset: AssetRow): string {
  const billingText =
    asset.billingDate > 0 ? `${asset.billingDate}日出账` : '账单日未设';
  const repaymentText =
    asset.repaymentDate > 0 ? `${asset.repaymentDate}日还款` : '还款日未设';
  return `${billingText} · ${repaymentText}`;
}

function getClassificationLabel(asset: AssetRow): string {
  return (
    ASSET_CLASSIFICATION.label(asset.classification) ||
    ASSET_TYPE.label(asset.type)
  );
}

function toCascaderOptions(
  nodes: readonly AssetClassificationTreeNode[],
): Array<CascaderOption> {
  return nodes.map(node => ({
    value: node.value,
    labelText: node.label,
    children: node.children ? toCascaderOptions(node.children) : undefined,
  }));
}

function buildPathLookup(
  options: Array<CascaderOption>,
): Map<CascaderValue, CascaderValue[]> {
  const result = new Map<CascaderValue, CascaderValue[]>();
  const stack: Array<{ node: CascaderOption; parentPath: CascaderValue[] }> =
    options.map(node => ({ node, parentPath: [] }));
  while (stack.length > 0) {
    const current = stack.pop()!;
    const nextPath = [...current.parentPath, current.node.value];
    result.set(current.node.value, nextPath);
    if (current.node.children && current.node.children.length > 0) {
      stack.push(
        ...current.node.children.map(child => ({
          node: child,
          parentPath: nextPath,
        })),
      );
    }
  }
  return result;
}

const useStyles = createUseSheetStyle(token => ({
  container: { flex: 1, backgroundColor: token.colorBgLayout },
  content: {
    flex: 1,
    gap: token.marginMD,
    padding: token.padding,
  },
  summaryHeader: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  summaryTitleArea: {
    flex: 1,
    gap: token.marginXXS,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: token.colorPrimaryBg,
    borderRadius: token.borderRadiusLG,
    height: token.controlHeight,
    justifyContent: 'center',
    width: token.controlHeight,
  },
  summaryAmount: {
    color: token.colorPrimaryText,
    marginTop: token.marginSM,
  },
  summaryAmountNegative: {
    color: token.colorErrorText,
  },
  summaryMetrics: {
    gap: token.marginSM,
    marginTop: token.marginMD,
  },
  summaryMetric: {
    backgroundColor: token.colorFillQuaternary,
    borderRadius: token.borderRadius,
    flex: 1,
    gap: token.marginXXS,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  section: {
    gap: token.marginXS,
  },
  groupHeader: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  groupTitleArea: {
    flex: 1,
    gap: token.marginXXS,
  },
  groupTitle: {
    color: token.colorTextHeading,
  },
  group: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    borderColor: token.colorBorderSecondary,
    borderWidth: token.lineWidth,
    overflow: 'hidden',
  },
  item: {
    alignItems: 'flex-start',
    gap: token.marginSM,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
    justifyContent: 'space-between',
  },
  itemMain: {
    flex: 1,
    gap: token.marginXS,
  },
  itemNameRow: {
    alignItems: 'center',
    gap: token.marginXS,
  },
  itemName: {
    flex: 1,
  },
  itemMeta: {
    alignItems: 'center',
    gap: token.marginXS,
  },
  itemAmountArea: {
    alignItems: 'flex-end',
    gap: token.marginXXS,
  },
  itemBalanceNegative: { color: token.colorErrorText },
  divider: {
    backgroundColor: token.colorBorderSecondary,
    height: token.lineWidth,
    marginLeft: token.padding,
  },
  panelContent: { padding: token.padding, gap: token.marginMD },
}));

export function AssetManageScreen() {
  const styles = useStyles();

  const toast = useToast();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();

  const { data, loading, refresh } = useRequest(() => {
    if (!currentBook) return Promise.resolve([]);
    return globalApi.asset.getAll(currentBook.id);
  });

  const cascaderOptions = useMemo(
    () => toCascaderOptions(ASSET_CLASSIFICATION_TREE),
    [],
  );
  const pathLookup = useMemo(
    () => buildPathLookup(cascaderOptions),
    [cascaderOptions],
  );

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRow | null>(null);
  const [name, setName] = useState('');
  const [assetPath, setAssetPath] = useState<CascaderValue[]>([
    ASSET_TYPE.capitalAccount,
    ASSET_CLASSIFICATION.cash,
  ]);
  const [balance, setBalance] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [billingDate, setBillingDate] = useState<number | undefined>();
  const [repaymentDate, setRepaymentDate] = useState<number | undefined>();
  const [remark, setRemark] = useState('');
  const [invisible, setInvisible] = useState(false);

  const groupedAssets = useMemo(() => {
    const assets = data ?? [];
    const groups: Record<string, AssetGroup> = {};
    for (const asset of assets) {
      const currentGroup = groups[asset.type] ?? {
        assets: [],
        totalBalance: 0,
      };
      groups[asset.type] = {
        assets: [...currentGroup.assets, asset],
        totalBalance: currentGroup.totalBalance + asset.balance,
      };
    }
    return groups;
  }, [data]);

  const assetSummary = useMemo<AssetSummary>(() => {
    const assets = data ?? [];
    return assets.reduce<AssetSummary>(
      (summary, asset) => ({
        totalBalance: summary.totalBalance + asset.balance,
        visibleCount:
          summary.visibleCount +
          (asset.invisible === VISIBILITY.visible ? 1 : 0),
        hiddenCount:
          summary.hiddenCount + (asset.invisible === VISIBILITY.hidden ? 1 : 0),
        creditLimit:
          summary.creditLimit +
          (asset.type === ASSET_TYPE.creditCard ? asset.totalAmount : 0),
      }),
      {
        totalBalance: 0,
        visibleCount: 0,
        hiddenCount: 0,
        creditLimit: 0,
      },
    );
  }, [data]);

  const resetForm = useCallback(() => {
    setName('');
    setAssetPath([ASSET_TYPE.capitalAccount, ASSET_CLASSIFICATION.cash]);
    setBalance('');
    setTotalAmount('');
    setBillingDate(undefined);
    setRepaymentDate(undefined);
    setRemark('');
    setInvisible(false);
  }, []);

  const openCreate = useCallback(() => {
    setEditingAsset(null);
    resetForm();
    setPanelOpen(true);
  }, [resetForm]);

  const openEdit = useCallback(
    (asset: AssetRow) => {
      setEditingAsset(asset);
      setName(asset.name);
      const classificationPath = pathLookup.get(asset.classification);
      const typePath = pathLookup.get(asset.type);
      setAssetPath(
        classificationPath ??
          typePath ?? [ASSET_TYPE.capitalAccount, ASSET_CLASSIFICATION.cash],
      );
      setBalance((asset.balance / CENTS_PER_YUAN).toFixed(2));
      setTotalAmount((asset.totalAmount / CENTS_PER_YUAN).toFixed(2));
      setBillingDate(asset.billingDate > 0 ? asset.billingDate : undefined);
      setRepaymentDate(
        asset.repaymentDate > 0 ? asset.repaymentDate : undefined,
      );
      setRemark(asset.remark);
      setInvisible(asset.invisible === VISIBILITY.hidden);
      setPanelOpen(true);
    },
    [pathLookup],
  );

  const type = assetPath[0] as AssetTypeValue | undefined;
  const classification = assetPath[assetPath.length - 1] as
    | AssetClassificationValue
    | undefined;
  const isCreditCard = type === ASSET_TYPE.creditCard;

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.show({ messageText: '请输入资产名称' });
      return;
    }
    if (!currentBook) {
      toast.show({ messageText: '未找到当前账本' });
      return;
    }
    if (!type || !classification) {
      toast.show({ messageText: '请选择资产类型和分类' });
      return;
    }
    try {
      const input = {
        booksId: currentBook.id,
        name: name.trim(),
        balance: Math.round(parseFloat(balance || '0') * CENTS_PER_YUAN),
        totalAmount: Math.round(
          parseFloat(totalAmount || '0') * CENTS_PER_YUAN,
        ),
        billingDate: billingDate ?? 0,
        repaymentDate: repaymentDate ?? 0,
        type,
        classification,
        invisible: invisible ? VISIBILITY.hidden : VISIBILITY.visible,
        remark,
      };
      if (editingAsset) {
        await globalApi.asset.update({ ...input, id: editingAsset.id });
      } else {
        await globalApi.asset.create(input);
      }
      setPanelOpen(false);
      refresh();
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '保存失败' });
    }
  }, [
    name,
    type,
    classification,
    balance,
    totalAmount,
    billingDate,
    repaymentDate,
    remark,
    invisible,
    currentBook,
    editingAsset,
    refresh,
    toast,
  ]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!currentBook) {
        toast.show({ messageText: '未找到当前账本' });
        return;
      }
      try {
        await globalApi.asset.delete(id, currentBook.id);
        refresh();
      } catch (e: unknown) {
        toast.show({
          messageText: e instanceof Error ? e.message : '删除失败',
        });
      }
    },
    [currentBook, refresh, toast],
  );

  const assetTypes = ASSET_TYPE.options();
  const hasAssets = (data?.length ?? 0) > 0;

  return (
    <Column style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {!hasAssets && !loading ? (
          <Empty />
        ) : (
          <>
            <Card size="large" variant="summary">
              <Row style={styles.summaryHeader}>
                <Column style={styles.summaryTitleArea}>
                  <Text color="secondary" size="sm">
                    资产总览
                  </Text>
                  <Text color="description" size="sm">
                    按账户类型归集当前账本资产
                  </Text>
                </Column>
                <Column style={styles.summaryIcon}>
                  <Icon color="primaryText" icon="list" size="normal" />
                </Column>
              </Row>
              <Text
                size="h2"
                style={[
                  styles.summaryAmount,
                  assetSummary.totalBalance < 0 && styles.summaryAmountNegative,
                ]}
              >
                {formatCurrency(assetSummary.totalBalance)}
              </Text>
              <Row style={styles.summaryMetrics}>
                <Column style={styles.summaryMetric}>
                  <Text color="secondary" size="sm">
                    展示中
                  </Text>
                  <Text weight="semibold">{assetSummary.visibleCount} 个</Text>
                </Column>
                <Column style={styles.summaryMetric}>
                  <Text color="secondary" size="sm">
                    已隐藏
                  </Text>
                  <Text weight="semibold">{assetSummary.hiddenCount} 个</Text>
                </Column>
                <Column style={styles.summaryMetric}>
                  <Text color="secondary" size="sm">
                    信用额度
                  </Text>
                  <Text weight="semibold">
                    {formatCurrency(assetSummary.creditLimit)}
                  </Text>
                </Column>
              </Row>
            </Card>

            {assetTypes.map(typeInfo => {
              const group = groupedAssets[typeInfo.value];
              if (!group || group.assets.length === 0) return null;
              return (
                <Column key={typeInfo.value} style={styles.section}>
                  <Row style={styles.groupHeader}>
                    <Column style={styles.groupTitleArea}>
                      <Text
                        size="lg"
                        weight="semibold"
                        style={styles.groupTitle}
                      >
                        {typeInfo.label}
                      </Text>
                      <Text color="secondary" size="sm">
                        {typeInfo.description}
                      </Text>
                    </Column>
                    <Column align="end">
                      <Text
                        weight="semibold"
                        style={
                          group.totalBalance < 0 && styles.itemBalanceNegative
                        }
                      >
                        {formatCurrency(group.totalBalance)}
                      </Text>
                      <Text color="tertiary" size="sm">
                        {group.assets.length} 个资产
                      </Text>
                    </Column>
                  </Row>
                  <Column style={styles.group}>
                    {group.assets.map((asset, idx) => (
                      <React.Fragment key={asset.id}>
                        {idx > 0 && <Column style={styles.divider} />}
                        <SwipeAction
                          rightActions={[
                            {
                              key: 'edit',
                              actionText: '编辑',
                              color: 'primary',
                              onPress: () => openEdit(asset),
                            },
                            {
                              key: 'delete',
                              actionText: '删除',
                              color: 'danger',
                              onPress: () => handleDelete(asset.id),
                            },
                          ]}
                        >
                          <Row style={styles.item}>
                            <Column style={styles.itemMain}>
                              <Row style={styles.itemNameRow}>
                                <Text
                                  numberOfLines={1}
                                  weight="semibold"
                                  style={styles.itemName}
                                >
                                  {asset.name}
                                </Text>
                                {asset.invisible === VISIBILITY.hidden ? (
                                  <Tag color="default" size="small">
                                    隐藏
                                  </Tag>
                                ) : null}
                              </Row>
                              <Row wrap style={styles.itemMeta}>
                                <Tag
                                  color="blue"
                                  size="small"
                                  variant="outlined"
                                >
                                  {getClassificationLabel(asset)}
                                </Tag>
                                <Text
                                  color="secondary"
                                  numberOfLines={1}
                                  size="sm"
                                >
                                  {asset.type === ASSET_TYPE.creditCard
                                    ? formatCreditDate(asset)
                                    : typeInfo.description}
                                </Text>
                              </Row>
                            </Column>
                            <Column style={styles.itemAmountArea}>
                              <Text
                                size="lg"
                                weight="semibold"
                                style={
                                  asset.balance < 0 &&
                                  styles.itemBalanceNegative
                                }
                              >
                                {formatCurrency(asset.balance)}
                              </Text>
                              {asset.type === ASSET_TYPE.creditCard ? (
                                <Text color="tertiary" size="sm">
                                  额度 {formatCurrency(asset.totalAmount)}
                                </Text>
                              ) : null}
                            </Column>
                          </Row>
                        </SwipeAction>
                      </React.Fragment>
                    ))}
                  </Column>
                </Column>
              );
            })}
          </>
        )}
      </ScrollView>

      <FloatingActionGroup
        actions={[
          {
            key: 'create-asset',
            icon: 'add',
            onPress: openCreate,
            buttonProps: { color: 'cyan' },
          },
        ]}
      />

      <Popup.FloatingPanel
        open={panelOpen}
        onOpenChange={open => {
          if (!open) setPanelOpen(false);
        }}
        position="bottom"
        keyboardAvoiding
        height="70%"
        titleText="新增资产"
        okText={editingAsset ? '保存' : '新增'}
        onOk={handleSave}
        styles={{ panelBody: styles.panelContent }}
      >
        <Input
          labelText="资产名称"
          placeholder="请输入"
          value={name}
          onChange={setName}
        />
        <Cascader
          options={cascaderOptions}
          value={assetPath}
          tabPlaceholderText="请选择"
          labelText="资产类型和分类"
          onChange={setAssetPath}
        />
        <Input
          labelText="余额(元)"
          placeholder="请输入金额"
          value={balance}
          onChange={setBalance}
          keyboardType="numeric"
        />
        {isCreditCard && (
          <>
            <Input
              labelText="总额度(元)"
              placeholder="请输入金额"
              value={totalAmount}
              onChange={setTotalAmount}
              keyboardType="numeric"
            />
            <DateTimePicker
              precision="day"
              layout="calendar"
              value={dayToPickerDate(billingDate)}
              titleText="选择账单日"
              onOk={(_v, params) => setBillingDate(params.day)}
            >
              <Input
                labelText="账单日"
                placeholder="请选择"
                value={formatDayText(billingDate)}
                readonly
              />
            </DateTimePicker>
            <DateTimePicker
              precision="day"
              layout="calendar"
              value={dayToPickerDate(repaymentDate)}
              titleText="选择还款日"
              onOk={(_v, params) => setRepaymentDate(params.day)}
            >
              <Input
                labelText="还款日"
                placeholder="请选择"
                value={formatDayText(repaymentDate)}
                readonly
              />
            </DateTimePicker>
          </>
        )}
        <Textarea
          placeholder="备注(可选)"
          value={remark}
          onChangeText={setRemark}
        />
        <Row>
          <Text>隐藏资产</Text>
          <Spacer size="small" />
          <Switch value={invisible} onChange={setInvisible} />
        </Row>
      </Popup.FloatingPanel>
    </Column>
  );
}
