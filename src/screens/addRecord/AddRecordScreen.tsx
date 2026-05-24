import React from 'react';
import { AddRecordProvider } from './AddRecordContext';
import {
  KeyboardAwareScreen,
  type TabScreen,
  TopTabNavigator,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { ExpenseTabScreen } from './tabs/ExpenseTabScreen.tsx';
import { IncomeTabScreen } from './tabs/IncomeTabScreen.tsx';
import { TransferTabScreen } from './tabs/TransferTabScreen.tsx';

export function AddRecordScreen() {
  const styles = useStyles();
  return (
    <AddRecordProvider>
      <KeyboardAwareScreen>
        <TopTabNavigator
          screens={ADD_RECORD_TAB_SCREENS}
          styles={{
            sceneContainer: styles.sceneContainer,
          }}
        />
      </KeyboardAwareScreen>
    </AddRecordProvider>
  );
}

const ADD_RECORD_TAB_SCREENS: readonly TabScreen[] = [
  {
    name: 'ExpenseTab',
    label: '支出',
    component: ExpenseTabScreen,
  },
  {
    name: 'IncomeTab',
    label: '收入',
    component: IncomeTabScreen,
  },
  {
    name: 'TransferTab',
    label: '转账',
    component: TransferTabScreen,
  },
];

const useStyles = createUseSheetStyle(token => ({
  sceneContainer: {
    paddingHorizontal: token.paddingContentHorizontal,
  },
}));
