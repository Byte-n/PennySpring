import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { ThemeProvider } from '@pennyspring/theme';
import { DeviceFrameset } from 'react-device-frameset';
import 'react-device-frameset/styles/marvel-devices.min.css';
import { App } from '../index';
import {
  getComponentDemoPreviewsByComponentId,
  getComponentPreviewById,
} from '../../examples/previews/registry';
import { getPreviewDocIntro } from './liveCode';

interface PreviewDocProps {
  id: string;
}

const fullHeightStyle = { height: '100%' } as const;

export function PreviewDocIntro({ id }: PreviewDocProps) {
  const intro = getPreviewDocIntro(id, previewId => {
    const preview = getComponentPreviewById(previewId);

    if (!preview) {
      return undefined;
    }

    return {
      title: preview.title,
      description: preview.description,
    };
  });

  if (!intro) {
    return null;
  }

  return (
    <>
      <h1>{intro.title}</h1>
      <p>{intro.description}</p>
    </>
  );
}

export default function PreviewDoc({ id }: PreviewDocProps) {
  const preview = getComponentPreviewById(id);

  if (!preview) {
    return (
      <div className="preview-doc preview-doc-empty">
        <p>未找到组件预览：{id}</p>
      </div>
    );
  }

  const PreviewComponent = preview.component;
  return <PreviewComponent />;
}

export function PreviewDocs({ id }: PreviewDocProps) {
  const previews = getComponentDemoPreviewsByComponentId(id);

  if (previews.length === 0) {
    return (
      <div className="preview-doc preview-doc-empty">
        <p>未找到组件预览：{id}</p>
      </div>
    );
  }

  return (
    <BrowserOnly fallback={<div className="preview-doc-loading" />}>
      {() => (
        <DeviceFrameset device="iPhone X">
          <ThemeProvider>
            <App style={fullHeightStyle}>
              <div className="preview-doc-screen">
                <div className="preview-doc-safe-area">
                  {previews.map(preview => (
                    <React.Fragment key={preview.id}>
                      <h2>{preview.description}</h2>
                      <PreviewDoc id={preview.id} />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </App>
          </ThemeProvider>
        </DeviceFrameset>
      )}
    </BrowserOnly>
  );
}
