import React from 'react';
import * as RN from 'react-native';
import * as Theme from '../index';

const ReactLiveScope: Record<string, unknown> = {
  React,
  ...React,
  ...RN,
  ...Theme,
};

export default ReactLiveScope;
