import type { ROOT_ROUTES } from './routes';

export type RootStackParamList = {
  [ROOT_ROUTES.Home]: undefined;
  [ROOT_ROUTES.AddRecord]: { recordId?: number } | undefined;
  [ROOT_ROUTES.Test]: undefined;
  [ROOT_ROUTES.ThemePreview]: undefined;
  [ROOT_ROUTES.BookManage]: undefined;
  [ROOT_ROUTES.TagManage]: undefined;
  [ROOT_ROUTES.TypeManage]: undefined;
  [ROOT_ROUTES.AssetManage]: undefined;
  [ROOT_ROUTES.IconPreview]: undefined;
};
