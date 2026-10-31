import React from 'react';
import type { ReactNode } from 'react';
import { Card, Column, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  titleArea: {
    flex: 1,
  },
  body: {
    marginTop: token.marginSM,
  },
}));

interface ChartCardProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
  children: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  extra,
  children,
}: ChartCardProps) {
  const { token } = useTheme();
  const styles = useStyles();

  return (
    <Card>
      <Column>
        <Row align="start" justify="between" gap="normal">
          <Column style={styles.titleArea} gap={token.marginXXS}>
            <Text size="md" weight="semibold">
              {title}
            </Text>
            {subtitle ? (
              <Text size="xs" color="tertiary">
                {subtitle}
              </Text>
            ) : null}
          </Column>
          {extra}
        </Row>
        <Column style={styles.body}>{children}</Column>
      </Column>
    </Card>
  );
}
