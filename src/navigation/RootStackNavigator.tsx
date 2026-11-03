import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createUseSheetStyle, ThemePreview, useTheme } from '@pennyspring/ui';

import { AddRecordScreen } from '../screens/addRecord/AddRecordScreen';
import { AboutScreen } from '../screens/about/AboutScreen';
import { AgentSettingsScreen } from '../screens/agentSettings/AgentSettingsScreen';
import { AssetManageScreen } from '../screens/assetManage/AssetManageScreen';
import { BackupAiConfigScreen } from '../screens/backup/BackupAiConfigScreen';
import { BackupAutoScreen } from '../screens/backup/BackupAutoScreen';
import { BackupExportScreen } from '../screens/backup/BackupExportScreen';
import { BackupHomeScreen } from '../screens/backup/BackupHomeScreen';
import { BackupImportScreen } from '../screens/backup/BackupImportScreen';
import { BackupLanScreen } from '../screens/backup/BackupLanScreen';
import { BackupSettingsScreen } from '../screens/backup/BackupSettingsScreen';
import { BookManageScreen } from '../screens/bookManage/BookManageScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { IconPreviewScreen } from '../screens/iconPreview';
import { QuickBookSettingsScreen } from '../screens/quickBook/QuickBookSettingsScreen';
import { SessionManageScreen } from '../screens/sessionManage/SessionManageScreen';
import { TestScreen } from '../screens/test';
import { TagManageScreen } from '../screens/tagManage/TagManageScreen';
import { TypeManageScreen } from '../screens/typeManage/TypeManageScreen';
import { ROOT_ROUTES } from './routes';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const useStyles = createUseSheetStyle(token => ({
  header: {
    backgroundColor: token.colorBgContainer,
  },
  headerTitle: {
    fontSize: token.fontSizeLG,
  },
}));

export function RootStackNavigator() {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: token.colorText,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        component={HomeScreen}
        name={ROOT_ROUTES.Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={AboutScreen}
        name={ROOT_ROUTES.About}
        options={{ title: '关于' }}
      />
      <Stack.Screen
        component={AddRecordScreen}
        name={ROOT_ROUTES.AddRecord}
        options={({ route }) => ({
          title: route.params?.template
            ? route.params?.templatePayload
              ? '编辑模板'
              : '新增模板'
            : route.params?.recordId !== undefined
              ? '编辑记录'
              : '新增记录',
        })}
      />
      <Stack.Screen
        component={ThemePreview}
        name={ROOT_ROUTES.ThemePreview}
        options={{ title: '主题预览' }}
      />
      <Stack.Screen
        component={TestScreen}
        name={ROOT_ROUTES.Test}
        options={{ title: '测试页' }}
      />
      <Stack.Screen
        component={BookManageScreen}
        name={ROOT_ROUTES.BookManage}
        options={{ title: '账本' }}
      />
      <Stack.Screen
        component={TagManageScreen}
        name={ROOT_ROUTES.TagManage}
        options={{ title: '标签管理' }}
      />
      <Stack.Screen
        component={SessionManageScreen}
        name={ROOT_ROUTES.SessionManage}
        options={{ title: '会话管理' }}
      />
      <Stack.Screen
        component={TypeManageScreen}
        name={ROOT_ROUTES.TypeManage}
        options={{ title: '类型管理' }}
      />
      <Stack.Screen
        component={AssetManageScreen}
        name={ROOT_ROUTES.AssetManage}
        options={{ title: '资产管理' }}
      />
      <Stack.Screen
        component={IconPreviewScreen}
        name={ROOT_ROUTES.IconPreview}
        options={{ title: '图标预览' }}
      />
      <Stack.Screen
        component={AgentSettingsScreen}
        name={ROOT_ROUTES.AgentSettings}
        options={{ title: 'AI 提供商' }}
      />
      <Stack.Screen
        component={QuickBookSettingsScreen}
        name={ROOT_ROUTES.QuickBookSettings}
        options={{ title: 'AI 记账' }}
      />
      <Stack.Screen
        component={BackupHomeScreen}
        name={ROOT_ROUTES.Backup}
        options={{ title: '备份与迁移' }}
      />
      <Stack.Screen
        component={BackupExportScreen}
        name={ROOT_ROUTES.BackupExport}
        options={{ title: '导出账本' }}
      />
      <Stack.Screen
        component={BackupImportScreen}
        name={ROOT_ROUTES.BackupImport}
        options={{ title: '导入备份' }}
      />
      <Stack.Screen
        component={BackupAutoScreen}
        name={ROOT_ROUTES.BackupAuto}
        options={{ title: '自动备份' }}
      />
      <Stack.Screen
        component={BackupAiConfigScreen}
        name={ROOT_ROUTES.BackupAiConfig}
        options={{ title: 'AI 配置包' }}
      />
      <Stack.Screen
        component={BackupSettingsScreen}
        name={ROOT_ROUTES.BackupSettings}
        options={{ title: '设置包' }}
      />
      <Stack.Screen
        component={BackupLanScreen}
        name={ROOT_ROUTES.BackupLan}
        options={{ title: '局域网传输' }}
      />
      <Stack.Screen
        component={BackupLanScreen}
        name={ROOT_ROUTES.BackupLanSend}
        options={{ title: '局域网传输' }}
      />
      <Stack.Screen
        component={BackupLanScreen}
        name={ROOT_ROUTES.BackupLanReceive}
        options={{ title: '局域网传输' }}
      />
    </Stack.Navigator>
  );
}
