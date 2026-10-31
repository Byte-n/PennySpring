import { Row, Text } from '@pennyspring/ui';
import { useTheme } from '@pennyspring/ui';
import { Pressable } from 'react-native';
import { ListIcon } from 'phosphor-react-native';
import { APP_NAME } from '../../constants/app.ts';

interface HomeHeaderLeftProps {
  onMenuPress: () => void;
}

export function HomeHeaderLeft({ onMenuPress }: HomeHeaderLeftProps) {
  const { token } = useTheme();
  return (
    <Row align="center" gap="normal">
      <Pressable onPress={onMenuPress}>
        <ListIcon size={28} color={token.colorText} />
      </Pressable>
      <Text numberOfLines={1} size="lg" weight="strong">
        {APP_NAME}
      </Text>
    </Row>
  );
}
