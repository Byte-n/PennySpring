import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import {
  Button,
  Cascader,
  Column,
  DateTimePicker,
  Empty,
  FloatingActionGroup,
  Input,
  Popup,
  Row,
  Spacer,
  SwipeAction,
  Switch,
  Text,
  Textarea,
  useToast,
  type CascaderOption,
  type CascaderValue,
} from '@pennyspring/component';
import {
  api,
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  VISIBILITY,
  type AssetClassificationValue,
  type AssetRow,
  type AssetTypeValue,
} from '@pennyspring/data';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

import {
  ASSET_CLASSIFICATION_TREE,
  type AssetClassificationTreeNode,
} from '../../constants/assetClassificationTree';
import { useBookStore } from '../../stores/bookStore';

const PICKER_BASE_YEAR = 2026;
const PICKER_BASE_MONTH = 0;

function dayToPickerDate(day?: number): Date | undefined {
  if (!day || day < 1 || day > 31) return undefined;
  return new Date(PICKER_BASE_YEAR, PICKER_BASE_MONTH, day);
}

function formatDayText(day?: number): string {
  return day ? `每月${day}日` : '请选择';
}

function toCascaderOptions(nodes: readonly AssetClassificationTreeNode[]): Array<CascaderOption> {
  return nodes.map(node => ({
    value: node.value,
    labelText: node.label,
    children: node.children ? toCascaderOptions(node.children) : undefined,
  }));
}

function buildPathLookup(options: Array<CascaderOption>): Map<CascaderValue, CascaderValue[]> {
  const result = new Map<CascaderValue, CascaderValue[]>();
  const stack: Array<{ node: CascaderOption; parentPath: CascaderValue[] }> = options.map(
    node => ({ node, parentPath: [] }),
  );
  while (stack.length > 0) {
    const current = stack.pop()!;
    const nextPath = [...current.parentPath, current.node.value];
    result.set(current.node.value, nextPath);
    if (current.node.children && current.node.children.length > 0) {
      stack.push(...current.node.children.map(child => ({ node: child, parentPath: nextPath })));
    }
  }
  return result;
}

const useStyles = createUseSheetStyle(token => ({
  container: { flex: 1, backgroundColor: token.colorBgLayout },
  content: { flex: 1, padding: token.padding },
  groupTitle: {
    fontSize: token.fontSizeSM,
    color: token.colorTextSecondary,
    fontWeight: '600',
    marginTop: token.marginMD,
    marginBottom: token.marginXS,
  },
  group: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    overflow: 'hidden',
  },
  item: {
    paddingVertical: token.paddingSM,
    paddingHorizontal: token.padding,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: { fontSize: token.fontSize, color: token.colorText },
  itemBalance: { fontSize: token.fontSize, color: token.colorText },
  itemBalanceNegative: { color: token.colorError },
  divider: { height: 1, backgroundColor: token.colorBorderSecondary, marginLeft: token.padding },
  panelContent: { padding: token.padding, gap: token.marginMD },
}));

