import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import {
  ActionSheet,
  Button,
  Column,
  DateTimePicker,
  Icon,
  Input,
  ListPicker,
  Row,
  Spacer,
  SwipeAction,
  Switch,
  Text,
  Textarea,
  useToast,
  type IconComponent,
  type ListPickerCascaderOption,
  type ListPickerCascaderValue,
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
  BankIcon,
  ChartLineIcon,
  CoinsIcon,
  CreditCardIcon,
  TicketIcon,
} from 'phosphor-react-native';

import {
  ASSET_CLASSIFICATION_TREE,
  type AssetClassificationTreeNode,
} from '../../constants/assetClassificationTree';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import { useNavigation } from '../../navigation';
import { createHeaderAddButton } from '../../components/HeaderAddButton';
import { ManageConfirmDialog } from '../../components/ManageConfirmDialog';
import { FormFloatingPanel } from '../../components/FormFloatingPanel';
import { ManageSkeleton } from '../../components/ManageSkeleton';
import {
  ManageAmount,
  ManageCard,
  ManageEmptyCard,
  ManageRow,
  ManageSectionHeader,
} from '../../components/ManageRow';
import {
  buildAssetOverview,
  isLiabilityAsset,
} from '../home/tabs/chart/assetAnalysis';

const PICKER_BASE_YEAR = 2026;
const PICKER_BASE_MONTH = 0;
const CENTS_PER_YUAN = 100;

const ASSET_ICONS: Record<AssetTypeValue, IconComponent> = {
  [ASSET_TYPE.capitalAccount]: BankIcon,
  [ASSET_TYPE.creditCard]: CreditCardIcon,
  [ASSET_TYPE.storedValueCard]: TicketIcon,
  [ASSET_TYPE.investment]: ChartLineIcon,
  [ASSET_TYPE.debt]: CoinsIcon,
};

interface AssetGroupView {
  key: AssetTypeValue;
  label: string;
  assets: AssetRow[];
  visibleTotal: number;
  visibleCount: number;
  hiddenCount: number;
}

function dayToPickerDate(day?: number): Date | undefined {
  if (!day || day < 1 || day > 31) return undefined;
  return new Date(PICKER_BASE_YEAR, PICKER_BASE_MONTH, day);
}

function formatDayText(day?: number): string {
  return day ? `每月 ${day} 日` : '请选择';
}

