import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import {
  ActionSheet,
  Button,
  Column,
  DateTimePicker,
  Form,
  Icon,
  Input,
  List,
  ListPicker,
  Row,
  Spacer,
  Switch,
  Text,
  Textarea,
  useToast,
  type IconComponent,
  type ListItemData,
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
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';
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

interface AssetListItem extends ListItemData {
  id: number;
  asset: AssetRow;
}

function dayToPickerDate(day?: number): Date | undefined {
  if (!day || day < 1 || day > 31) return undefined;
  return new Date(PICKER_BASE_YEAR, PICKER_BASE_MONTH, day);
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
      asset.billingDate > 0 ? `每月 ${asset.billingDate} 日出账` : '账单日未设';
    const repayment =
      asset.repaymentDate > 0 ? `${asset.repaymentDate} 日还款` : '还款日未设';
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

interface AssetFormValues {
  name: string;
  assetPath: ListPickerCascaderValue;
  balance: string;
  totalAmount: string;
  billingDate?: number;
  repaymentDate?: number;
  remark: string;
  invisible: boolean;
}

const TypedForm = Form.infer<AssetFormValues>();

const EMPTY_ASSET_FORM: AssetFormValues = {
  name: '',
  assetPath: [ASSET_TYPE.capitalAccount, ASSET_CLASSIFICATION.cash],
  balance: '',
  totalAmount: '',
  billingDate: undefined,
  repaymentDate: undefined,
  remark: '',
  invisible: false,
};

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
    padding: token.padding,
  },
  heroFoot: {
    borderTopColor: token.colorSplit,
    borderTopWidth: token.lineWidth,
    marginTop: token.marginSM,
    paddingTop: token.paddingXS,
  },
  heroFootText: {
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
  listEnd: {
    lineHeight: token.lineHeight,
  },
  switchText: {
    flex: 1,
  },
}));

