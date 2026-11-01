import React from 'react';
import { Pressable } from 'react-native';
import { Row, Column, Text } from '@pennyspring/ui';
import { useTheme, createUseSheetStyle } from '@pennyspring/ui';
import { getPhosphorIconComponent } from '../../../../constants/typeIconTree';
import {
  amountColor,
  formatAmountParts,
  formatRecordDateParts,
  type DetailListItem,
} from './detailData';

const useStyles = createUseSheetStyle(
  (
    token,
    { isIncome, isTransfer }: { isIncome: boolean; isTransfer: boolean },
  ) => ({
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
      backgroundColor: isIncome
        ? token.colorSuccessBg
        : isTransfer
          ? token.colorPrimaryBg
          : token.colorFillTertiary,
    },
    assetName: {
      maxWidth: token.sizeXXL * 2,
    },
    transferAssetName: {
      maxWidth: token.sizeXXL * 3,
    },
  }),
);

interface RecordRowProps {
  view: DetailListItem;
  onPress: (recordId: number) => void;
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
  const metaParts = view.tags.map(tag => `#${tag.name}`);
  const parts = formatAmountParts(view.finalAmount);
  const time = formatRecordDateParts(view.recordTime).time;

  return (
    <Pressable style={styles.root} onPress={() => onPress(view.record.id)}>
      <Row align="center" gap="normal">
        <Column align="center" justify="center" style={styles.iconBox}>
          {IconComponent ? (
            <IconComponent
              color={
                isIncome
                  ? token.colorSuccess
                  : isTransfer
                    ? token.colorPrimary
                    : token.colorTextSecondary
              }
              size={token.fontSizeLG}
            />
          ) : null}
        </Column>
        <Column gap="small" style={styles.info}>
          <Text
            size="md"
            weight="medium"
            color="heading"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {view.typeName}
          </Text>
          <Text
            size="sm"
            color="tertiary"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {[time, ...metaParts].filter(Boolean).join(' · ')}
          </Text>
        </Column>
        <Column align="end" gap="small">
          <Text
            size="lg"
            weight="semibold"
            color={amountColor(view.category)}
            numberOfLines={1}
          >
            {hidden ? (
              '••••'
            ) : (
              <>
                {view.category === 'income'
                  ? '+'
                  : view.category === 'expense'
                    ? '-'
                    : ''}
                {parts.integer}
                <Text
                  size="sm"
                  weight="semibold"
                  color={amountColor(view.category)}
                >
                  .{parts.decimal}
                </Text>
              </>
            )}
          </Text>
          {isTransfer && (view.assetName || view.intoAssetName) ? (
            <Text
              size="xs"
              color="tertiary"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.transferAssetName}
            >
              {view.assetName} -&gt; {view.intoAssetName}
            </Text>
          ) : view.assetName ? (
            <Text
              size="xs"
              color="tertiary"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.assetName}
            >
              {view.assetName}
            </Text>
          ) : null}
        </Column>
      </Row>
    </Pressable>
  );
}
