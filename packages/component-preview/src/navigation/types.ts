import type { COMPONENT_PREVIEW_ROUTES } from './routes';
import type { ComponentPreviewId } from '../previews/types';

export type ComponentPreviewStackParamList = {
  [COMPONENT_PREVIEW_ROUTES.ComponentList]: undefined;
  [COMPONENT_PREVIEW_ROUTES.ComponentDetail]: {
    previewId: ComponentPreviewId;
  };
};
