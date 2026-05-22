import React from 'react';
import * as RN from 'react-native';
import * as Theme from '@pennyspring/theme';
import * as UI from '../index';
import PreviewDoc from './PreviewDoc';

const ReactLiveScope: Record<string, unknown> = {
  React,
  ...React,
  ...RN,
  ...Theme,
  ...UI,
  PreviewDoc,
};

export default ReactLiveScope;
