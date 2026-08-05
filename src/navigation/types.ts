import type { BOOK_SELECT_ROUTES, ROOT_ROUTES } from './routes';
import type {
  AddRecordPresetPayload,
  AddRecordTemplatePayload,
} from '../screens/addRecord/AddRecordContext';

export type RootStackParamList = {
  [ROOT_ROUTES.Home]: undefined;
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
  [ROOT_ROUTES.TypeManage]: undefined;
  [ROOT_ROUTES.AssetManage]: undefined;
  [ROOT_ROUTES.IconPreview]: undefined;
};

export type BookSelectStackParamList = {
  [BOOK_SELECT_ROUTES.BookSelect]: undefined;
};
