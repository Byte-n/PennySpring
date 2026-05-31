import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import { Card, Column, Empty, Row, Spacer, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { formatAmount } from '../detail/detailData';
import {
  toBarStats,
  toPieStats,
  type ExpenseAnalysis,
  type ExpenseCategoryStat,
} from './chartData';
import { buildBarOption, buildPieOption, formatPercent } from './chartOptions';
import { EChart } from './EChart';

const PIE_HEIGHT = 240;
const BAR_HEIGHT = 280;

const useStyles = createUseSheetStyle(() => ({
  link: {
    flexDirection: 'row',
  },
}));

interface ExpenseAnalysisSectionProps {
  analysis: ExpenseAnalysis;
  selectedParentTypeId: number | null;
  onEnter: (typeId: number) => void;
  onBack: () => void;
}

export function ExpenseAnalysisSection({
  analysis,
  selectedParentTypeId,
  onEnter,
  onBack,
}: ExpenseAnalysisSectionProps) {
  const styles = useStyles();
  const { token } = useTheme();

  const pieStats = useMemo(() => toPieStats(analysis.stats), [analysis.stats]);
  const barStats = useMemo(() => toBarStats(analysis.stats), [analysis.stats]);
  const pieOption = useMemo(
    () => buildPieOption(pieStats, token),
    [pieStats, token],
  );
  const barOption = useMemo(
    () => buildBarOption(barStats, token),
    [barStats, token],
  );

  const handleClick = (stats: readonly ExpenseCategoryStat[]) => (
    dataIndex: number,
  ) => {
    if (selectedParentTypeId !== null) return;
    const stat = stats[dataIndex];
    if (!stat || stat.level !== 1 || stat.typeId === null) return;
    if (stat.key === 'other' || stat.virtual) return;
    onEnter(stat.typeId);
  };

  return (
    <Card titleText="支出分析">
      <Column gap="normal">
        <Row align="center" gap="small">
          <Pressable style={styles.link} onPress={onBack}>
            <Text size="md" color={selectedParentTypeId === null ? 'heading' : 'link'}>
              全部支出
            </Text>
          </Pressable>
          {selectedParentTypeId !== null && (
            <>
              <Text size="md" color="tertiary">
                ＞
              </Text>
              <Text size="md" color="heading">
                {analysis.selectedName ?? ''}
              </Text>
              <Spacer />
              <Pressable onPress={onBack}>
                <Text size="md" color="link">
                  返回上级
                </Text>
              </Pressable>
            </>
          )}
        </Row>

        {selectedParentTypeId !== null && analysis.selectedName && (
          <Text size="sm" color="secondary">
            {`${analysis.selectedName}  ¥${formatAmount(analysis.selectedAmount)}，占本月支出 ${formatPercent(
              analysis.totalExpense === 0
                ? 0
                : analysis.selectedAmount / analysis.totalExpense,
            )}`}
          </Text>
        )}

        {analysis.stats.length === 0 ? (
          <Empty
            messageText={
              selectedParentTypeId === null ? '本月暂无支出' : '该分类暂无细分支出'
            }
          />
        ) : (
          <Column gap="normal">
            <EChart
              option={pieOption}
              height={PIE_HEIGHT}
              onItemClick={handleClick(pieStats)}
            />
            <EChart
              option={barOption}
              height={BAR_HEIGHT}
              onItemClick={handleClick(barStats)}
            />
          </Column>
        )}
      </Column>
    </Card>
  );
}
