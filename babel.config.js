module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
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
