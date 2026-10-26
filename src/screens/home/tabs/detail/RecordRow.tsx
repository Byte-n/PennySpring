import React from 'react';
import { Pressable } from 'react-native';
import { Icon, Row, Column, Text } from '@pennyspring/ui';
import { useTheme, createUseSheetStyle } from '@pennyspring/theme';
import { getPhosphorIconComponent } from '../../../../constants/typeIconTree';
import {
  amountColor,
  formatAmountParts,
  type DetailRecordView,
} from './detailData';

const useStyles = createUseSheetStyle((token, { isIncome, isTransfer }: { isIncome: boolean; isTransfer: boolean }) => ({
  root: {
    paddingVertical: token.paddingSM,
    paddingHorizontal: token.padding,
  },
  info: {
    flex: 1,
  },
  iconBox: {
    width: token.controlHeightSM + token.paddingXXS,
    height: token.controlHeightSM + token.paddingXXS,
    borderRadius: token.borderRadius,
    backgroundColor: isIncome ? token.colorSuccessBg : isTransfer ? token.colorPrimaryBg : token.colorFillTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

interface RecordRowProps {
  view: DetailRecordView;
  onPress: (view: DetailRecordView) => void;
  hidden?: boolean;
}

export function RecordRow({ view, onPress, hidden = false }: RecordRowProps) {
  const isIncome = view.category === 'income';
  const isTransfer = view.category === 'transfer';
  const styles = useStyles({ isIncome, isTransfer });
  const { token } = useTheme();
  const IconComponent = view.iconValue
    ? getPhosphorIconComponent(view.iconValue)
    : null;
  const metaParts = [view.record.remark, view.assetName, ...view.tags.map(tag => `#${tag.name}`)];
  const parts = formatAmountParts(view.finalAmount);

  return (
    <Pressable style={styles.root} onPress={() => onPress(view)}>
      <Row align="center" gap="normal">
      <Column align="center" justify="center" style={styles.iconBox}>
          {IconComponent ? (
            <IconComponent
              color={isIncome ? token.colorSuccess : isTransfer ? token.colorPrimary : token.colorTextSecondary}
              size={token.fontSizeLG}
            />
          ) : null}
        </Column>
        <Column gap="small" style={styles.info}>
          <Text size="md" weight="medium" color="heading" numberOfLines={1} ellipsizeMode="tail">{view.typeName}</Text>
          {metaParts.length > 0 || view.imageCount > 0 ? (
            <Row align="center" gap="small">
              <Text size="sm" color="tertiary" numberOfLines={1} ellipsizeMode="tail">
                {metaParts.join(' · ')}
              </Text>
              {view.imageCount > 0 ? <Icon icon="image" size="small" color="tertiary" /> : null}
            </Row>
          ) : null}
        </Column>
        <Text size="lg" weight="semibold" color={amountColor(view.category)}>
          {hidden ? '••••' : <>{view.category === 'income' ? '+' : view.category === 'expense' ? '-' : ''}{parts.integer}<Text size="sm" weight="semibold" color={amountColor(view.category)}>.{parts.decimal}</Text></>}
        </Text>
      </Row>
    </Pressable>
  );
}