export function AssetManageScreen() {
  const styles = useStyles();
  const { token } = useTheme();
  const toast = useToast();
  const currentBook = useBookStore(state => state.currentBook);

  const { data, loading, refresh } = useRequest(() => api.asset.getAll());

  const cascaderOptions = useMemo(() => toCascaderOptions(ASSET_CLASSIFICATION_TREE), []);
  const pathLookup = useMemo(() => buildPathLookup(cascaderOptions), [cascaderOptions]);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRow | null>(null);
  const [name, setName] = useState('');
  const [assetPath, setAssetPath] = useState<CascaderValue[]>([ASSET_TYPE.capitalAccount, ASSET_CLASSIFICATION.cash]);
  const [balance, setBalance] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [billingDate, setBillingDate] = useState<number | undefined>();
  const [repaymentDate, setRepaymentDate] = useState<number | undefined>();
  const [remark, setRemark] = useState('');
  const [invisible, setInvisible] = useState(false);

  const groupedAssets = useMemo(() => {
    const assets = data ?? [];
    const groups: Record<string, AssetRow[]> = {};
    for (const asset of assets) {
      if (!groups[asset.type]) groups[asset.type] = [];
      groups[asset.type].push(asset);
    }
    return groups;
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

  const openEdit = useCallback((asset: AssetRow) => {
    setEditingAsset(asset);
    setName(asset.name);
    const classificationPath = pathLookup.get(asset.classification);
    const typePath = pathLookup.get(asset.type);
    setAssetPath(classificationPath ?? typePath ?? [ASSET_TYPE.capitalAccount, ASSET_CLASSIFICATION.cash]);
    setBalance((asset.balance / 100).toFixed(2));
    setTotalAmount((asset.totalAmount / 100).toFixed(2));
    setBillingDate(asset.billingDate > 0 ? asset.billingDate : undefined);
    setRepaymentDate(asset.repaymentDate > 0 ? asset.repaymentDate : undefined);
    setRemark(asset.remark);
    setInvisible(asset.invisible === VISIBILITY.hidden);
    setPanelOpen(true);
  }, [pathLookup]);

  const type = assetPath[0] as AssetTypeValue | undefined;
  const classification = assetPath[assetPath.length - 1] as AssetClassificationValue | undefined;
  const isCreditCard = type === ASSET_TYPE.creditCard;

  const handleSave = useCallback(async () => {
    if (!name.trim()) { toast.show({ messageText: '请输入资产名称' }); return; }
    if (!currentBook) { toast.show({ messageText: '未找到当前账本' }); return; }
    if (!type || !classification) { toast.show({ messageText: '请选择资产类型和分类' }); return; }
    try {
      const input = {
        booksId: currentBook.id,
        name: name.trim(),
        balance: Math.round(parseFloat(balance || '0') * 100),
        totalAmount: Math.round(parseFloat(totalAmount || '0') * 100),
        billingDate: billingDate ?? 0,
        repaymentDate: repaymentDate ?? 0,
        type,
        classification,
        invisible: invisible ? VISIBILITY.hidden : VISIBILITY.visible,
        remark,
      };
      if (editingAsset) {
        await api.asset.update({ ...input, id: editingAsset.id });
      } else {
        await api.asset.create(input);
      }
      setPanelOpen(false);
      refresh();
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '保存失败' });
    }
  }, [name, type, classification, balance, totalAmount, billingDate, repaymentDate, remark, invisible, currentBook, editingAsset, refresh, toast]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await api.asset.delete(id);
      refresh();
    } catch (e: unknown) {
      toast.show({ messageText: e instanceof Error ? e.message : '删除失败' });
    }
  }, [refresh, toast]);

  const assetTypes = ASSET_TYPE.options();
  const hasAssets = (data?.length ?? 0) > 0;

  return (
    <Column style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {!hasAssets && !loading ? (
          <Empty />
        ) : (
          assetTypes.map(typeInfo => {
            const assets = groupedAssets[typeInfo.value] ?? [];
            if (assets.length === 0) return null;
            return (
              <Column key={typeInfo.value}>
                <Text style={styles.groupTitle}>{typeInfo.label}</Text>
                <Column style={styles.group}>
                  {assets.map((asset, idx) => (
                    <React.Fragment key={asset.id}>
                      {idx > 0 && <Column style={styles.divider} />}
                      <SwipeAction
                        rightActions={[
                          { key: 'edit', text: '编辑', color: 'primary', onPress: () => openEdit(asset) },
                          { key: 'delete', text: '删除', color: 'danger', onPress: () => handleDelete(asset.id) },
                        ]}
                      >
                        <Row style={styles.item}>
                          <Text style={styles.itemName}>{asset.name}</Text>
                          <Text style={[styles.itemBalance, asset.balance < 0 && styles.itemBalanceNegative]}>
                            ¥ {(asset.balance / 100).toFixed(2)}
                          </Text>
                        </Row>
                      </SwipeAction>
                    </React.Fragment>
                  ))}
                </Column>
              </Column>
            );
          })
        )}
      </ScrollView>

      <FloatingActionGroup actions={[{ key: 'create-asset', icon: 'add', onPress: openCreate }]} />

      <Popup.FloatingPanel
        open={panelOpen}
        onOpenChange={open => { if (!open) setPanelOpen(false); }}
        position="bottom"
      >
        <ScrollView contentContainerStyle={styles.panelContent}>
          <Input placeholder="资产名称" value={name} onChangeText={setName} />
          <Cascader
            options={cascaderOptions}
            value={assetPath}
            tabPlaceholderText="请选择"
            placeholder="资产类型和分类"
            onChange={setAssetPath}
          />
          <Input placeholder="余额(元)" value={balance} onChangeText={setBalance} keyboardType="numeric" />
          {isCreditCard && (
            <>
              <Input placeholder="总额度(元)" value={totalAmount} onChangeText={setTotalAmount} keyboardType="numeric" />
              <DateTimePicker
                precision="day"
                value={dayToPickerDate(billingDate)}
                titleText="选择账单日"
                onOk={(_v, params) => setBillingDate(params.day)}
              >
                <Input placeholder="账单日" value={formatDayText(billingDate)} readonly />
              </DateTimePicker>
              <DateTimePicker
                precision="day"
                value={dayToPickerDate(repaymentDate)}
                titleText="选择还款日"
                onOk={(_v, params) => setRepaymentDate(params.day)}
              >
                <Input placeholder="还款日" value={formatDayText(repaymentDate)} readonly />
              </DateTimePicker>
            </>
          )}
          <Textarea placeholder="备注(可选)" value={remark} onChangeText={setRemark} />
          <Row>
            <Text>隐藏资产</Text>
            <Spacer size={token.marginSM} />
            <Switch value={invisible} onChange={setInvisible} />
          </Row>
          <Button onPress={handleSave}>{editingAsset ? '保存' : '新增'}</Button>
        </ScrollView>
      </Popup.FloatingPanel>
    </Column>
  );
}
