import React from 'react';
import { AddRecordTabsNavigator } from '../../navigation';
import { AddRecordProvider } from './AddRecordContext';

export function AddRecordScreen() {
  return (
    <AddRecordProvider>
      <AddRecordTabsNavigator />
    </AddRecordProvider>
  );
}
