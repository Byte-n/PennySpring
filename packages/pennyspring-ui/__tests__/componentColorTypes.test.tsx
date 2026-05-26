import type { BadgeColor } from '../src/Badge';
import type { ButtonColor } from '../src/Button';
import type { IconColor } from '../src/Icon';
import type { SwipeActionColor } from '../src/SwipeAction';
import type { TagColor } from '../src/Tag';
import type { TextColor } from '../src/Text';

describe('component color types', () => {
  it('keeps surface colors scoped to semantic and preset keys', () => {
    const badgePreset: BadgeColor = 'lime';
    const buttonPreset: ButtonColor = 'blue';
    const tagSemantic: TagColor = 'warning';
    const swipeActionPreset: SwipeActionColor = 'gold';

    expect(badgePreset).toBe('lime');
    expect(buttonPreset).toBe('blue');
    expect(tagSemantic).toBe('warning');
    expect(swipeActionPreset).toBe('gold');
  });

  it('rejects alias tokens and custom strings for surface colors', () => {
    // @ts-expect-error Button color does not accept alias token keys.
    const buttonAlias: ButtonColor = 'colorPrimary';
    // @ts-expect-error Tag color does not accept alias token keys.
    const tagAlias: TagColor = 'colorSuccessText';
    // @ts-expect-error Badge color does not accept custom color strings.
    const badgeCustom: BadgeColor = '#123456';
    // @ts-expect-error Swipe action color does not accept alias token keys.
    const swipeActionAlias: SwipeActionColor = 'colorError';

    expect(buttonAlias).toBe('colorPrimary');
    expect(tagAlias).toBe('colorSuccessText');
    expect(badgeCustom).toBe('#123456');
    expect(swipeActionAlias).toBe('colorError');
  });

  it('keeps foreground colors scoped to semantic and alias token keys', () => {
    const textSemantic: TextColor = 'secondary';
    const textAlias: TextColor = 'primaryText';
    const iconSemantic: IconColor = 'primary';
    const iconAlias: IconColor = 'icon';

    expect(textSemantic).toBe('secondary');
    expect(textAlias).toBe('primaryText');
    expect(iconSemantic).toBe('primary');
    expect(iconAlias).toBe('icon');
  });

  it('rejects custom strings and preset-only keys for foreground colors', () => {
    // @ts-expect-error Text color does not accept custom color strings.
    const textCustom: TextColor = '#123456';
    // @ts-expect-error Text color does not accept preset-only keys.
    const textPreset: TextColor = 'blue';
    // @ts-expect-error Icon color does not accept custom color strings.
    const iconCustom: IconColor = '#123456';
    // @ts-expect-error Icon color does not accept preset-only keys.
    const iconPreset: IconColor = 'gold';

    expect(textCustom).toBe('#123456');
    expect(textPreset).toBe('blue');
    expect(iconCustom).toBe('#123456');
    expect(iconPreset).toBe('gold');
  });
});