function formatSignedCents(cents: number): string {
  const sign = cents < 0 ? '−' : '';
  return `${sign}${(Math.abs(cents) / CENTS_PER_YUAN).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatLimit(cents: number): string {
  return (cents / CENTS_PER_YUAN).toLocaleString('zh-CN', {
    maximumFractionDigits: 0,
  });
}

function buildAssetSubtitle(asset: AssetRow): string {
  if (asset.type === ASSET_TYPE.creditCard) {
    const billing =
      asset.billingDate > 0
        ? `每月 ${asset.billingDate} 日出账`
        : '账单日未设';
    const repayment =
      asset.repaymentDate > 0
        ? `${asset.repaymentDate} 日还款`
        : '还款日未设';
    return `${billing} · ${repayment}`;
  }
  if (asset.type === ASSET_TYPE.debt) {
    if (asset.classification === ASSET_CLASSIFICATION.borrow) {
      return '借入债务';
    }
    if (asset.classification === ASSET_CLASSIFICATION.lend) {
      return '应收债权';
    }
  }
  const label =
    ASSET_CLASSIFICATION.label(asset.classification) ||
    ASSET_TYPE.label(asset.type);
  if (asset.cardNo.length >= 4) {
    return `${label} · 尾号 ${asset.cardNo.slice(-4)}`;
  }
  if (label === asset.name) {
    return ASSET_TYPE.label(asset.type);
  }
  return label;
}

function toCascaderOptions(
  nodes: readonly AssetClassificationTreeNode[],
): Array<ListPickerCascaderOption> {
  return nodes.map(node => ({
    value: node.value,
    labelText: node.label,
    children: node.children ? toCascaderOptions(node.children) : undefined,
  }));
}

function buildPathLookup(
  options: Array<ListPickerCascaderOption>,
): Map<ListPickerCascaderValue[number], ListPickerCascaderValue> {
  const result = new Map<
    ListPickerCascaderValue[number],
    ListPickerCascaderValue
  >();
  const stack: Array<{
    node: ListPickerCascaderOption;
    parentPath: ListPickerCascaderValue;
  }> = options.map(node => ({ node, parentPath: [] }));
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

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    if (error.message.includes('资产正在使用中')) {
      return '该账户已被记录使用，先调整这些记录后再删除。';
    }
    return error.message;
  }
  return fallback;
}

const useStyles = createUseSheetStyle(token => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  content: {
    gap: token.marginMD,
    padding: token.padding,
    paddingBottom: token.paddingXL,
  },
  hero: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorSplit,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    gap: token.marginXXS,
    padding: token.padding,
  },
  heroTop: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    color: token.colorTextSecondary,
  },
  heroNote: {
    color: token.colorTextTertiary,
  },
  heroFoot: {
    alignItems: 'center',
    borderTopColor: token.colorSplit,
    borderTopWidth: token.lineWidth,
    marginTop: token.marginSM,
    paddingTop: token.paddingXS,
  },
  heroFootText: {
    color: token.colorTextTertiary,
    flex: 1,
  },
  heroSplit: {
    borderTopColor: token.colorSplit,
    borderTopWidth: token.lineWidth,
    marginTop: token.marginSM,
    paddingTop: token.paddingXS,
  },
  heroSplitItem: {
    flex: 1,
    minWidth: 0,
  },
  heroSplitDivider: {
    alignSelf: 'stretch',
    backgroundColor: token.colorSplit,
    width: token.lineWidth,
  },
  heroSplitLabel: {
    color: token.colorTextTertiary,
  },
  heroSplitValue: {
    color: token.colorTextSecondary,
  },
  heroSplitValueNegative: {
    color: token.colorErrorText,
  },
  section: {
    gap: token.marginXXS,
  },
  listEnd: {
    color: token.colorTextTertiary,
    lineHeight: token.lineHeight,
    textAlign: 'center',
  },
  emptyBody: {
    gap: token.marginXS,
  },
  panelContent: {
    gap: token.marginMD,
  },
  switchRow: {
    alignItems: 'center',
  },
  switchText: {
    flex: 1,
  },
  switchNote: {
    color: token.colorTextTertiary,
  },
}));

export function AssetManageScreen() {
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const currentBook = useBookStore(state => state.currentBook);
  const globalApi = useGlobalApi();

  const { data, loading, refresh } = useRequest(() => {
    if (!currentBook) return Promise.resolve<AssetRow[]>([]);
    return globalApi.asset.getAll(currentBook.id);
  });

  const assets = data ?? [];
  const overview = useMemo(() => buildAssetOverview(assets), [assets]);
  const hiddenCount = useMemo(
    () => assets.filter(asset => asset.invisible === VISIBILITY.hidden).length,
    [assets],
  );

  const cascaderOptions = useMemo(
    () => toCascaderOptions(ASSET_CLASSIFICATION_TREE),
    [],
  );
  const pathLookup = useMemo(
    () => buildPathLookup(cascaderOptions),
    [cascaderOptions],
  );

  const groups = useMemo<AssetGroupView[]>(
    () =>
      ASSET_TYPE.options()
        .map(typeInfo => {
          const groupAssets = assets.filter(
            asset => asset.type === typeInfo.value,
          );
          const visibleAssets = groupAssets.filter(
            asset => asset.invisible !== VISIBILITY.hidden,
          );
          return {
            key: typeInfo.value,
            label: typeInfo.label,
            assets: groupAssets,
            visibleCount: visibleAssets.length,
            hiddenCount: groupAssets.length - visibleAssets.length,
            visibleTotal: visibleAssets.reduce(
              (total, asset) =>
                total +
                (isLiabilityAsset(asset) ? -asset.balance : asset.balance),
              0,
            ),
          };
        })
        .filter(group => group.assets.length > 0),
    [assets],
  );

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [assetPath, setAssetPath] = useState<ListPickerCascaderValue>([
    ASSET_TYPE.capitalAccount,
    ASSET_CLASSIFICATION.cash,
  ]);
  const [balance, setBalance] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [billingDate, setBillingDate] = useState<number | undefined>();
  const [repaymentDate, setRepaymentDate] = useState<number | undefined>();
  const [remark, setRemark] = useState('');
  const [invisible, setInvisible] = useState(false);

  const [menuAsset, setMenuAsset] = useState<AssetRow | null>(null);
  const [pendingDeleteAsset, setPendingDeleteAsset] =
    useState<AssetRow | null>(null);

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: createHeaderAddButton(openCreate),
    });
  }, [navigation, openCreate]);

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

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!name.trim()) {
      toast.show({ messageText: '请输入资产名称' });
      return false;
    }
    if (!currentBook) {
      toast.show({ messageText: '未找到当前账本' });
      return false;
    }
    if (!type || !classification) {
      toast.show({ messageText: '请选择资产类型和分类' });
      return false;
    }
    setSubmitting(true);
    try {
      const input = {
        balance: Math.round(parseFloat(balance || '0') * CENTS_PER_YUAN),
        billingDate: billingDate ?? 0,
        booksId: currentBook.id,
        cardNo: editingAsset?.cardNo ?? '',
        classification,
        invisible: invisible ? VISIBILITY.hidden : VISIBILITY.visible,
        name: name.trim(),
        openBank: editingAsset?.openBank ?? '',
        remark,
        repaymentDate: repaymentDate ?? 0,
        totalAmount: Math.round(
          parseFloat(totalAmount || '0') * CENTS_PER_YUAN,
        ),
        type,
      };
      if (editingAsset) {
        await globalApi.asset.update({ ...input, id: editingAsset.id });
      } else {
        await globalApi.asset.create(input);
      }
      refresh();
      return true;
    } catch (error: unknown) {
      toast.show({ messageText: getErrorMessage(error, '保存失败') });
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [
    balance,
    billingDate,
    classification,
    currentBook,
    editingAsset,
    invisible,
    name,
    refresh,
    remark,
    repaymentDate,
    toast,
    totalAmount,
    type,
  ]);

  const handleDelete = useCallback(async () => {
    const target = pendingDeleteAsset;
    if (!target || !currentBook) {
      return;
    }
    try {
      await globalApi.asset.delete(target.id, currentBook.id);
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, '删除失败'));
    }
    setPendingDeleteAsset(null);
    setMenuAsset(null);
    refresh();
  }, [currentBook, pendingDeleteAsset, refresh]);

  const menuActions = useMemo(
    () => [
      { text: '编辑资产', icon: 'edit' as const },
      { text: '删除资产', icon: 'trash' as const, danger: true },
    ],
    [],
  );

  const handleMenuAction = useCallback(
    (_action: { text: string }, index: number) => {
      const asset = menuAsset;
      setMenuAsset(null);
      if (!asset) {
        return;
      }
      if (index === 0) {
        openEdit(asset);
      } else {
        setPendingDeleteAsset(asset);
      }
    },
    [menuAsset, openEdit],
  );

  const handleFormOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setPanelOpen(false);
    }
  }, []);

  const okDisabled = submitting || !name.trim();
  const hasAssets = assets.length > 0;
  const submitText = editingAsset ? '保存' : '新增';

  return (
    <Column style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {loading && !hasAssets ? (
          <ManageSkeleton showHero />
        ) : !hasAssets ? (
          <ManageEmptyCard>
            <Column style={styles.emptyBody}>
              <Text size="md" weight="medium">
                还没有账户
              </Text>
              <Text color="tertiary" size="xs">
                添加第一个账户，净资产才有数可算
              </Text>
            </Column>
            <Button onPress={openCreate} size="small" type="primary">
              添加第一个账户
            </Button>
          </ManageEmptyCard>
        ) : (
          <>
            <Column style={styles.hero}>
              <Row style={styles.heroTop}>
                <Text size="xs" style={styles.heroLabel}>
                  净资产
                </Text>
                <Text size="xs" style={styles.heroNote}>
                  {`负债率 ${(overview.debtRatio * 100).toFixed(1)}%`}
                </Text>
              </Row>
              <ManageAmount
                showCurrency
                tone={overview.netWorth < 0 ? 'negative' : 'default'}
                value={overview.netWorth}
                variant="hero"
              />
              <Row style={styles.heroSplit}>
                <Column style={styles.heroSplitItem}>
                  <Text size="xs" style={styles.heroSplitLabel}>
                    资产
                  </Text>
                  <Text size="xs" style={styles.heroSplitValue} weight="semibold">
                    {formatSignedCents(overview.assetsTotal)}
                  </Text>
                </Column>
                <Column style={styles.heroSplitDivider} />
                <Column style={styles.heroSplitItem}>
                  <Text size="xs" style={styles.heroSplitLabel}>
                    负债
                  </Text>
                  <Text
                    size="xs"
                    style={styles.heroSplitValueNegative}
                    weight="semibold"
                  >
                    {formatSignedCents(-overview.liabilitiesTotal)}
                  </Text>
                </Column>
                <Column style={styles.heroSplitDivider} />
                <Column style={styles.heroSplitItem}>
                  <Text size="xs" style={styles.heroSplitLabel}>
                    账户
                  </Text>
                  <Text size="xs" style={styles.heroSplitValue} weight="semibold">
                    {`${overview.accounts.length} 个`}
                  </Text>
                </Column>
              </Row>
              {hiddenCount > 0 ? (
                <Row style={styles.heroFoot}>
                  <Text size="xs" style={styles.heroFootText}>
                    {`其中 ${hiddenCount} 个已隐藏，不计入合计`}
                  </Text>
                </Row>
              ) : null}
            </Column>

            {groups.map(group => (
              <Column key={group.key} style={styles.section}>
                <ManageSectionHeader
                  countText={`${group.visibleCount} 个${
                    group.hiddenCount > 0
                      ? ` · ${group.hiddenCount} 隐藏`
                      : ''
                  }`}
                  title={group.label}
                  totalNegative={group.visibleTotal < 0}
                  totalText={formatSignedCents(group.visibleTotal)}
                />
                <ManageCard>
                  {group.assets.map((asset, index) => {
                    const hidden = asset.invisible === VISIBILITY.hidden;
                    const liability = isLiabilityAsset(asset);
                    return (
                      <SwipeAction
                        key={asset.id}
                        rightActions={[
                          {
                            color: 'primary',
                            key: 'edit',
                            actionText: '编辑',
                            onPress: () => openEdit(asset),
                          },
                          {
                            color: 'danger',
                            key: 'delete',
                            actionText: '删除',
                            onPress: () => setPendingDeleteAsset(asset),
                          },
                        ]}
                      >
                        <ManageRow
                          badgeText={hidden ? '已隐藏' : undefined}
                          hasDivider={index > 0}
                          icon={
                            <Icon
                              color="secondary"
                              icon={ASSET_ICONS[asset.type]}
                              size="large"
                            />
                          }
                          isHidden={hidden}
                          onLongPress={() => setMenuAsset(asset)}
                          onMenuPress={() => setMenuAsset(asset)}
                          onPress={() => openEdit(asset)}
                          subtitle={buildAssetSubtitle(asset)}
                          title={asset.name}
                          trailing={
                            <Column align="end">
                              <ManageAmount
                                showCurrency
                                tone={
                                  hidden
                                    ? 'dim'
                                    : liability
                                      ? 'negative'
                                      : 'default'
                                }
                                value={liability ? -asset.balance : asset.balance}
                              />
                              {asset.type === ASSET_TYPE.creditCard ? (
                                <Text color="tertiary" size="xs">
                                  {`额度 ¥${formatLimit(asset.totalAmount)}`}
                                </Text>
                              ) : null}
                            </Column>
                          }
                        />
                      </SwipeAction>
                    );
                  })}
                </ManageCard>
              </Column>
            ))}

            <Text size="xs" style={styles.listEnd}>
              合计口径与图表页一致：净资产 = 资产 − 负债
              {hiddenCount > 0 ? '\n隐藏账户仍可管理，但不参与任何合计' : ''}
            </Text>
          </>
        )}
      </ScrollView>

      <FormFloatingPanel
        onOk={handleSave}
        onOpenChange={handleFormOpenChange}
        open={panelOpen}
        panelBodyStyle={styles.panelContent}
        submitDisabled={okDisabled}
        submitLoading={submitting}
        submitText={submitText}
        titleText={editingAsset ? '编辑资产' : '新增资产'}
      >
        <Input
          labelText="名称"
          onChange={setName}
          placeholder="例如：招商银行储蓄卡"
          value={name}
        />
        <ListPicker.Cascader
          labelText="类型与分类"
          onChange={setAssetPath}
          options={cascaderOptions}
          texts={{ tabPlaceholderText: '请选择' }}
          value={assetPath}
        />
        <Input
          keyboardType="numeric"
          labelText={isCreditCard ? '待还金额' : '当前余额'}
          onChange={setBalance}
          placeholder="0.00"
          value={balance}
        />
        {isCreditCard ? (
          <>
            <Input
              keyboardType="numeric"
              labelText="总额度"
              onChange={setTotalAmount}
              placeholder="0.00"
              value={totalAmount}
            />
            <Row gap="small">
              <Column style={styles.switchText}>
                <DateTimePicker
                  layout="calendar"
                  onOk={(_value, params) => setBillingDate(params.day)}
                  precision="day"
                  titleText="选择账单日"
                  value={dayToPickerDate(billingDate)}
                >
                  <Input
                    labelText="账单日"
                    placeholder="请选择"
                    readonly
                    value={formatDayText(billingDate)}
                  />
                </DateTimePicker>
              </Column>
              <Column style={styles.switchText}>
                <DateTimePicker
                  layout="calendar"
                  onOk={(_value, params) => setRepaymentDate(params.day)}
                  precision="day"
                  titleText="选择还款日"
                  value={dayToPickerDate(repaymentDate)}
                >
                  <Input
                    labelText="还款日"
                    placeholder="请选择"
                    readonly
                    value={formatDayText(repaymentDate)}
                  />
                </DateTimePicker>
              </Column>
            </Row>
          </>
        ) : null}
        <Textarea
          onChangeText={setRemark}
          placeholder="备注（可选）"
          value={remark}
        />
        <Row style={styles.switchRow}>
          <Column style={styles.switchText}>
            <Text size="md">在总览中隐藏</Text>
            <Text size="xs" style={styles.switchNote}>
              隐藏后不计入净资产，首页图表同步忽略
            </Text>
          </Column>
          <Spacer size="small" />
          <Switch onChange={setInvisible} value={invisible} />
        </Row>
      </FormFloatingPanel>

      <ActionSheet
        actions={menuActions}
        cancelText="取消"
        onAction={handleMenuAction}
        onOpenChange={open => {
          if (!open) {
            setMenuAsset(null);
          }
        }}
        open={menuAsset !== null}
        titleText={menuAsset?.name}
      />

      <ManageConfirmDialog
        messageText="删除后账户余额与配置会一并移除，且无法恢复。"
        onCancel={() => setPendingDeleteAsset(null)}
        onConfirm={handleDelete}
        open={pendingDeleteAsset !== null}
        titleText={
          pendingDeleteAsset
            ? `删除「${pendingDeleteAsset.name}」？`
            : '删除资产'
        }
        warningText={
          pendingDeleteAsset?.type === ASSET_TYPE.creditCard
            ? '信用卡账户会被同时移除，待还金额不再计入净资产。'
            : undefined
        }
      />
    </Column>
  );
}
