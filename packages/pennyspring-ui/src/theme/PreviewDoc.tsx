import React from 'react';
import { ScrollView, View } from 'react-native';
import { ThemeProvider } from '@pennyspring/theme';
import { App, Text } from '../index';
import { getComponentPreviewById } from '../../examples/previews/registry';

interface PreviewDocProps {
  id: string;
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

  return (
    <div className="preview-doc">
      <div className="preview-doc-meta">
        <h2>{preview.title}</h2>
        <p>{preview.description}</p>
      </div>
      <div className="preview-doc-device">
        <ThemeProvider>
          <App>
            <ScrollView>
              <View>
                <Text size="lg" weight="strong">
                  {preview.title}
                </Text>
                <PreviewComponent />
              </View>
            </ScrollView>
          </App>
        </ThemeProvider>
      </div>
    </div>
  );
}
