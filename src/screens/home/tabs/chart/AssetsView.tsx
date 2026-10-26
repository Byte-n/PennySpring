import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import { Card, Column, Empty, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import {
  ChartLineUpIcon,
  CreditCardIcon,
  HandCoinsIcon,
  TicketIcon,
  WalletIcon,
} from 'phosphor-react-native';
import type { AssetRow, RecordRow, TypeRow } from '@pennyspring/api';
import { ASSET_TYPE } from '@pennyspring/api';

import {
  buildAssetOverview,
  buildDueReminders,
  buildNetWorthHistory,
  formatBalance,
  formatMoney,
  formatPercent,
  formatSignedPercent,
} from './analysisData';
import type { AssetGroupStat, DueReminder } from './analysisData';
import { ChartCard } from './components/ChartCard';
import { ColorDot } from './components/ColorDot';
import { NetWorthSparkline } from './components/NetWorthSparkline';
import { StackBar } from './components/StackBar';

const HISTORY_MONTHS = 6;
const ACCOUNT_PREVIEW_LIMIT = 5;
const DUE_LIMIT = 2;
const URGENT_DAYS = 3;
const ACCOUNT_ICON_SIZE = 18;
const ACCOUNT_ICON_BOX_SIZE = 32;

interface AssetsViewProps {
  assets: readonly AssetRow[];
  records: readonly RecordRow[];
  types: readonly TypeRow[];
  compareEnabled: boolean;
  now: Date;
  onOpenAssets: () => void;
}

const useStyles = createUseSheetStyle(token => ({
  content: {
    gap: token.marginSM,
  },
  heroDelta: {
    marginTop: token.marginXXS,
  },
  spark: {
    marginTop: token.marginXS,
  },
  split: {
    marginTop: token.marginXS,
    paddingTop: token.marginXS,
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorSplit,
  },
  splitItem: {
    flex: 1,
    gap: token.marginXXS,
  },
  splitDivider: {
    width: token.lineWidth,
    alignSelf: 'stretch',
    backgroundColor: token.colorBorderSecondary,
  },
  groupLabel: {
    marginTop: token.marginXS,
  },
  groupLabelFirst: {
    marginTop: 0,
  },
  legend: {
    marginTop: token.marginXXS,
  },
  legendColumn: {
    flex: 1,
    gap: token.marginXS,
  },
  legendItem: {
    gap: token.marginXXS,
  },
  legendName: {
    flex: 1,
  },
  sectionFooter: {
    marginTop: token.marginXS,
  },
  accountRow: {
    minHeight: token.controlHeight,
    alignItems: 'center',
    gap: token.marginXS,
  },
  accountRowBorder: {
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorSplit,
  },
  accountRowPressed: {
    backgroundColor: token.colorFillQuaternary,
  },
  accountIcon: {
    width: ACCOUNT_ICON_BOX_SIZE,
    height: ACCOUNT_ICON_BOX_SIZE,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.colorFillQuaternary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountMain: {
    flex: 1,
    gap: token.marginXXS,
  },
  accountAmount: {
    alignItems: 'flex-end',
  },
  dueDate: {
    width: token.sizeXXL,
    paddingVertical: token.paddingXXS,
    borderRadius: token.borderRadiusXS,
    alignItems: 'center',
  },
  dueMain: {
    flex: 1,
    gap: token.marginXXS,
  },
  dueAmount: {
    alignItems: 'flex-end',
  },
  footer: {
    marginTop: token.marginXS,
  },
}));

const useDueStyles = createUseSheetStyle(
  (token, { urgent }: { urgent: boolean }) => ({
    dueDate: {
      width: token.sizeXXL,
      paddingVertical: token.paddingXXS,
      borderRadius: token.borderRadiusXS,
      alignItems: 'center',
      backgroundColor: urgent ? token.colorWarningBg : token.colorFillQuaternary,
    },
  }),
);

function getAssetIcon(assetType: AssetRow['type']) {
  if (assetType === ASSET_TYPE.capitalAccount) return WalletIcon;
  if (assetType === ASSET_TYPE.storedValueCard) return TicketIcon;
  if (assetType === ASSET_TYPE.investment) return ChartLineUpIcon;
  if (assetType === ASSET_TYPE.creditCard) return CreditCardIcon;
  return HandCoinsIcon;
}

interface AssetLegendProps {
  groups: readonly AssetGroupStat[];
  colors: readonly string[];
  footer: string;
}

function AssetLegend({ groups, colors, footer }: AssetLegendProps) {
  const styles = useStyles();
  const columns = [groups.slice(0, 2), groups.slice(2, 4)];

  return (
    <>
      <Row gap="large" style={styles.legend}>
        {columns.map((column, columnIndex) => (
          <Column key={`legend-${columnIndex}`} style={styles.legendColumn}>
            {column.map((group, index) => (
              <Row key={group.key} align="center" gap="small" style={styles.legendItem}>
                <ColorDot color={colors[columnIndex * 2 + index]} />
                <Text size="xs" color="secondary" style={styles.legendName}>
                  {group.name}
                </Text>
                <Text size="xs" weight="medium">
                  {formatMoney(group.amount)}
                </Text>
              </Row>
            ))}
          </Column>
        ))}
      </Row>
      <Text size="xs" color="tertiary" style={styles.sectionFooter}>
        {footer}
      </Text>
    </>
  );
}

interface DueRowProps {
  reminder: DueReminder;
}

function DueRow({ reminder }: DueRowProps) {
  const styles = useStyles();
  const dueDate = new Date(reminder.dueDate);
  const urgent = reminder.daysLeft <= URGENT_DAYS;
  const dueStyles = useDueStyles({ urgent });

  return (
    <Row style={styles.accountRow}>
      <Column style={dueStyles.dueDate}>
        <Text
          size="xs"
          weight="semibold"
          color={urgent ? 'warning' : 'secondary'}
        >
          {`${dueDate.getMonth() + 1}/${dueDate.getDate()}`}
        </Text>
        <Text size="xs" color={urgent ? 'warning' : 'tertiary'}>
          {reminder.daysLeft === 0 ? '今天' : `${reminder.daysLeft} 天后`}
        </Text>
      </Column>
      <Column style={styles.dueMain}>
        <Text size="sm" numberOfLines={1}>
          {reminder.asset.name}
        </Text>
        <Text size="xs" color="tertiary" numberOfLines={1}>
          {reminder.asset.type === ASSET_TYPE.creditCard ? '信用卡待还' : '借入债务'}
        </Text>
      </Column>
      <Column style={styles.dueAmount}>
        <Text size="sm" weight="medium" color="error">
          {formatMoney(reminder.amount)}
        </Text>
      </Column>
    </Row>
  );
}

export function AssetsView({
  assets,
  records,
  types,
  compareEnabled,
  now,
  onOpenAssets,
}: AssetsViewProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const overview = useMemo(() => buildAssetOverview(assets), [assets]);
  const history = useMemo(
    () =>
      buildNetWorthHistory(
        assets,
        records,
        types,
        new Date(now.getFullYear(), now.getMonth(), 1),
        HISTORY_MONTHS,
      ),
    [assets, records, types, now],
  );
  const reminders = useMemo(
    () => buildDueReminders(assets, now, DUE_LIMIT),
    [assets, now],
  );

  if (assets.length === 0) {
    return (
      <Card>
        <Empty messageText="还没有资产账户" />
        <Text size="sm" color="tertiary" style={styles.footer}>
          在资产管理中添加账户后，这里会显示净资产、负债与待还提醒。
        </Text>
      </Card>
    );
  }

  const currentNetWorth = history[history.length - 1]?.value ?? overview.netWorth;
  const previousNetWorth = history[history.length - 2]?.value ?? currentNetWorth;
  const netWorthDelta = currentNetWorth - previousNetWorth;
  const netWorthDeltaRatio =
    previousNetWorth > 0 ? currentNetWorth / previousNetWorth - 1 : null;
  const assetColors = [
    token.blue6,
    token.cyan6,
    token.gold6,
    token.purple6,
  ];
  const liabilityColors = [token.colorError, token.colorWarning];
  const previewAccounts = overview.accounts.slice(0, ACCOUNT_PREVIEW_LIMIT);
  const dueTotal = reminders.reduce((sum, reminder) => sum + reminder.amount, 0);

  return (
    <Column style={styles.content}>
      <Card variant="summary">
        <Row align="start" justify="between" gap="normal">
          <Column gap="small">
            <Text size="md" weight="semibold">
              净资产
            </Text>
            <Text size="xs" color="tertiary">
              截至今天 · 可用资金 + 应收债权 − 应还债务
            </Text>
          </Column>
          {compareEnabled ? (
            <Text size="xs" color="tertiary">
              较上月
            </Text>
          ) : null}
        </Row>
        <Text
          size="h2"
          weight="semibold"
          color={currentNetWorth < 0 ? 'error' : 'heading'}
          numberOfLines={1}
          style={styles.heroDelta}
        >
          {formatBalance(currentNetWorth)}
        </Text>
        {compareEnabled ? (
          <Text
            size="xs"
            weight="medium"
            color={netWorthDelta >= 0 ? 'success' : 'error'}
            style={styles.heroDelta}
          >
            {netWorthDelta >= 0 ? '↑' : '↓'} {formatMoney(netWorthDelta)}
            {netWorthDeltaRatio === null
              ? ''
              : ` · ${formatSignedPercent(netWorthDeltaRatio)}`}
          </Text>
        ) : null}
        <Column style={styles.spark}>
          <NetWorthSparkline points={history} />
        </Column>
        <Row style={styles.split}>
          <Column style={styles.splitItem}>
            <Text size="xs" color="tertiary">
              可用资金
            </Text>
            <Text size="xs" weight="medium" numberOfLines={1}>
              {formatMoney(overview.available)}
            </Text>
          </Column>
          <Column style={styles.splitDivider} />
          <Column style={styles.splitItem}>
            <Text size="xs" color="tertiary">
              应收债权
            </Text>
            <Text size="xs" weight="medium" numberOfLines={1}>
              {formatMoney(overview.receivable)}
            </Text>
          </Column>
          <Column style={styles.splitDivider} />
          <Column style={styles.splitItem}>
            <Text size="xs" color="tertiary">
              应还债务
            </Text>
            <Text size="xs" weight="medium" color="error" numberOfLines={1}>
              {formatMoney(overview.debt)}
            </Text>
          </Column>
        </Row>
      </Card>

      <ChartCard
        title="资产与负债"
        subtitle="两条独立堆叠条，不混进同一个饼图"
      >
        <Row align="center" justify="between" style={styles.groupLabelFirst}>
          <Text size="sm" color="secondary">
            资产
          </Text>
          <Text size="sm" weight="semibold">
            {formatMoney(overview.assetsTotal)}
          </Text>
        </Row>
        <StackBar
          segments={overview.assetGroups.map((group, index) => ({
            key: group.key,
            value: group.amount,
            color: assetColors[index],
          }))}
        />
        <AssetLegend
          groups={overview.assetGroups}
          colors={assetColors}
          footer={`净资产 ${formatBalance(overview.netWorth)}`}
        />

        <Row align="center" justify="between" style={styles.groupLabel}>
          <Text size="sm" color="secondary">
            负债
          </Text>
          <Text size="sm" weight="semibold" color="error">
            {formatMoney(overview.liabilitiesTotal)}
          </Text>
        </Row>
        <StackBar
          segments={overview.liabilityGroups.map((group, index) => ({
            key: group.key,
            value: group.amount,
            color: liabilityColors[index],
          }))}
        />
        <AssetLegend
          groups={overview.liabilityGroups}
          colors={liabilityColors}
          footer={`资产负债率 ${formatPercent(overview.debtRatio)}`}
        />
      </ChartCard>

      <ChartCard
        title="账户余额"
        subtitle="点击任一账户进入资产管理"
        extra={
          <Text size="xs" color="tertiary">
            {overview.accounts.length} 个账户
          </Text>
        }
      >
        <Column>
          {previewAccounts.map((account, index) => {
            const IconComponent = getAssetIcon(account.asset.type);
            return (
              <Pressable
                key={account.asset.id}
                onPress={onOpenAssets}
                style={({ pressed }) => [
                  styles.accountRow,
                  index > 0 ? styles.accountRowBorder : null,
                  pressed ? styles.accountRowPressed : null,
                ]}
              >
                <Column style={styles.accountIcon}>
                  <IconComponent
                    color={token.colorTextSecondary}
                    size={ACCOUNT_ICON_SIZE}
                  />
                </Column>
                <Column style={styles.accountMain}>
                  <Text size="sm" numberOfLines={1}>
                    {account.name}
                  </Text>
                  <Text size="xs" color="tertiary" numberOfLines={1}>
                    {account.subtitle}
                  </Text>
                </Column>
                <Column style={styles.accountAmount}>
                  <Text
                    size="sm"
                    weight="medium"
                    color={account.isLiability ? 'error' : 'heading'}
                  >
                    {formatBalance(account.amount)}
                  </Text>
                </Column>
              </Pressable>
            );
          })}
        </Column>
        {overview.accounts.length > ACCOUNT_PREVIEW_LIMIT ? (
          <Text size="xs" color="tertiary" style={styles.sectionFooter}>
            共 {overview.accounts.length} 个账户
          </Text>
        ) : null}
      </ChartCard>

      {reminders.length > 0 ? (
        <ChartCard
          title="待还提醒"
          subtitle="按还款日排序"
          extra={
            <Text size="xs" color="tertiary">
              合计 {formatMoney(dueTotal)}
            </Text>
          }
        >
          <Column>
            {reminders.map(reminder => (
              <DueRow key={reminder.asset.id} reminder={reminder} />
            ))}
          </Column>
        </ChartCard>
      ) : null}
    </Column>
  );
}
