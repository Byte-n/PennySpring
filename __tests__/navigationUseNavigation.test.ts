const mockUseNavigation = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockUseNavigation(),
}));

describe('navigation useNavigation', () => {
  beforeEach(() => {
    mockUseNavigation.mockReset();
  });

  it('returns the underlying React Navigation object', () => {
    const navigation = {
      navigate: jest.fn(),
    };

    mockUseNavigation.mockReturnValue(navigation);

    const { useNavigation } = require('../src/navigation/useNavigation');

    expect(useNavigation()).toBe(navigation);
    expect(mockUseNavigation).toHaveBeenCalledTimes(1);
  });
});
