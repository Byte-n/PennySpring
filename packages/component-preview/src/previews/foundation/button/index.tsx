import React from 'react';
import { Button } from '@pennyspring/component';
import {
  CheckIcon,
  PlusIcon,
  TrashIcon,
} from 'phosphor-react-native';
import { useTheme } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const BUTTON_SIZES = ['small', 'normal', 'large'] as const;

export function ButtonPreview() {
  const { token } = useTheme();

  return (
    <PreviewScaffold>
      <PreviewSection title="Type">
        <PreviewRow>
          <Button type="primary">Primary</Button>
          <Button>Default</Button>
          <Button type="dashed">Dashed</Button>
          <Button type="text">Text</Button>
          <Button type="link">Link</Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Color and variant">
        <PreviewRow>
          <Button color="green" variant="solid">
            Green
          </Button>
          <Button color="gold" variant="filled">
            Gold
          </Button>
          <Button danger>Danger</Button>
          <Button color="purple" variant="outlined">
            Outlined
          </Button>
          <Button color="cyan" variant="dashed">
            Dashed
          </Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Size and shape">
        <PreviewRow>
          {BUTTON_SIZES.map(size => (
            <Button key={size} size={size}>
              {size}
            </Button>
          ))}
          <Button shape="round" type="primary">
            Round
          </Button>
          <Button
            accessibilityLabel="Add"
            icon={
              <PlusIcon
                color={token.colorPrimaryText}
                size={token.fontSizeLG}
              />
            }
            shape="circle"
          />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Icon and state">
        <PreviewRow>
          <Button
            icon={
              <CheckIcon
                color={token.colorTextLightSolid}
                size={token.fontSizeLG}
              />
            }
            type="primary"
          >
            Confirm
          </Button>
          <Button
            icon={
              <TrashIcon color={token.colorErrorText} size={token.fontSizeLG} />
            }
            iconPlacement="end"
            danger
          >
            Remove
          </Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Block">
        <Button block type="primary">
          Block button
        </Button>
      </PreviewSection>
    </PreviewScaffold>
  );
}
