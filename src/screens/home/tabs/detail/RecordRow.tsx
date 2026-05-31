import React from 'react';
import { Pressable } from 'react-native';
import { Row, Column, Text } from '@pennyspring/ui';
import { useTheme, createUseSheetStyle } from '@pennyspring/theme';
import { getPhosphorIconComponent } from '../../../../constants/typeIconTree';
import {
  amountColor,
  formatSignedAmount,
  type DetailRecordView,
} from './detailData';

const ICON_BOX_DIVISOR = 2;
const ICON_SIZE_RATIO = 0.55;

const useStyles = createUseSheetStyle(token => ({
  root: {
    paddingVertical: token.paddingSM / ICON_BOX_DIVISOR,
  },
  info: {
    flex: 1,
  },
  iconBox: {
    width: token.controlHeight,
    height: token.controlHeight,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorFillTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

interface RecordRowProps {
  view: DetailRecordView;
  onPress: (view: DetailRecordView) => void;
}

export function RecordRow({ view, onPress }: RecordRowProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const IconComponent = view.iconValue
    ? getPhosphorIconComponent(view.iconValue)
    : null;
  const subtitle = view.assetName
    ? `${view.typeName} · ${view.assetName}`
    : view.typeName;

  return (
    <Pressable style={styles.root} onPress={() => onPress(view)}>
      <Row align="center" gap="normal">
        <Column align="center" justify="center" style={styles.iconBox}>
          {IconComponent ? (
            <IconComponent
              color={token.colorTextSecondary}
              size={token.controlHeight * ICON_SIZE_RATIO}
            />
          ) : null}
        </Column>
        <Column gap="small" style={styles.info}>
          <Text size="md" weight="medium" color="heading">
            {view.typeName}
          </Text>
          <Text size="sm" color="tertiary">
            {subtitle}
          </Text>
        </Column>
        <Text size="lg" weight="medium" color={amountColor(view.category)}>
          {formatSignedAmount(view.finalAmount, view.category)}
        </Text>
      </Row>
    </Pressable>
  );
}