export function AssetManageScreen() {
  const { token } = useTheme();
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

  const [form] = TypedForm.useForm();
  const submitSucceededRef = useRef(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [menuAsset, setMenuAsset] = useState<AssetRow | null>(null);
  const [pendingDeleteAsset, setPendingDeleteAsset] = useState<AssetRow | null>(
    null,
  );

  const openCreate = useCallback(() => {
    setEditingAsset(null);
    form.reset(EMPTY_ASSET_FORM);
    setPanelOpen(true);
  }, [form]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: createHeaderAddButton(openCreate),
    });
  }, [navigation, openCreate]);

  const openEdit = useCallback(
    (asset: AssetRow) => {
      setEditingAsset(asset);
      const classificationPath = pathLookup.get(asset.classification);
      const typePath = pathLookup.get(asset.type);
      form.reset({
        assetPath: classificationPath ??
          typePath ?? [ASSET_TYPE.capitalAccount, ASSET_CLASSIFICATION.cash],
        balance: (asset.balance / CENTS_PER_YUAN).toFixed(2),
        billingDate: asset.billingDate > 0 ? asset.billingDate : undefined,
        invisible: asset.invisible === VISIBILITY.hidden,
        name: asset.name,
        remark: asset.remark,
        repaymentDate:
          asset.repaymentDate > 0 ? asset.repaymentDate : undefined,
        totalAmount: (asset.totalAmount / CENTS_PER_YUAN).toFixed(2),
      });
      setPanelOpen(true);
    },
    [form, pathLookup],
  );

  const handleFinish = useCallback(
    async (values: AssetFormValues) => {
      submitSucceededRef.current = false;
      if (!currentBook) {
        toast.show({ messageText: '未找到当前账本' });
        return;
      }
      const type = values.assetPath[0] as AssetTypeValue;
      const classification = values.assetPath[
        values.assetPath.length - 1
      ] as AssetClassificationValue;
      setSubmitting(true);
      try {
        const input = {
          balance: Math.round(
            parseFloat(values.balance || '0') * CENTS_PER_YUAN,
          ),
          billingDate: values.billingDate ?? 0,
          booksId: currentBook.id,
          cardNo: editingAsset?.cardNo ?? '',
          classification,
          invisible: values.invisible ? VISIBILITY.hidden : VISIBILITY.visible,
          name: values.name.trim(),
          openBank: editingAsset?.openBank ?? '',
          remark: values.remark,
          repaymentDate: values.repaymentDate ?? 0,
          totalAmount: Math.round(
            parseFloat(values.totalAmount || '0') * CENTS_PER_YUAN,
          ),
          type,
        };
        if (editingAsset) {
          await globalApi.asset.update({ ...input, id: editingAsset.id });
        } else {
          await globalApi.asset.create(input);
        }
        refresh();
        submitSucceededRef.current = true;
      } catch (error: unknown) {
        toast.show({ messageText: getErrorMessage(error, '保存失败') });
      } finally {
        setSubmitting(false);
      }
    },
    [currentBook, editingAsset, globalApi.asset, refresh, toast],
  );

  const handlePanelOk = useCallback(async () => {
    submitSucceededRef.current = false;
    await form.handleSubmit();
    return submitSucceededRef.current;
  }, [form]);

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

  const hasAssets = assets.length > 0;
  const submitText = editingAsset ? '保存' : '新增';

  return (
    <Column style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} scrollEnabled>
        {loading && !hasAssets ? (
          <ManageSkeleton showHero />
        ) : !hasAssets ? (
          <ManageEmptyCard>
            <Column gap="small">
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
            <Column style={styles.hero} gap={token.marginXXS}>
              <Row align="center" justify="between">
                <Text size="xs" color="secondary">
                  净资产
                </Text>
                <Text size="xs" color="tertiary">
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
                  <Text size="xs" color="tertiary">
                    资产
                  </Text>
                  <Text size="xs" weight="semibold" color="secondary">
                    {formatSignedCents(overview.assetsTotal)}
                  </Text>
                </Column>
                <Column style={styles.heroSplitDivider} />
                <Column style={styles.heroSplitItem}>
                  <Text size="xs" color="tertiary">
                    负债
                  </Text>
                  <Text size="xs" weight="semibold" color="errorText">
                    {formatSignedCents(-overview.liabilitiesTotal)}
                  </Text>
                </Column>
                <Column style={styles.heroSplitDivider} />
                <Column style={styles.heroSplitItem}>
                  <Text size="xs" color="tertiary">
                    账户
                  </Text>
                  <Text size="xs" weight="semibold" color="secondary">
                    {`${overview.accounts.length} 个`}
                  </Text>
                </Column>
              </Row>
              {hiddenCount > 0 ? (
                <Row style={styles.heroFoot} align="center">
                  <Text size="xs" style={styles.heroFootText} color="tertiary">
                    {`其中 ${hiddenCount} 个已隐藏，不计入合计`}
                  </Text>
                </Row>
              ) : null}
            </Column>

            {groups.map(group => (
              <Column key={group.key} gap={token.marginXXS}>
                <ManageSectionHeader
                  countText={`${group.visibleCount} 个${
                    group.hiddenCount > 0 ? ` · ${group.hiddenCount} 隐藏` : ''
                  }`}
                  title={group.label}
                  totalNegative={group.visibleTotal < 0}
                  totalText={formatSignedCents(group.visibleTotal)}
                />
                <ManageCard>
                  <List<AssetListItem>
                    data={group.assets.map((asset): AssetListItem => {
                      const hidden = asset.invisible === VISIBILITY.hidden;
                      const liability = isLiabilityAsset(asset);

                      return {
                        id: asset.id,
                        asset,
                        value: asset.id,
                        titleText: asset.name,
                        descriptionText: buildAssetSubtitle(asset),
                        left: (
                          <Icon
                            color="secondary"
                            icon={ASSET_ICONS[asset.type]}
                            size="large"
                          />
                        ),
                        badgeText: hidden ? '已隐藏' : undefined,
                        onLongPress: () => setMenuAsset(asset),
                        onPress: () => openEdit(asset),
                        right: (
                          <Row align="center" gap="small">
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
                                value={
                                  liability ? -asset.balance : asset.balance
                                }
                              />
                              {asset.type === ASSET_TYPE.creditCard ? (
                                <Text color="tertiary" size="xs">
                                  {`额度 ¥${formatLimit(asset.totalAmount)}`}
                                </Text>
                              ) : null}
                            </Column>
                            <Pressable
                              accessibilityLabel={`更多操作：${asset.name}`}
                              hitSlop={6}
                              onPress={() => setMenuAsset(asset)}
                            >
                              <Icon color="tertiary" icon="more" size="large" />
                            </Pressable>
                          </Row>
                        ),
                      };
                    })}
                    keyExtractor={asset => String(asset.id)}
                    renderSwipeActions={({ item }) => ({
                      rightActions: [
                        {
                          color: 'primary',
                          key: 'edit',
                          actionText: '编辑',
                          onPress: () => openEdit(item.asset),
                        },
                        {
                          color: 'danger',
                          key: 'delete',
                          actionText: '删除',
                          onPress: () => setPendingDeleteAsset(item.asset),
                        },
                      ],
                    })}
                    scrollEnabled={false}
                  />
                </ManageCard>
              </Column>
            ))}

            <Text
              size="xs"
              style={styles.listEnd}
              color="tertiary"
              textAlign="center"
            >
              合计口径与图表页一致：净资产 = 资产 − 负债
              {hiddenCount > 0 ? '\n隐藏账户仍可管理，但不参与任何合计' : ''}
            </Text>
          </>
        )}
      </ScrollView>

      <FormFloatingPanel
        scrollEnabled
        onOk={handlePanelOk}
        onOpenChange={handleFormOpenChange}
        open={panelOpen}
        submitLoading={submitting}
        submitText={submitText}
        titleText={editingAsset ? '编辑资产' : '新增资产'}
      >
        <TypedForm form={form} labelMode="child" onFinish={handleFinish}>
          <TypedForm.Item
            name="name"
            labelText="名称"
            required
            requiredMessage="请输入资产名称"
          >
            <Input allowClear placeholder="例如：招商银行储蓄卡" />
          </TypedForm.Item>
          <TypedForm.Item
            name="assetPath"
            labelText="类型与分类"
            rules={value =>
              value.length >= 2 ? undefined : '请选择资产类型和分类'
            }
          >
            <ListPicker.Cascader
              options={cascaderOptions}
              texts={{ tabPlaceholderText: '请选择' }}
            />
          </TypedForm.Item>
          <TypedForm.Subscribe selector={state => state.values}>
            {values => {
              const isCreditCard =
                values.assetPath[0] === ASSET_TYPE.creditCard;
              return (
                <>
                  <TypedForm.Item
                    name="balance"
                    labelText={isCreditCard ? '待还金额' : '当前余额'}
                  >
                    <Input
                      allowClear
                      keyboardType="numeric"
                      placeholder="0.00"
                    />
                  </TypedForm.Item>
                  {isCreditCard ? (
                    <>
                      <TypedForm.Item name="totalAmount" labelText="总额度">
                        <Input
                          allowClear
                          keyboardType="numeric"
                          placeholder="0.00"
                        />
                      </TypedForm.Item>
                      <Row gap="small">
                        <Column style={styles.switchText}>
                          <DateTimePicker
                            labelText="账单日"
                            layout="calendar"
                            onOk={(_value, params) =>
                              form.setFieldValue('billingDate', params.day)
                            }
                            precision="day"
                            titleText="选择账单日"
                            value={dayToPickerDate(values.billingDate)}
                          />
                        </Column>
                        <Column style={styles.switchText}>
                          <DateTimePicker
                            labelText="还款日"
                            layout="calendar"
                            onOk={(_value, params) =>
                              form.setFieldValue('repaymentDate', params.day)
                            }
                            precision="day"
                            titleText="选择还款日"
                            value={dayToPickerDate(values.repaymentDate)}
                          />
                        </Column>
                      </Row>
                    </>
                  ) : null}
                </>
              );
            }}
          </TypedForm.Subscribe>
          <TypedForm.Item name="remark" noStyle>
            <Textarea placeholder="备注（可选）" />
          </TypedForm.Item>
          <TypedForm.Item name="invisible" noStyle>
            <Row align="center">
              <Column style={styles.switchText}>
                <Text size="md">在总览中隐藏</Text>
                <Text size="xs" color="tertiary">
                  隐藏后不计入净资产，首页图表同步忽略
                </Text>
              </Column>
              <Spacer size="small" />
              <Switch />
            </Row>
          </TypedForm.Item>
        </TypedForm>
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
