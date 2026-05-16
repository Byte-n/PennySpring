import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useRequest } from 'ahooks';
import {
  Button,
  Column,
  Input,
  ListItem,
  Picker,
  Row,
  Spacer,
  Switch,
  Text,
  Textarea,
  useToast,
  type PickerOkParams,
  type PickerValue,
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

import { useNavigation, type RootStackParamList } from '../../navigation';
import { useBookStore } from '../../stores/bookStore';

type AssetEditRouteProp = RouteProp<RootStackParamList, 'AssetEdit'>;

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

export function AssetEditScreen() {
  const styles = useStyles();
  const { token } = useTheme();
  const toast = useToast();
  const navigation = useNavigation();
  const route = useRoute<AssetEditRouteProp>();
  const currentBook = useBookStore(state => state.currentBook);

  const assetId = route.params?.assetId;
  const isEditMode = assetId !== undefined;

  const [name, setName] = useState('');
  const [type, setType] = useState<AssetTypeValue>(ASSET_TYPE.capitalAccount);
  const [classification, setClassification] = useState<AssetClassificationValue>(
    ASSET_CLASSIFICATION.cash,
  );
  const [balance, setBalance] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [billingDate, setBillingDate] = useState('');
  const [repaymentDate, setRepaymentDate] = useState('');
  const [remark, setRemark] = useState('');
  const [invisible, setInvisible] = useState(false);

  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [classificationPickerOpen, setClassificationPickerOpen] = useState(false);

  const { data: existingAsset, loading } = useRequest(
    async () => {
      if (!isEditMode) return null;
      const allAssets = await api.asset.getAll();
      return allAssets.find(a => a.id === assetId) ?? null;
    },
    { refreshDeps: [assetId] },
  );

  useEffect(() => {
    if (existingAsset) {
      setName(existingAsset.name);
      setType(existingAsset.type);
      setClassification(existingAsset.classification);
      setBalance((existingAsset.balance / 100).toFixed(2));
      setTotalAmount((existingAsset.totalAmount / 100).toFixed(2));
      setBillingDate(existingAsset.billingDate > 0 ? String(existingAsset.billingDate) : '');
      setRepaymentDate(
        existingAsset.repaymentDate > 0 ? String(existingAsset.repaymentDate) : '',
      );
      setRemark(existingAsset.remark);
      setInvisible(existingAsset.invisible === VISIBILITY.hidden);
    }
  }, [existingAsset]);

  const typeOptions = ASSET_TYPE.options().map(item => ({
    value: item.value,
    labelText: item.label,
  }));

  const classificationOptions = ASSET_CLASSIFICATION.options().map(item => ({
    value: item.value,
    labelText: item.label,
  }));

  const selectedTypeLabel = ASSET_TYPE.label(type);
  const selectedClassificationLabel = ASSET_CLASSIFICATION.label(classification);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.show({ messageText: '请输入资产名称' });
      return;
    }

    if (!currentBook) {
      toast.show({ messageText: '未找到当前账本' });
      return;
    }

    try {
      const balanceCents = Math.round(parseFloat(balance || '0') * 100);
      const totalAmountCents = Math.round(parseFloat(totalAmount || '0') * 100);
      const billingDateNum = parseInt(billingDate || '0', 10);
      const repaymentDateNum = parseInt(repaymentDate || '0', 10);

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

          <ListItem
            titleText="资产类型"
            right={<Text>{selectedTypeLabel}</Text>}
            onPress={() => setTypePickerOpen(true)}
          />

          <ListItem
            titleText="资产分类"
            right={<Text>{selectedClassificationLabel}</Text>}
            onPress={() => setClassificationPickerOpen(true)}
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
              <Input
                placeholder="账单日(1-31)"
                value={billingDate}
                onChangeText={setBillingDate}
                keyboardType="numeric"
              />
              <Input
                placeholder="还款日(1-31)"
                value={repaymentDate}
                onChangeText={setRepaymentDate}
                keyboardType="numeric"
              />
            </>
          )}

          <Textarea placeholder="备注(可选)" value={remark} onChangeText={setRemark} />

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

      <Picker
        open={typePickerOpen}
        onOpenChange={(open: boolean) => setTypePickerOpen(open)}
        columns={[typeOptions]}
        value={[type]}
        onOk={(values: PickerValue[], _params: PickerOkParams) => {
          if (values[0]) {
            setType(values[0] as AssetTypeValue);
          }
        }}
        titleText="选择资产类型"
      />

      <Picker
        open={classificationPickerOpen}
        onOpenChange={(open: boolean) => setClassificationPickerOpen(open)}
        columns={[classificationOptions]}
        value={[classification]}
        onOk={(values: PickerValue[], _params: PickerOkParams) => {
          if (values[0]) {
            setClassification(values[0] as AssetClassificationValue);
          }
        }}
        titleText="选择资产分类"
      />
    </Column>
  );
}
