module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    'react-native-reanimated/plugin',
    [
      'inline-import',
      {
        extensions: ['.sql'],
      },
    ],
    [
      'module-resolver',
      {
        alias: {
          tslib: './node_modules/tslib/tslib.es6.js',
        },
      },
    ],
  ],
};
