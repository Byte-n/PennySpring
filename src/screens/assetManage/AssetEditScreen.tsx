import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useRequest } from 'ahooks';
import {
  Button,
  Cascader,
  Column,
  DateTimePicker,
  Input,
  Row,
  Spacer,
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
  type AssetTypeValue,
} from '@pennyspring/data';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

import {
  ASSET_CLASSIFICATION_TREE,
  type AssetClassificationTreeNode,
} from '../../constants/assetClassificationTree';
import { useNavigation, type RootStackParamList } from '../../navigation';
import { useBookStore } from '../../stores/bookStore';

type AssetEditRouteProp = RouteProp<RootStackParamList, 'AssetEdit'>;

const PICKER_BASE_YEAR = 2026;
const PICKER_BASE_MONTH = 0;

function dayToPickerDate(day?: number): Date | undefined {
  if (!day || day < 1 || day > 31) {
    return undefined;
  }

  return new Date(PICKER_BASE_YEAR, PICKER_BASE_MONTH, day);
}

function formatDayText(day?: number): string {
  return day ? `每月${day}日` : '请选择';
}

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    backgroundColor: token.colorBgLayout,
  },
  content: {
    flex: 1,
    padding: token.padding,
  },
  section: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    padding: token.padding,
    gap: token.marginMD,
  },
  footer: {
    padding: token.padding,
    backgroundColor: token.colorBgContainer,
  },
}));

function toCascaderOptions(
  nodes: readonly AssetClassificationTreeNode[],
): Array<CascaderOption> {
  return nodes.map(node => ({
    value: node.value,
    labelText: node.label,
    children: node.children ? toCascaderOptions(node.children) : undefined,
  }));
}

function buildPathLookup(options: Array<CascaderOption>): Map<CascaderValue, CascaderValue[]> {
  const result = new Map<CascaderValue, CascaderValue[]>();
  const stack: Array<{ node: CascaderOption; parentPath: CascaderValue[] }> = options.map(
    node => ({
      node,
      parentPath: [],
    }),
  );

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

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

export function AssetEditScreen() {
  const styles = useStyles();
  const { token } = useTheme();
  const toast = useToast();
  const navigation = useNavigation();
  const route = useRoute<AssetEditRouteProp>();
  const currentBook = useBookStore(state => state.currentBook);

  const assetId = route.params?.assetId;
  const isEditMode = assetId !== undefined;

  const cascaderOptions = useMemo(
    () => toCascaderOptions(ASSET_CLASSIFICATION_TREE),
    [],
  );
  const pathLookup = useMemo(() => buildPathLookup(cascaderOptions), [cascaderOptions]);
  const [name, setName] = useState('');
  const [assetPath, setAssetPath] = useState<CascaderValue[]>([
    ASSET_TYPE.capitalAccount,
    ASSET_CLASSIFICATION.cash,
  ]);
  const [balance, setBalance] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [billingDate, setBillingDate] = useState<number | undefined>(undefined);
  const [repaymentDate, setRepaymentDate] = useState<number | undefined>(undefined);
  const [remark, setRemark] = useState('');
  const [invisible, setInvisible] = useState(false);

  const { data: existingAsset, loading } = useRequest(
    async () => {
      if (!isEditMode) return null;
      const allAssets = await api.asset.getAll();
      return allAssets.find(a => a.id === assetId) ?? null;
    },
    { refreshDeps: [assetId] },
  );

  useEffect(() => {
    if (!existingAsset) {
      return;
    }

    setName(existingAsset.name);
    const classificationPath = pathLookup.get(existingAsset.classification);
    const typePath = pathLookup.get(existingAsset.type);
    setAssetPath(
      classificationPath ?? typePath ?? [ASSET_TYPE.capitalAccount, ASSET_CLASSIFICATION.cash],
    );
    setBalance((existingAsset.balance / 100).toFixed(2));
    setTotalAmount((existingAsset.totalAmount / 100).toFixed(2));
    setBillingDate(existingAsset.billingDate > 0 ? existingAsset.billingDate : undefined);
    setRepaymentDate(existingAsset.repaymentDate > 0 ? existingAsset.repaymentDate : undefined);
    setRemark(existingAsset.remark);
    setInvisible(existingAsset.invisible === VISIBILITY.hidden);
  }, [existingAsset, pathLookup]);

  const type = assetPath[0] as AssetTypeValue | undefined;
  const classification = assetPath[assetPath.length - 1] as
    | AssetClassificationValue
    | undefined;
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
      const balanceCents = Math.round(parseFloat(balance || '0') * 100);
      const totalAmountCents = Math.round(parseFloat(totalAmount || '0') * 100);
      const billingDateNum = billingDate ?? 0;
      const repaymentDateNum = repaymentDate ?? 0;

      const input = {
        booksId: currentBook.id,
        name: name.trim(),
        balance: balanceCents,
        totalAmount: totalAmountCents,
        billingDate: billingDateNum,
        repaymentDate: repaymentDateNum,
        type,
        classification,
        invisible: invisible ? VISIBILITY.hidden : VISIBILITY.visible,
        remark,
      };

      if (isEditMode) {
        await api.asset.update({ ...input, id: assetId });
      } else {
        await api.asset.create(input);
      }

      navigation.goBack();
    } catch (error) {
      toast.show({
        messageText: error instanceof Error ? error.message : '保存失败',
      });
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
    isEditMode,
    assetId,
    navigation,
    toast,
  ]);

  const isCreditCard = type === ASSET_TYPE.creditCard;

  if (isEditMode && loading) {
    return <Column style={styles.container} />;
  }

  return (
    <Column style={styles.container}>
      <ScrollView style={styles.content}>
        <Column style={styles.section}>
          <Input placeholder="资产名称" value={name} onChangeText={setName} />

          <Cascader
            options={cascaderOptions}
            value={assetPath}
            tabPlaceholderText="请选择"
            placeholder="请选择资产类型和分类"
            onChange={setAssetPath}
          />

          <Input
            placeholder="余额(元)"
            value={balance}
            onChangeText={setBalance}
            keyboardType="numeric"
          />

          {isCreditCard && (
            <>
              <Input
                placeholder="总额度(元)"
                value={totalAmount}
                onChangeText={setTotalAmount}
                keyboardType="numeric"
              />
              <DateTimePicker
                precision="day"
                value={dayToPickerDate(billingDate)}
                titleText="选择账单日"
                onOk={(_value, params) => {
                  setBillingDate(params.day);
                }}
              >
                <Input
                  placeholder="账单日"
                  value={formatDayText(billingDate)}
                  readonly
                />
              </DateTimePicker>
              <DateTimePicker
                precision="day"
                value={dayToPickerDate(repaymentDate)}
                titleText="选择还款日"
                onOk={(_value, params) => {
                  setRepaymentDate(params.day);
                }}
              >
                <Input
                  placeholder="还款日"
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
            <Spacer size={token.marginSM} />
            <Switch value={invisible} onChange={setInvisible} />
          </Row>
        </Column>
      </ScrollView>

      <Column style={styles.footer}>
        <Button onPress={handleSave}>保存</Button>
      </Column>
    </Column>
  );
}
