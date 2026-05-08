jest.mock('@pennyspring/theme', () => ({
  createUseSheetStyle:
    (factory: (token: Record<string, unknown>) => Record<string, unknown>) =>
    () =>
      factory({
        borderRadius: 8,
        borderRadiusSM: 4,
        colorBgContainer: 'container',
        colorBgElevated: 'elevated',
        colorBgLayout: 'layout',
        colorBgSpotlight: 'spotlight',
        colorBorderSecondary: 'border',
        colorErrorText: 'error',
        colorIcon: 'icon',
        colorPrimaryText: 'primary',
        colorSplit: 'split',
        colorTextLightSolid: 'light',
        colorTextSecondary: 'secondary',
        controlHeight: 44,
        controlHeightLG: 55,
        controlItemBgActive: 'active',
        controlItemBgHover: 'hover',
        fontSize: 16,
        fontSizeHeading3: 24,
        fontSizeLG: 17,
        fontSizeSM: 14,
        fontSizeXL: 20,
        lineWidth: 1,
        lineWidthBold: 2,
        marginXXS: 4,
        marginXS: 8,
        marginSM: 12,
        padding: 16,
        paddingMD: 20,
        paddingSM: 12,
        paddingXS: 8,
      }),
  ThemePreview: function ThemePreview() {
    return null;
  },
  useTheme: () => ({
    token: {
      colorIcon: 'icon',
      colorPrimaryText: 'primary',
      colorTextLightSolid: 'light',
      fontSizeHeading3: 24,
      fontSizeLG: 17,
      fontSizeXL: 20,
      lineWidth: 1,
      lineWidthBold: 2,
    },
  }),
}));

jest.mock('@pennyspring/component', () => {
  const component = function Component() {
    return null;
  };

  return {
    Avatar: Object.assign(component, { Group: component }),
    Button: component,
    Calendar: Object.assign(component, { Range: component }),
    Card: component,
    Drawer: component,
    Grid: Object.assign(component, { Item: component }),
    Input: component,
    List: Object.assign(component, { Item: component }),
    ListCollapse: component,
    ListGroup: component,
    SelectionList: Object.assign(component, { Popup: component }),
    Portal: component,
    PortalProvider: component,
    Text: component,
    Textarea: component,
  };
});

describe('component preview registry', () => {
  it('registers the existing theme preview', () => {
    // Arrange
    const { ThemePreview } = require('@pennyspring/theme');
    const {
      COMPONENT_PREVIEW_SECTIONS,
      getComponentPreviewById,
    } = require('../src/previews/registry');

    // Act
    const themePreview = getComponentPreviewById('theme');
    const foundationSection = COMPONENT_PREVIEW_SECTIONS.find(
      (section: { id: string }) => section.id === 'foundation',
    );

    // Assert
    expect(themePreview).toEqual(
      expect.objectContaining({
        id: 'theme',
        title: 'Theme',
        component: ThemePreview,
      }),
    );
    expect(foundationSection?.items.map((item: { id: string }) => item.id)).toContain(
      'theme',
    );
  });
});
