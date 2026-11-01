import type { BOOK_SELECT_ROUTES, ROOT_ROUTES } from './routes';
import type {
  AddRecordPresetPayload,
  AddRecordTemplatePayload,
} from '../screens/addRecord/AddRecordContext';

export type RootStackParamList = {
  [ROOT_ROUTES.Home]: undefined;
  [ROOT_ROUTES.About]: undefined;
  [ROOT_ROUTES.AddRecord]:
    | {
        recordId?: number;
        preset?: AddRecordPresetPayload;
        template?: boolean;
        templatePayload?: AddRecordTemplatePayload;
      }
    | undefined;
  [ROOT_ROUTES.Test]: undefined;
  [ROOT_ROUTES.ThemePreview]: undefined;
  [ROOT_ROUTES.BookManage]: undefined;
  [ROOT_ROUTES.TagManage]: undefined;
  [ROOT_ROUTES.SessionManage]: undefined;
  [ROOT_ROUTES.TypeManage]: undefined;
  [ROOT_ROUTES.AssetManage]: undefined;
  [ROOT_ROUTES.IconPreview]: undefined;
  [ROOT_ROUTES.AgentSettings]: undefined;
  [ROOT_ROUTES.QuickBookSettings]: undefined;
  [ROOT_ROUTES.Backup]: undefined;
  [ROOT_ROUTES.BackupExport]: undefined;
  [ROOT_ROUTES.BackupImport]: undefined;
  [ROOT_ROUTES.BackupAuto]: undefined;
  [ROOT_ROUTES.BackupAiConfig]: undefined;
  [ROOT_ROUTES.BackupSettings]: undefined;
  [ROOT_ROUTES.BackupLanSend]: undefined;
  [ROOT_ROUTES.BackupLanReceive]: undefined;
};

export type BookSelectStackParamList = {
  [BOOK_SELECT_ROUTES.BookSelect]: undefined;
};
