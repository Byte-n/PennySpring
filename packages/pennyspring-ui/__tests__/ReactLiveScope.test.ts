export {};

const fs = require('fs') as {
  readFileSync: (filePath: string, encoding: string) => string;
};

describe('ReactLiveScope', () => {
  it('exposes phosphor-react-native icons for editable preview demos', () => {
    const source = fs.readFileSync(
      'packages/pennyspring-ui/src/theme/ReactLiveScope.tsx',
      'utf8',
    );

    expect(source).toContain("import * as Phosphor from 'phosphor-react-native';");
    expect(source).toContain('...Phosphor,');
  });

  it('exposes react-native-reanimated APIs for editable preview demos', () => {
    const source = fs.readFileSync(
      'packages/pennyspring-ui/src/theme/ReactLiveScope.tsx',
      'utf8',
    );

    expect(source).toContain(
      "import * as Reanimated from 'react-native-reanimated';",
    );
    expect(source).toContain('...Reanimated,');
  });
});
