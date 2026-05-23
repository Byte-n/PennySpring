import React from 'react';
import * as RN from 'react-native';
import * as Phosphor from 'phosphor-react-native';
import * as Theme from '@pennyspring/theme';
import * as UI from '../index';

const ReactLiveScope: Record<string, unknown> = {
  React,
  ...React,
  ...RN,
  ...Phosphor,
  ...Theme,
  ...UI,
};

export default ReactLiveScope;
